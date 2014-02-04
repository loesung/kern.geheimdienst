function codebook(storage){
    var self = this;

    this.list = null;

    this.add = require('./add')(storage);

    return this;
};

module.exports = function(s){
    return new codebook(s);
};
