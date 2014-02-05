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

        // set validate date range
        var validAfter = Math.round(new Date().getTime() / 1000);
        var validTo = validAfter + DEFAULT_CODEBOOK_LIFE; 
        
        // derive credential
        
        // save to storage
        
    };
};
