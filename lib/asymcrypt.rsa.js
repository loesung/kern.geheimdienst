module.exports = function($, _, roleSigner, roleEncryptor){
    /*
     * key, message and signature are inputed as buffer.
     */
    var self = this;

    function caller(operand, key, message, last, callback){
        var spawn = $.nodejs.child_process.spawn;
        var argv = [
                $.process.resolvePath('./lib/rsa.py'),
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

    function examine(key, callback){
        caller(
            'examine',
            key,
            false,
            false,
            function(err, got, code, signal){
                if(null != err) return callback(true);
                if(0 != code) return callback(true);
                console.log(got);
                callback(null, got);
            }
        );
    };

    function setPublicKey(publicKey, bits){
        self.getPublicKey = function(){
            return publicKey;
        };

        if(roleSigner)
            self.verify = function(message, signature, callback){
                caller(
                    'verify',
                    publicKey,
                    message,
                    signature,
                    function(err, got, code, signal){
                        if(null != err) return callback(true, false);
                        if(0 != code) return callback(code, false);
                        console.log(got);
                        callback(null, true);
                    }
                );
            };

        if(roleEncryptor)
            self.encrypt = function(message, callback){
                if(message.length * 8 - 1 > bits)
                    return callback('input-too-large');

                caller(
                    'encrypt',
                    publicKey,
                    message,
                    false,
                    function(err, got, code, signal){
                        if(null != err) return callback(true, false);
                        if(0 != code) return callback(code, false);
                        got = new $.nodejs.buffer.Buffer(
                            got.toString(),
                            'base64'
                        );
                        callback(null, got);
                    }
                );
            };

        // end of init as a public key
    };

    function setPrivateKey(privateKey, bits){
        self.getPrivateKey = function(){
            return privateKey;
        };

        if(roleSigner)
            self.sign = function(message, callback){
                if(message.length * 8 - 1 > bits)
                    return callback('input-too-large');
                caller(
                    'sign',
                    privateKey,
                    message,
                    false,
                    function(err, got, code, signal){
                        if(null != err) return callback(true, false);
                        if(0 != code) return callback(code, false);
                        got = new $.nodejs.buffer.Buffer(
                            got.toString(),
                            'base64'
                        );
                        callback(null, got);
                    }
                );
            };

        if(roleEncryptor)
            self.decrypt = function(ciphertext, callback){
                caller(
                    'decrypt',
                    privateKey,
                    ciphertext,
                    false,
                    function(err, got, code, signal){
                        if(null != err) return callback(true, false);
                        if(0 != code) return callback(code, false);
                        got = new $.nodejs.buffer.Buffer(
                            got.toString(),
                            'base64'
                        );
                        callback(null, got);
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

    this.generate = function(bits, callback){
        caller(
            'generate',
            bits,
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

                setPrivateKey(privateKey, bits);
                setPublicKey(publicKey, bits);
                lockUp();

                callback(null);
            }
        );
    };

    this.setPrivateKey = function(privateKey, callback){
        var workflow = [], publicKey;
        workflow.push(function(callback){
            examine(privateKey, callback);
        });

        workflow.push(function(result, callback){
            try{
                var json = JSON.parse(result.toString());
                if(true === json['private']){
                    publicKey = new $.nodejs.buffer.Buffer(
                        json['public'],
                        'base64'
                    );
                    callback(null, json);
                } else {
                    callback('not-private-key');
                };
            } catch(e){
                return callback(e);
            };
        });

        $.nodejs.async.waterfall(workflow, function(err, json){
            if(null == err){
                setPublicKey(publicKey, json['size']); 
                setPrivateKey(privateKey, json['size']);
                lockUp();
            };
            callback(err);
        });
    };

    this.setPublicKey = function(publicKey, callback){
        var workflow = [];
        workflow.push(function(callback){
            examine(publicKey, callback);
        });

        workflow.push(function(result, callback){
            try{
                var json = JSON.parse(result.toString());
                if(false === json['private']){
                    callback(null, json);
                } else {
                    callback('not-public-key');
                };
            } catch(e){
                return callback(true);
            };
        });

        $.nodejs.async.waterfall(workflow, function(err, json){
            if(null == err){
                setPublicKey(publicKey, json['size']);
                lockUp();
            };
            callback(err);
        });
    };
};
