function core(storage){
    var self = this;

    this.encrypt = require('./encrypt')(storage);
    this.decrypt = require('./decrypt')(storage);
    this.identity = require('./identity')(storage);
    this.codebook = require('./codebook')(storage);

    return this;
};

module.exports = function(storage){
    return new core(storage);
};
