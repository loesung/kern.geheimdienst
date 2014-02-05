// Min. length of a sharedsecret.
MIN_SHAREDSECRET_LENGTH = 32;

module.exports = function(storage){
    return function(memberIDs, sharedsecret, options, callback){
        
        // regulate member IDs
        var members = [];
        for(var i in memberIDs){
            var memberID = memberIDs[i];
            if($.types.isBuffer(memberID))
                memberID = memberID.toString('hex');
            if($.types.isString(memberID)){
                memberID = memberID.toLowerCase();
                if(!/^[0-9a-f]$/.test(memberID)) continue;
                if(!storage.table('identity')(memberID))
                    return callback(Error('member-not-recognized'));
                members.push(memberID);
            };
        };
        members.sort();
        for(var i in members)
            members[i] = new $.nodejs.buffer.Buffer(members[i], 'hex');


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
        

        var workflow = [];

        // derive credential
        workflow.push(function(callback){
            $.nodejs.crypto.pbkdf2(
                sharedsecret,
                'CODEBOOK-DERIVED-BY-SHAREDSECRET', // cannot be negotiated.
                1024,
                1024,
                callback
            );
        });

        // generate entry
        workflow.push(function(derivedKey, callback){
            var id = _.digest.whirlpool(derivedKey);
            var entry = {
                members: members,
                credential: derivedKey,
                validAfter: validAfter,
                validTo: validTo,
                id: id,
            };
        });
        
        // save to storage
        
    };
};
