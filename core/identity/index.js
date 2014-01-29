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
        require('./add.js')(storage, content.subject, callback);
    };

    return this;
};
