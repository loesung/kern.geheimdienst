function RSASignOnly(bits, dataSource, identityID){
    return function(callback){
    };
};

function MSS224SignOnly(dataSource, identityID){
    return function(callback){
    };
};

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
                return RSASignOnly(2048, dataSource, identityID)(callback);
            case 'RSA3072SignOnly':
                return RSASignOnly(3072, dataSource, identityID)(callback);
            case 'RSA4096SignOnly':
                return RSASignOnly(4096, dataSource, identityID)(callback);
            case 'RSA8192SignOnly':
                return RSASignOnly(8192, dataSource, identityID)(callback);
            case 'MSS224SignOnly':
                return MSS224SignOnly(dataSource, identityID)(callback);
            default: 
                return callback(400);
        };

        return callback(501); // leakage
    };
};
