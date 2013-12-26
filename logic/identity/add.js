module.exports = function(identity){
    return function(data, callback){
        var name = data.post.name;
        if(!_.object.test.identity.name(name)) return callback(400);
       
        var id = _.object.derive.identity.id.fromName(name);
        if(identity(id)) return callback(409);

        var storeObj = {id: id, name: name};
        identity(id, storeObj);
        callback(null, storeObj);
    };
};
