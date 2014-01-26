var decryptWithPassphrases = require('./withPassphrases.js');
//////////////////////////////////////////////////////////////////////////////

module.exports = function(storage){
    /* decrypt message
     * 
     * the ciphertext will be automatically recognized. the key should be
     * provided according to the answer provided by `core.decrypt.examine`.
     */
    return function(key, ciphertext, callback){
        var overview = _.package.parse(ciphertext);
        if(null == overview) return callback(Error('unrecognized-data'));

        var dataType = overview[0], data = overview[1];
        if(!dataType.startsWith('ciphertext'))
            return callback(Error('not-ciphertext'));

        switch(dataType){
            case 'ciphertextWithPassphrases':
                decryptWithPassphrases(key, data, callback);
                break;
            default:
                return callback(Error('unrecognized-data'));
        };
    };
};
