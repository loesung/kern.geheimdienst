module.exports = function(storage){
    // examine a ciphertext
    return function(message){
        var overview = _.package.parse(message);
        if(null == overview) return null;

        var dataType = overview[0], data = overview[1];

    };
};
