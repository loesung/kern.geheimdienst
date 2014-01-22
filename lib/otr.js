/*
 * OTR model
 * =========
 *
 * This model provides an abstract layer of OTR protocol. The OTR instance as
 * an EventEmitter will emit 'receive' and 'send' events.
 *
 *
 *                                  NOTICE
 * This OTR model is different from the protocol specified by Cyperpunk! They
 * are completely incompatiable.
 *
 *
 * You may initialize an instance by either create() it brandly new, or by
 * importKey() to import a new key.
 *
 * This is only an abstract layer for easing the use case of OTR session. You
 * should use other ways to combine the OTR session with key managements.
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
 *   1. prepare here message M
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

function otr(){
    $.nodejs.events.EventEmitter.call(this);
    var self = this;
    
    var encKey = null, authKey = null;

    this.create = function(callback){
        $.security.random.bytes(
    };

    this.importKey = function(){
    };

    function constructEncryptedMessage(authKey, message, callback){
        var workflow = [], msgKeyBuffer, msgKeyAuth, msgKeyHint;

        // get MsgKey
        workflow.push(function(callback){
            $.security.random.bytes(128, callback);
        });

        // get MsgKeyHint
        workflow.push(function(randomBytes, callback){
            msgKeyBuffer = randomBytes;
            _.symcrypt.encrypt(encKey, msgKeyBuffer, callback);
        });

        // get MsgKeyAuth
        workflow.push(function(hint, callback){
            msgKeyHint = hint;
            msgKeyAuth = _.digest.whirlpoolHmac(msgKeyHint, authKey);
            callback(null);
        });

        // encrypt message
        workflow.push(function(callback){
            _.symcrypt.encrypt(msgKeyBuffer, message, callback);
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

    function initialize(key){
        self.exportKey = function(){
        };

        self.receive = function(){
        };

        self.send = function(){
        };

        delete self.importKey;
        delete self.create;
    };

    return this;
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function(){
    $.nodejs.util.inherits(otr, $.nodejs.events.EventEmitter);
    return new otr();
};

