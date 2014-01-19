function core(storage){
    var self = this;

    this.encrypt = require('./encrypt/__init__.js')(storage);

    this.decrypt = {
    };

    return this;
};

module.exports = function(storage){
    return new core(storage);
};
