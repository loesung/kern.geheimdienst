function mss($, _){
    var self = this;

    function caller(operand, key, message, last, callback){
        var spawn = $.nodejs.child_process.spawn;
        var python = spawn(
            'python',
            [
                $.process.resolvePath('./lib/mss.py'),
                operand,
                key,
                message.toString('hex'),
                last.toString('hex'),
            ]
        );

        var got = [];
        python.stdout.on('data', function(data){
            got.push(data);
        });

        python.on('close', function(code, signal){
            callback(
                null,
                $.nodejs.buffer.Buffer.concat(got),
                code,
                signal
            );
        });
    };

    this.setPrivateKey = function(privateKey){
        privateKey = privateKey.toString('hex');

        self.sign = function(message, callback){
            
        };
        
        self.getPublicKey = function(callback){
            caller('init', privateKey, '', '', function(err, got, code, signal){
                if(0 == code){
                    callback(null, new $.nodejs.buffer.Buffer(
                        got.toString().trim(), 'hex'
                    ));
                } else {
                    callback(true);
                };
            });
        };

        self.cache = function(cacheString){
             // Set or get a cache.
        };

        delete self.setPublicKey;
        delete self.setPrivateKey;
    };

    this.setPublicKey = function(publicKey){
        self.verify = function(signature, message, callback){
        };

        delete self.setPublicKey;
        delete self.setPrivateKey;
    };

    return this;
};

module.exports = function($, _){
    return new function(){
        var self = this

        this.signing = function(algorithm){
            return new mss($, _);
        };

        this.encrypting = function(algorithm){
        };

        return this;
    };
};
