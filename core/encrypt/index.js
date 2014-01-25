/*
 * GLOBAL SETTINGS FOR ENCRYPTION
 *
 * Modifying following global values is not encouraged, unless you definitely
 * know what are you doing.
 */

// Default bytes for a encryption key, used for actual encryption of data.
DEFAULT_ENCRYPT_KEY_LENGTH = 128;

// Acceptable min. length of passphrase in bytes.
PASSPHRASE_MIN_LENGTH = 20;

//////////////////////////////////////////////////////////////////////////////

function encrypt(storage){
    var self = this;

    this.withPassphrases = require('./withPassphrases.js');

    return this;
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function(s){
    return new encrypt(s);
};
