module.exports = function(s){
    return new decrypt(s);
};

function decrypt(storage){
    var self = this;

    this.examine = require('./examine.js')(storage); 
    this.do = require('./do.js')(storage);

    return this;
};
