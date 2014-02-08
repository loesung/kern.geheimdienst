//FIXME adapt to the codebook search scheme.

module.exports = function(storage, hints, callback){
    var searchKey = [], searchMember = [], listAll = false, defaultEncoding;

    if(!hints) listAll = true;
    if(!$.types.isArray(hints)) hints = [hints,];

    for(var i in hints){
        var hint = hints[i];
        if($.types.isBuffer(hint)) hint = hint.toString('hex');
        if($.types.isString(hint)){
            if(!/^[0-9a-f]+$/i.test(hint)) continue;
            if(hint.length % 2 == 0)
                searchKey.push(hint.toLowerCase());
            searchMember.push(hint.toLowerCase());
        };
    };

    var match = {};

    // load all codebooks from storage and parse into object.
    var allCodebooks = storage.table('codebook')(), cachedCodebooks = {};
    for(var key in allCodebooks){
        try{
            var codebook = _.package.parse(allCodebooks[key]);
            if(codebook[0] != 'codebook') continue;
            cachedCodebooks[key] = codebook[1].content.members;
        } catch(e){
            continue;
        };
    };

    if(listAll) return callback(null, cachedCodebooks);

    // search cached codebooks
    for(var key in cachedCodebooks){
        var keyFound = false;        
        for(var i in searchKey){
            if(key.startsWith(searchKey[i])){
                keyFound = true;
                match.push(cachedCodebooks[key]);
                break;
            };
        };
        if(keyFound) delete searchKey[i];

        for(var i in searchMember){
            for(var j in cachedCodebooks[key].members){
                if(
                    cachedCodebooks[key].members[j].toString('hex')
                        .startsWith(searchMember[i])
                )
                    match[key] = cachedCodebooks[key];
            };
        };
    };

    callback(null, match);
};
