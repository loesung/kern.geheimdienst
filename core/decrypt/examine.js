module.exports = function(storage){
    /* examine a ciphertext
     *
     * the idea is to find out, what a form the user is expected to give.
     * shall a private key in database doesn't exist, a failure should also
     * be given out.
     */
    return function(message, callback){
        var overview = _.package.parse(message);
        if(null == overview) return callback(Error('unrecognized-data'));

        var dataType = overview[0], data = overview[1];
        
        switch(dataType){
            case 'ciphertextWithPassphrases':
                callback(null, data.passphrases);
                break;
            default:
                callback(Error('non-ciphertext'));
                break;
        };
    };
};
