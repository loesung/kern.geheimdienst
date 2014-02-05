/*
 * GLOBAL SETTINGS FOR DEFAULT CODEBOOK ADDITION
 */

// Default codebook life(seconds). Default 2592000 equals to 30 days.
DEFAULT_CODEBOOK_LIFE = 2592000;

function add(storage){
    var self = this;

    this.sharedsecret = require('./sharedsecret.js')(storage);

    return this;
};

module.exports = function(s){
    return new add(s);
};
