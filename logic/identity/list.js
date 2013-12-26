module.exports = function(identity){
    return function(data, callback){
        callback(null, identity());
    };
};
