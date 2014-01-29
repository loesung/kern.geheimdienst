var add = require('./add.js');

module.exports = function(storage){
    return new identity(storage);
};

function identity(storage){
    var self = this;

    this.list = function(hints, callback){
        /*
         * `hints` is mandatory. give `null` if you want to list all items.
         */
        require('./list.js')(storage, hints, callback);
    };

    this.add = function(content, callback){
        if($.types.isBuffer(content) || $.types.isString(content))
            add.fromPacked(storage, content, callback);
        else
            add.fromObject(storage, content, callback);
    };

    return this;
};
