/*
 * Generation of public keys
 *
 * Return status code:
 *  400: bad request field.
 *  501: not implemented. should appear only in debugging.
 *
 */
var enumerator = _.object.enumerate.pki;

function RSASignOnly(bits, dataSource, identityID){
    return function(callback){
        // bits is assured to be proper value.
        var rsa = _.asymcrypt.signing('rsa');

        var workflow = [
            function(callback){
                rsa.generate(bits, callback);
            },

            function(callback){
                callback(
                    null,
                    rsa.getPrivateKey(),
                    rsa.getPublicKey()
                );
            },

            // construct new key
            function(rawPrivateKey, rawPublicKey, callback){
                var newKey = {
                    keyAlgo: enumerator.keyAlgo['RSA' + bits + 'SignOnly'],
                    keyClass: enumerator.keyClass.PRIVATE,
                    keyPrivate: rawPrivateKey.toString('base64'),
                    keyPublic: rawPublicKey.toString('base64'),
                };

                callback(null, newKey);
            },

            // firstSign, self sign.
            function(newKey, callback){
                var publicKey = {
                    keyAlgo: newKey.keyAlgo,
                    keyClass: enumerator.keyClass.PUBLIC,
                    keyPublic: newKey.keyPublic,
                };
                
                // from this also derive the key Fingerprint
                var keyFingerprint = new $.nodejs.buffer.Buffer(
                    _.object.hash(publicKey),
                    'hex'
                );

                var beingSigned = {
                        identityID: identityID,
                        keyFingerprint: keyFingerprint.toString('base64'),
                    }
                ;
                var beingSignedHash = new $.nodejs.buffer.Buffer(
                    _.object.hash(beingSigned),
                    'hex'
                );

                rsa.sign(
                    beingSignedHash,
                    function(err, signature){
                        if(null != err) return callback(err);
                        callback(null, newKey, keyFingerprint, {
                            signer: keyFingerprint.toString('base64'),
                            signed: beingSigned,
                            signature: signature.toString('base64'),
                        });
                    }
                );
            },

            // generate key record = (newKey, keyTrustChain)
            function(keyEntry, keyFingerprint, firstSign, callback){
                var keyRecord = {
                    keyEntry: keyEntry,
                    keyTrustChain: [firstSign],
                };

                callback(null, keyFingerprint.toString('hex'), keyRecord);
            },
        ];

        $.nodejs.async.waterfall(
            workflow,
            function(err, keyFingerprint, keyRecord){
                dataSource.pki(keyFingerprint, keyRecord);
                callback(null, keyRecord);
            }
        );
    };
};

function MSS224SignOnly(dataSource, identityID){
    return function(callback){
        callback(501);
    };
};

module.exports = function(dataSource){
    return function(data, callback){
        var keyAlgo = enumerator.keyAlgo[data.post.algorithm],
            identityID = 
                _.object.test.identity.id(data.post.identity) && 
                data.post.identity.toLowerCase();

        if(
            (undefined == keyAlgo) ||
            (false == identityID)
        ){
            return callback(400, {
                keyAlgo: Object.keys(enumerator.keyAlgo),
            });
        };

        switch(keyAlgo){
            case enumerator.keyAlgo.RSA2048SignOnly:
                return RSASignOnly(2048, dataSource, identityID)(callback);
            case enumerator.keyAlgo.RSA3072SignOnly:
                return RSASignOnly(3072, dataSource, identityID)(callback);
            case enumerator.keyAlgo.RSA4096SignOnly:
                return RSASignOnly(4096, dataSource, identityID)(callback);
            case enumerator.keyAlgo.RSA8192SignOnly:
                return RSASignOnly(8192, dataSource, identityID)(callback);
            case enumerator.keyAlgo.MSS224SignOnly:
                return MSS224SignOnly(dataSource, identityID)(callback);
            default: 
                return callback(400);
        };

        return callback(501); // leakage
    };
};
