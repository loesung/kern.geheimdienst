module.exports = function(dataSource){
    return function(data, callback){
        var enumerator = _.object.enumerate.pki;
        var keyAlgo = enumerator.keyAlgo[data.post.algorithm],
            identityID = 
                _.object.test.identity.id(data.post.identity) && 
                data.post.identity.toLowerCase();

        if(
            (undefined == keyAlgo) ||
            (false == identityID)
        ){
            return callback(400, {
                keyAlgo: Object.keys(enumerator.keyAlgo),

            });
        };

        switch(keyAlgo){
            case 'RSA2048SignOnly':
                
                break;
            default: 
                return callback(400);
        };
        
    };
};
