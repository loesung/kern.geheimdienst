function hash($, algorithm, data, encoding){
    var digestor = new $.nodejs.crypto.createHash(algorithm);
    digestor.update(data, encoding);
    
    var buffer = digestor.digest();

    this.hex = buffer.toString('hex');
    this.binary = buffer.toString('binary');
    this.base64 = buffer.toString('base64');

    return this;
};
function hmac($, algorithm, data, key, encoding){
    var digestor = new $.nodejs.crypto.createHmac(algorithm, key);
    data = new $$.node.buffer.Buffer(data, encoding);
    digestor.update(data);
    
    var buffer = digestor.digest();

    this.hex = buffer.toString('hex');
    this.binary = buffer.toString('binary');
    this.base64 = buffer.toString('base64');

    return this;
};

module.exports = function(baum){
    return new function($){
        var self = this;

        var hashAlgorithms = [
            'md5', 'sha1', 'sha256', 'sha512', 'whirlpool'
        ];
        for(var i=0; i<hashAlgorithms.length; i++){
            var algorithmName = hashAlgorithms[i];

            this[algorithmName] = new function(algorithmName){
                return function(data, encoding){
                    return new hash($, algorithmName, data, encoding);
                };
            }(algorithmName);

            this[algorithmName + 'Hmac'] = new function(algorithmName){
                return function(data, key, encoding){
                    return new hmac($, algorithmName, data, key, encoding);
                };
            }(algorithmName);
        };

        return this;
    }(baum);
};
