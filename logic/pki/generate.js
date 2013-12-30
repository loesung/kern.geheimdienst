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
                    keyClass: enumerator.keyClass.PRIVATE,

                };

                callback(null, newKey);
            },

            // firstSign, self sign.
            function(newKey, callback){
                var beingSigned = {
                    keyClass: enumerator.keyClass.PUBLIC,

                }; //actually a public key entry. TODO from this also derive the key ID.

                var firstSign = false;

                callback(null, newKey, firstSign);
            },

            // generate key record = (newKey, keyTrustChain)
            function(keyEntry, firstSign, callback){
                var keyID = false; //TODO = hash(keyentry)

                var keyRecord = {
                    keyEntry: keyEntry,
                    keyTrustChain: [firstSign],
                };

                callback(null, keyID, keyRecord);
            },
        ];

        $.nodejs.async.waterfall(workflow, function(err, keyID, keyRecord){
            dataSource.pki(keyID, keyRecord);
            // TODO update index of corresponding identity.
            callback(null);
        });
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
