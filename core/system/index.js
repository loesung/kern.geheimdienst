function system(storage){
    var self = this;

    this.optimize = require('./optimize.js')(storage);

    return this;
};

module.exports = function(storage){
    return new system(storage);
};
