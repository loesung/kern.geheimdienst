function add(storage){
    var self = this;

    this.add = require('./sharedsecret.js')(storage);

    return this;
};

module.exports = function(s){
    return new add(s);
};
