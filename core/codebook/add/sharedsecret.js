// Min. length of a sharedsecret.
MIN_SHAREDSECRET_LENGTH = 32;

module.exports = function(storage, core){
    return function(memberIDs, sharedsecret, options, callback){
        if(!callback){
            // options is not given, shift the parameter
            callback = options;
            options = {};
        };
        var workflow = [], members;

        // set validate date range
        var validAfter = Math.round(new Date().getTime() / 1000);
        var validTo = validAfter + DEFAULT_CODEBOOK_LIFE; 

        if($.types.isNumber(options.validAfter))
            validAfter = options.validAfter;

        if($.types.isNumber(options.validTo))
            validTo = options.validTo;

        if(!(
            validTo - validAfter >= CODEBOOK_LIFE_MIN &&
            validTo - validAfter <= CODEBOOK_LIFE_MAX &&
            validAfter > 0
        ))
            return callback(Error('invalid-codebook-lifecycle'));

        // check `sharedsecret`
        if(!$.types.isBuffer(sharedsecret))
            return callback(Error('sharedsecret-not-buffer'));

        //////////////////////////////////////////////////////////////
        
        // regulate member IDs
        workflow.push(function(callback){
            core._util.filter.identityIDs(memberIDs, function(err, result){
                if(null == err) members = result;
                callback(err);
            });
        });

        // Derive credential, note that member list is also taken into
        // consideration.
        workflow.push(function(callback){
            var salt = $.nodejs.buffer.Buffer.concat(members);
            $.nodejs.crypto.pbkdf2(
                sharedsecret,
                salt,
                1024,
                256,
                callback
            );
        });

        // generate entry
        workflow.push(function(derivedKey, callback){
            var id = _.digest.whirlpool(derivedKey),
                strID = id.toString('hex');

            // check if duplicated
            if(storage.table('codebook')(strID)){
                return callback(Error('codebook-already-exists'));
            };

            var entry = {
                members: members,
                credential: derivedKey,
                validAfter: validAfter,
                validTo: validTo,
                id: id,
            };

            var strCodebook = _.package.armoredPack('codebook', entry);

            // save to storage
            storage.table('codebook')(strID, strCodebook);

            callback(null, strCodebook);
        });

        $.nodejs.async.waterfall(workflow, callback);
    };
};
