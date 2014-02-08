function codebook(storage, core){
    var self = this;

    this.list = function(hints, callback){
        require('./list.js')(storage, hints, callback);
    };

    this.add = require('./add')(storage, core);

    return this;
};

module.exports = function(s, c){
    return new codebook(s, c);
};
