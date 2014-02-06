function util(storage){
    var self = this;

    this.filter = require('./filter')(storage);

    return this;
};

module.exports = function(storage){
    return new util(storage);    
};
