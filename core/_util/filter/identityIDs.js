/*
 * filter identity IDs
 *
 * This function will convert input, most probably user-input, into an array
 * of identityID in Buffer form.
 *
 * User input is expected to be an array, or a single item in this array.
 * In each case, an item is either a string or a buffer. When a string is
 * provided, it is expected to be a HEX-encoded string and will be directly
 * used in looking up the database. 
 *
 * The result is an array of identity ID, each in buffer format.
 * When one or more identity ID in input cannot be found in database, errors
 * will be sent by calling back. Therefore this is not a simple format
 * checking tool.
 */

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
