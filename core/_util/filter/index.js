function filter(storage){
    var self = this;

    this.identityIDs = require('./identityIDs.js')(storage);
    this.codebookIDs = require('./codebookIDs.js')(storage);

    return this;
};

module.exports = function(storage){
    return new filter(storage);
};
