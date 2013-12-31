module.exports = function($, _){
    /*
     * key, message and signature are inputed as buffer.
     */
    var self = this;

    function caller(operand, key, message, last, callback){
        var spawn = $.nodejs.child_process.spawn;
        var argv = [
                $.process.resolvePath('./lib/ec.dsa.py'),
                operand,
                ($.types.isNumber(key)?key:key.toString('hex')),
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

    function setPublicKey(publicKey){
        self.getPublicKey = function(){
            return publicKey;
        };

        self.verify = function(message, signature, callback){
            caller(
                'verify',
                publicKey,
                message,
                signature,
                function(err, got, code, signal){
                    if(null != err) return callback(true, false);
                    if(0 != code) return callback(code, false);
                    callback(null, true);
                }
            );
        };
        // end of init as a public key
    };

    function setPrivateKey(privateKey){
        self.getPrivateKey = function(){
            return privateKey;
        };

        self.sign = function(message, callback){
            caller(
                'sign',
                privateKey,
                message,
                false,
                function(err, got, code, signal){
                    if(null != err) return callback(true);
                    if(0 != code) return callback(code);
                    var ret = new $.nodejs.buffer.Buffer(
                        got.toString(),
                        'base64'
                    );
                    callback(null, ret);
                }
            );
        };
        // end of init as a private key
    };

    function lockUp(){
        delete self.generate;
        delete self.setPrivateKey;
        delete self.setPublicKey;
    };

    this.generate = function(curve, callback){
        caller(
            'generate',
            curve,
            false,
            false,
            function(err, got, code, signal){
                if(null != err || 0 != code) return callback(true);
                try{
                    var parts = got.toString().split('*');
                    var publicKey = new $.nodejs.buffer.Buffer(
                            parts[0],
                            'base64'
                        ),
                        privateKey = new $.nodejs.buffer.Buffer(
                            parts[1],
                            'base64'
                        )
                    ;
                } catch(e){
                    callback(true);
                };

                setPrivateKey(privateKey);
                setPublicKey(publicKey);
                lockUp();

                callback(null);
            }
        );
    };

    this.setPrivateKey = function(privateKey){
        setPrivateKey(privateKey);
        lockUp();
    };

    this.setPublicKey = function(publicKey){
        setPublicKey(publicKey);
        lockUp();
    };

    return this;
};

