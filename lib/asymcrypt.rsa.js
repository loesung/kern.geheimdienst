module.exports = function($, _){
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
                    console.log(code, publicKey);
                    callback(null, privateKey);
                } catch(e){
                    callback(true);
                };
            }
        );
    };

    this.setPrivateKey = function(privateKey, callback){
    };

    this.setPublicKey = function(publicKey, callback){
    };
};
