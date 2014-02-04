module.exports = function(storage, hints, callback){
    if(!$.types.isArray(hints)) hints = [hints,];

    var searchKey = [], searchSubject = [], defaultEncoding;

    for(var i in hints){
        var hint = hints[i];
        if($.types.isBuffer(hint)) hint = hint.toString('ascii');
        if($.types.isString(hint)){
            if(!/^[0-9a-z_\(\)\[\]\.]+$/i.test(hint)) continue;
            if(
                /^[0-9a-f]+$/i.test(hint) &&
                hint.length % 2 == 0
            )
                searchKey.push(hint.toLowerCase());
            searchSubject.push(hint.toLowerCase());
        };
    };

    var match = [];
   
    var allIdentities = storage.table('identity')(), cachedIdentities = {};
    for(var key in allIdentities){
        try{
            var identity = _.package.parse(allIdentities[key]);
            if(identity[0] != 'identity') continue;
            cachedIdentities[key] = 
                identity[1].content.subject.toString().toLowerCase();
        } catch(e){
            continue;
        };
    };
    delete allIdentities;

    for(var key in cachedIdentities){
        var keyFound = false;        
        for(var i in searchKey){
            if(key.startsWith(searchKey[i])){
                keyFound = true;
                match.push(cachedIdentities[key]);
                break;
            };
        };
        if(keyFound) delete searchKey[i];

        for(var i in searchSubject){
            if(
                cachedIdentities[key].toLowerCase().indexOf(searchSubject[i])
                >= 0
            )
                match.push(cachedIdentities[key]);
        };
    };

    callback(null, match);
};
