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

    return this;
};
