module.exports = function(codebook, addFunc){
    return function(data, callback){
        var sharedsecret = data.post.sharedsecret,
            description = data.post.description,
            owners = [];

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
            _.object.enumerate.codebook.status.ESTABLISHED

            function(err){
                if(null != err) return callback(422);
                callback(null);
            }
        );
    };
};
