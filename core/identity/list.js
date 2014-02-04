module.exports = function(storage, hints, callback){
    var searchKey = [], searchSubject = [], listAll = false, defaultEncoding;

    if(!hints) listAll = true;
    if(!$.types.isArray(hints)) hints = [hints,];

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

    var match = {};

    // load all identities from storage and parse into object.
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

    if(listAll) return callback(null, cachedIdentities);


    // search cached identities
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
                match[key] = cachedIdentities[key];
        };
    };
    delete cachedIdentities;

    callback(null, match);
};
