module.exports = function(identity){
    return function(data, callback){
        var id = data.get.id;
        if(undefined == id)
            return callback(null, identity());

        if(!_.object.test.identity.id(id)) return callback(400);
       
        var theIdentity = identity(id);
        if(!theIdentity) return callback(404);
        return callback(null, theIdentity);
    };
};
