/*
 * GLOBAL SETTINGS FOR DEFAULT CODEBOOK ADDITION
 */

// Default codebook life(seconds). Default 2592000 equals to 30 days.
DEFAULT_CODEBOOK_LIFE = 2592000;

// Max. codebook life(seconds). Default 315360000 equals to 10 years.
CODEBOOK_LIFE_MAX = 315360000;

// Min. codebook life(seconds). Default 3600 equals to 1 hour. 
CODEBOOK_LIFE_MIN = 3600;

function add(storage, core){
    var self = this;

    this.sharedsecret = require('./sharedsecret.js')(storage, core);

    return this;
};

module.exports = function(s, c){
    return new add(s, c);
};
