require('./config.js');

function core(storage){
    var self = this;

    this._util = require('./_util')(storage);

    this.system = require('./system')(storage);

    this.encrypt = require('./encrypt')(storage, this);
    this.decrypt = require('./decrypt')(storage, this);
    this.identity = require('./identity')(storage, this);
    this.codebook = require('./codebook')(storage, this);

    return this;
};

module.exports = function(storage){
    return new core(storage);
};
