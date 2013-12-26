module.exports = function(identity){
    return function(data, callback){
        var id = data.post.id.toLowerCase();
        if(!_.object.test.identity.id(id)) return callback(400);
        if(false == identity(id)) return callback(404);
        identity(id, null);//delete, when set to null
        callback(null);
    };
};
