/*
 * OTR model
 * =========
 *
 * This model provides an abstract layer of OTR protocol. The OTR instance as
 * an EventEmitter will emit 'receive' and 'send' events.
 *
 * --------------------------------------------------------------------------
 *                                  NOTICE
 * This OTR model is different from the protocol specified by Cyperpunk! They
 * are completely incompatiable.
 * --------------------------------------------------------------------------
 *
 * You may initialize an instance by either create() it brandly new, or by
 * importKey() to import a new key.
 *
 * This is only an abstract layer for easing the use case of OTR session. You
 * should use other ways to combine the OTR session with key managements.
 *
 *
 * EVENTS
 * ------
 *  error, send, receive. You should listen on all these 3 events.
 *  o 'send' will be a signal, when the OTR session regards that user should
 *    send something.
 *  o 'receive' will be a signal, when the OTR provides the user with a
 *    decrypted and verified message.
 *  o 'error' will be signal, when the OTR found something error in processing
 *    messages being send or received.
 *
 *
 * Details of our model
 * --------------------
 *  we define:
 *      EncKey = Hash(SS)
 *      AuthKey = Hash(EncKey)
 *  where SS is the sharedsecret, shared by Alice and Bob previously using
 *  a proper key management protocol. 
 *
 *  to send message, Alice should:
 *   1. prepare her message M
 *   2. MsgKey = randomBytes(..)
 *   3. MsgKeyHint = encrypt(MsgKey, EncKey)
 *   3. MsgKeyAuth = HMAC(MsgKeyHint, AuthKey)
 *   4. ciphertext = encrypt(M, MsgKey)
 *  and send:(MsgKeyHint, MsgKeyAuth, ciphertext) to Bob.
 *
 *  on receiving the message, Bob should:
 *   1. validate the MsgKeyHint' using his known AuthKey and received 
 *      MsgKeyAuth.
 *   2. decrypt MsgKeyHint' and get MsgKey.
 *   3. use MsgKey to decrypt ciphertext.
 *   (the encrypt() function here is a function combines pure encryption and
 *    integrity check. If decrypt() is successful, the integrity is also
 *    assured.)
 *
 *  observing:
 *   1. MsgKey is arbitary and remains authentic, when AuthKey is known and 
 *      only known to Alice and Bob. But when AuthKey is public, anyone can 
 *      forge a valid pair of MsgKey and MsgKeyAuth, and use the forged MsgKey
 *      to encrypt his forged message.
 *   2. when AuthKey is public, EncKey remains secure. And therefore previous
 *      transmitted MsgKeyHint remains secure. Eve can not decrypt previous 
 *      sent messages, which are encrypted with MsgKey, the only way to derive
 *      which is by using EncKey to decrypt the MsgKeyHint.
 *   3. the encryption algorithm may not necessarily be a stream cipher,
 *      because knowing AuthKey will lead to a completely freedom of choosing
 *      a MsgKey.
 *
 */

//////////////////////////////////////////////////////////////////////////////

function otr($, _, sharedsecret){
    $.nodejs.events.EventEmitter.call(this);
    var self = this;
    
    var encKey = null, authKey = null;

    function constructEncryptedMessage(authKey, message, callback){
        var workflow = [], msgKeyBuffer, msgKeyAuth, msgKeyHint;

        // get MsgKey
        workflow.push(function(callback){
            // 128 bytes or 1024 bits, enough strong and should be enough
            // for a lot of years.
            //
            // be sure that this parameter will not lead to MKH larger than
            // 256 bytes(we will use only 1 byte to represent its length).
            $.security.random.bytes(128, callback);
        });

        // get MsgKeyHint
        workflow.push(function(randomBytes, callback){
            msgKeyBuffer = randomBytes;
            _.symcrypt.encryptEncoded(encKey, msgKeyBuffer, callback);
        });

        // get MsgKeyAuth
        workflow.push(function(hint, callback){
            msgKeyHint = hint;
            msgKeyAuth = _.digest.whirlpoolHmac(msgKeyHint, authKey);
            callback(null);
        });

        // encrypt message
        workflow.push(function(callback){
            _.symcrypt.encryptEncoded(msgKeyBuffer, message, callback);
        });

        $.nodejs.async.waterfall(workflow, function(err, result){
            if(null != err) return callback(err);
            var ciphertext = result;
            callback(null, {
                mkh: msgKeyHint,
                mka: msgKeyAuth,
                c: ciphertext,
            });
        });
    };

    function receiveEncryptedMessage(data, callback){
        /*  on receiving the message, Bob should:
         *   1. validate the MsgKeyHint' using his known AuthKey and received 
         *      MsgKeyAuth.
         *   2. decrypt MsgKeyHint' and get MsgKey.
         *   3. use MsgKey to decrypt ciphertext.
         */
        var workflow = [], msgKey;

        // verify MsgKeyAuth
        workflow.push(function(callback){
            var calMsgKeyAuth = _.digest.whirlpoolHmac(data.mkh, authKey);
            if(calMsgKeyAuth.toString() != data.mka.toString())
                return callback('invalid-message-key');
            callback(null);
        });

        // get msgKey
        workflow.push(function(callback){
            _.symcrypt.decryptEncoded(encKey, data.mkh, callback);
        });

        workflow.push(function(mk, callback){
            msgKey = mk;
            _.symcrypt.decryptEncoded(msgKey, data.c, callback);
        });

        $.nodejs.async.waterfall(workflow, function(err, result){
            if(null != err) return callback(err);
            callback(null, result);
        });
    };

    function initialize(key){
        encKey = key;
        authKey = _.digest.whirlpool(encKey);

        self.receive = function(ciphertext){
            if(ciphertext.length < 2) 
                return self.emit('error', 'invalid-otr-message');

            var mkhB = ciphertext.readUInt8(0),
                mkaB = ciphertext.readUInt8(1);
            ciphertext = ciphertext.slice(2);

            if(ciphertext.length < mkhB + mkaB)
                return self.emit('error', 'invalid-otr-message');

            var mkh = ciphertext.slice(0, mkhB),
                mka = ciphertext.slice(mkhB, mkhB + mkaB),
                c = ciphertext.slice(mkhB + mkaB);

            receiveEncryptedMessage(
                {mkh: mkh, mka: mka, c: c}, 
                function(err, result){
                    if(null != err) 
                        return self.emit('error', err);

                    self.emit('receive', result);
                }
            );
        };

        self.send = function(message){
            constructEncryptedMessage(authKey, message, function(err, result){
                if(err != null) 
                    return self.emit('error', 'cannot-generate-message');
                
                var mkhB = result.mkh.length,
                    mkaB = result.mka.length;

                var ret = $.nodejs.buffer.Buffer.concat([
                    new $.nodejs.buffer.Buffer([mkhB, mkaB]),
                    result.mkh,
                    result.mka,
                    result.c
                ]);
                self.emit('send', ret);
            });
        };

        delete self.importKey;
        delete self.create;
    };

    initialize(sharedsecret);

    return this;
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function($, _){
    $.nodejs.util.inherits(otr, $.nodejs.events.EventEmitter);
    return function(ss){
        return new otr($, _, ss);
    };
};

