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

/*
class OTRSession:

    _database = None


    INIT_METHOD_SHAREDSECRET = 1
    INIT_METHOD_CODEBOOK = 2
    INIT_METHOD_PGPLETTER = 4

    _session_id = None
    _store_piece = None

    def __init__(self, database):
        self._database = database
        self._init_message = self._init_message.strip()

    def new(self, buddy_identity, method, **argv):
        if method not in [1,2,4]:
            raise Exception("Unrecognized initialization method.")

        buddy_id = buddy_identity.get_id()
        if buddy_id == None:
            raise Exception("Invalid buddy id.")

        sharedsecret = ''
        if method == 1:
            sharedsecret = argv['shared_secret']
        elif method == 2:
            pass
        elif method == 4:
            pass

        hasher = hash_generator()
        sharedsecret = hasher.option({
            'algorithm': 'WHIRLPOOL',
            'output_format': 'raw',           
        }).digest(sharedsecret)

        authenticate_key = self._derive_authenticate_key(sharedsecret)

        chaos = \
            hasher.option('algorithm', 'MD5').digest(authenticate_key)

        session_id = get_uuid(chaos)

        piece = {
            'begin_time': time.time(),
            'shared_secret': sharedsecret,
            'send': [],
            'receive': [],
            'buddy_id': buddy_id,
        }

        self._database.set('otrsessions', session_id, piece)
        if False != self.load(session_id):
            self.set_send(self._init_message)
            return session_id

        return False

    def load(self, session_id):
        self._session_id = None
        self._store_piece = self._database.get('otrsessions', session_id)
        if self._store_piece != None and type(self._store_piece) == dict:
            self._session_id = session_id
            return session_id
        return False

    def terminate(self):
        """Terminate a Session

        The shared secret will be removed. This session ID, however, will be
        kept with storing its authenticate key."""
        if self._session_id:
            self._store_piece = self._derive_authenticate_key(
                self._store_piece['shared_secret']
            )
        self._session_id = None

    def set_send(self, plaintext):
        if not self._session_id:
            return False

        if len(plaintext) > len(self._init_message):
            # This will lead to impossible of forging our session.
            return False

        sharedsecret = self._store_piece['shared_secret']

        authenticator = hash_generator().option({
            'HMAC': self._derive_authenticate_key(sharedsecret),
            'algorithm': 'SHA-1',
            'output_format': 'RAW',
        })

        plaintext_HMAC = authenticator.digest(plaintext)

        new_plaintext = plaintext_HMAC + plaintext

        ciphertext = xipher(sharedsecret).encrypt(new_plaintext)

        packet_core = {
            'ciphertext': ciphertext,
            'timestamp': time.time(),
        }
        packet_hash = object_hasher('SHA-1').hash(packet_core)
        packet_sign = authenticator.digest(packet_hash)

        packet = {
            'HMAC': packet_sign,
            'core': packet_core,
            'session_id': self._session_id,
        }

        self._store_piece['send'].append(packet)

        return True

    def set_receive(self, packet):
        try:
            packet_sign, packet_core, session_id = \
                packet['HMAC'], packet['core'], packet['session_id']

            self.load(session_id)
            if self._session_id == None:
                return False

            sharedsecret = self._store_piece['shared_secret']
            authenticator = hash_generator().option({
                'HMAC': self._derive_authenticate_key(sharedsecret),
                'algorithm': 'SHA-1',
                'output_format': 'RAW',
            })

            packet_hash = object_hasher('SHA-1').hash(packet_core)
            packet_sign2 = authenticator.digest(packet_hash)
            if packet_sign2 != packet_sign:
                return False

            ciphertext = packet_core['ciphertext']
            timestamp = packet_core['timestamp']

            plaintext = xipher(sharedsecret).decrypt(ciphertext)
            head_length = len(packet_sign2)
            HMAC_head = plaintext[:head_length] # equals to such length
            plaintext = plaintext[head_length:]

            self._store_piece['receive'].append({
                'plaintext': plaintext,
                'timestamp': timestamp,
                'buddy_id': self._store_piece['buddy_id'],
            })

            return True

        except Exception,e:
            raise Exception('Error loading OTR packet - %s' % e)
             
    def get_send(self):
        return self._store_piece['send'].pop(0)

    def get_receive(self):
        return self._store_piece['receive'].pop(0)

    def _derive_authenticate_key(self, sharedsecret):
        return hash_generator().option({
            'algorithm': 'SHA-1',
            'output_format': 'RAW'
        }).digest(sharedsecret)
*/
