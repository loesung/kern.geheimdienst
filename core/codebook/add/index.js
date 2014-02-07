function add(storage, core){
    var self = this;

    this.sharedsecret = require('./sharedsecret.js')(storage, core);

    return this;
};

module.exports = function(s, c){
    return new add(s, c);
};
