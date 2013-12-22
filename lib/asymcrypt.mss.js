module.exports = function($, _){
    /*
     * key, message and cache are inputed as buffer.
     */
    var self = this;

    function caller(operand, key, message, last, callback){
        var spawn = $.nodejs.child_process.spawn;
        var argv = [
                $.process.resolvePath('./lib/mss.py'),
                operand,
                key.toString('hex'),
            ]
        ;

        if(message){
            argv.push(message.toString('hex'));
            if(last) argv.push(last.toString('hex'));
        };

        var python = spawn('python', argv),
            got = [];

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

        python.on('error', function(){
            callback(true);
        });
    };

    this.setPrivateKey = function(privateKey){
        var cache = null;
        privateKey = privateKey.toString('hex');

        self.sign = function(message, callback){
            if(null != cache)
                var cacheBuffer = cache.toString('hex');
            else
                var cacheBuffer = false;
            caller(
                'sign',
                privateKey,
                message,
                cacheBuffer, 
                function(err, got, code, signal){
//                  console.log(got.toString());
                    if(0 != code) return callback(code);

                    got = got.toString().split('\n');

                    var sig = [], che = [], line, head
                    for(var i in got){
                        line = got[i].trim();
                        head = got[i].substr(0,1);
                        if(head == '!')
                            sig.push(line.substr(1));
                        else if(head == '@')
                            che.push(line.substr(1));
                    };

                    try{
                        cache = new $.nodejs.buffer.Buffer(
                            che.join(''),
                            'base64'
                        );
                        signature = new $.nodejs.buffer.Buffer(
                            sig.join(''),
                            'base64'
                        );
                    } catch(e){
                        return callback(true);
                    };

                    callback(null, signature);
            });
        };
        
        self.getPublicKey = function(callback){
            caller('init', privateKey, '', '', 
                function(err, got, code, signal){
                    if(0 == code){
                        var publicKey = new $.nodejs.buffer.Buffer(
                            got.toString().trim(),
                            'hex'
                        );
                        self.setPublicKey(publicKey);
                        callback(null, publicKey);
                    } else 
                        callback(code);
            });
        };

        self.cache = function(cacheBuffer){
             // Set or get a cache.
            if(undefined == cacheBuffer)
                return cache;
            cache = cacheBuffer;
            return self;
        };

        delete self.setPrivateKey;
    };

    this.setPublicKey = function(publicKey){
        self.verify = function(signature, message, callback){
            caller(
                'verify',
                publicKey,
                message,
                signature, 
                function(err, got, code, signal){
                    if(null != err) return callback(err);
                    callback(null, (0 == code));
            });
        };

        delete self.setPublicKey;
    };

    return this;
};
