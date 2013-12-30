module.exports = function(dataSource){
    return function(data, callback){
        var identityID = data.get.id;
        if(!_.object.test.identity.id(identityID)) return callback(400);

        identityID = identityID.toLowerCase();

        var indexID = 'index-' + identityID,
            keysID = dataSource.pki(indexID),
            keyID, keyRecord, keyEntry;

        var ret = {},
            enumerator = _.object.enumerate.pki;

        for(var i in keysID){
            keyID = keysID[i];
            keyRecord = dataSource.pki(keyID);
            if(null == keyRecord) continue;

            keyEntry = keyRecord.entry;

            // read necessary info and record to 'ret'.
            var keyClass = enumerator.keyClass[keyEntry['keyClass']],
                keyAlgo = enumerator.keyAlgo[keyEntry['keyAlgo']];

            if(
                (undefined == keyClass) ||
                (undefined == keyAlgo)
            ) continue;

            ret.push({
                keyClass: keyClass,
                keyAlgo: keyAlgo,
            });
        };

        return callback(null, ret);
    };
};
