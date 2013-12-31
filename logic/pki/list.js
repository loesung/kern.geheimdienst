/*
 * List all keys that belongs to a given [identityID].
 *
 * This searchs all the keys in the database and look their [keyTrustChain].
 * If the [firstSign] have signed the given [identityID], then it will be
 * contained in the returning list.
 */

module.exports = function(dataSource){
    return function(data, callback){
        var identityID = data.get.id;
        if(!_.object.test.identity.id(identityID)) return callback(400);

        identityID = identityID.toLowerCase();

        var keys = dataSource.pki(),
            keyID, keyRecord, keyEntry;

        var ret = {},
            enumerator = _.object.enumerate.pki;

        for(var keyFingerprint in keys){
            keyRecord = keys[keyFingerprint];
            try{
                if(keyRecord.keyTrustChain[0].signed.identityID != identityID)
                    continue;
            } catch(e){
                continue;
            };

            keyEntry = keyRecord.keyEntry;
            
            // read necessary info and record to 'ret'.
            var keyClass = _.object.denumerate(
                    enumerator.keyClass,
                    keyEntry['keyClass']
                ),
                keyAlgo = _.object.denumerate(
                    enumerator.keyAlgo,
                    keyEntry['keyAlgo']
                )
            ;

            if(
                (undefined == keyClass) ||
                (undefined == keyAlgo)
            ) continue;

            ret[keyFingerprint] = {
                keyFingerprint: keyFingerprint,
                keyClass: keyClass,
                keyAlgo: keyAlgo,
            };
        };

        return callback(null, ret);
    };
};
