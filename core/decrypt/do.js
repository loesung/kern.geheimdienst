module.exports = function(storage){
    /* decrypt message
     * 
     * the ciphertext will be automatically recognized. the key should be
     * provided according to the answer provided by `core.decrypt.examine`.
     */
    return function(ciphertext, key){
        var overview = _.package.parse(message);
        if(null == overview) return callback(Error('unrecognized-data'));

        var dataType = overview[0], data = overview[1];
        
    };
};
