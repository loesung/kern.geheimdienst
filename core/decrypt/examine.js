module.exports = function(storage){
    // examine a ciphertext
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
