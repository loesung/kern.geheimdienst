function hash($, algorithm, data, encoding){
    var digestor = new $.nodejs.crypto.createHash(algorithm);
    digestor.update(data, encoding);
    
    var buffer = digestor.digest();

    buffer.hex = buffer.toString('hex');
    buffer.binary = buffer.toString('binary');
    buffer.base64 = buffer.toString('base64');

    return buffer;
};
function hmac($, algorithm, data, key, encoding){
    var digestor = new $.nodejs.crypto.createHmac(algorithm, key);
    data = new $.nodejs.buffer.Buffer(data, encoding);
    digestor.update(data);
    
    var buffer = digestor.digest();

    buffer.hex = buffer.toString('hex');
    buffer.binary = buffer.toString('binary');
    buffer.base64 = buffer.toString('base64');

    return buffer;
};

module.exports = function(baum){
    return new function($){
        var self = this;

        var hashAlgorithms = [
            'md5', 'sha1', 'sha224', 'sha256', 'sha512', 'whirlpool'
        ];
        for(var i=0; i<hashAlgorithms.length; i++){
            var algorithmName = hashAlgorithms[i];

            this[algorithmName] = (function(algorithmName){
                return function(data, encoding){
                    return new hash($, algorithmName, data, encoding);
                };
            })(algorithmName);

            this[algorithmName + 'Hmac'] = (function(algorithmName){
                return function(data, key, encoding){
                    return new hmac($, algorithmName, data, key, encoding);
                };
            })(algorithmName);
        };

        return this;
    }(baum);
};
