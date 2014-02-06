module.exports = function(storage){
    return function(memberIDs, callback){
        var members = [];
        if(!$.types.isArray(memberIDs))
            memberIDs = [memberIDs,];
        for(var i in memberIDs){
            var memberID = memberIDs[i];
            if($.types.isBuffer(memberID))
                memberID = memberID.toString('hex');
            if($.types.isString(memberID)){
                memberID = memberID.toLowerCase();
                if(!storage.table('identity')(memberID))
                    return callback(Error('member-not-recognized'));
                members.push(memberID);
            };
        };
        members.sort();
        for(var i in members)
            members[i] = new $.nodejs.buffer.Buffer(members[i], 'hex');

        callback(null, members);
    };
};
