module.exports = function(storage, hints, callback){
    if(!$.types.isArray(hints)) hints = [hints,];

    var search = [];

    for(var i in hints){
        var hint = hints[i];
        if($.types.isString(hint))
            hint = new $.nodejs.buffer.Buffer(hint);
        else if(!$.types.isBuffer(hint))
            continue;
        search.push(hint);
    };

    var allIdentites
};
