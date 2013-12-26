module.exports = function(codebook, addFunc){
    return function(data, callback){
        var sharedsecret = data.post.sharedsecret,
            description = data.post.description,
            life = data.post.life,
            owners = [];

        if(undefined == life)
            life = 864000;
        else
            if(!_.object.test.codebook.life(life))
                return callback(400);

        try{
            sharedsecret = new $.nodejs.buffer.Buffer(sharedsecret, 'hex');
        } catch(e){
            return callback(400);
        };

        for(var key in data.post){
            if(!key.startsWith('owner')) continue;
            if(!_.object.test.identity.id(data.post[key]))
                return callback(400);
            else
                owners.push(data.post[key].toLowerCase());
        };

        // add
        addFunc(
            owners,
            sharedsecret,
            _.object.enumerate.codebook.status.ESTABLISHED,
            life,

            function(err, result){
                if(null != err) return callback((isNaN(err)?422:err));
                callback(null, result);
            }
        );
    };
};
