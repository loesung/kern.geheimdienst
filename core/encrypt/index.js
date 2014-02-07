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

var _encryptor = require('./_encryptor.js');

function encrypt(storage, core){
    var self = this;

    var encryptor = _encryptor(storage, core);

    this.withPassphrases = 
        require('./withPassphrases.js')(storage, core, encryptor);
    this.withCodebooks = 
        require('./withCodebooks.js')(storage, core, encryptor);

    return this;
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function(s, c){
    return new encrypt(s, c);
};
