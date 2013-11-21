function deriveKey(randomBytes, userKey, count, eachLength, callback){
    $.nodejs.crypto.pbkdf2(
        userKey,
        randomBytes,
        128,
        count * eachLength,
        function(err, derivedKey){
            var ret = [];
            for(var i=0; i<count; i++)
                ret.push(
                    derivedKey.slice(eachLength * i, eachLength * (i+1))
                );
            callback(err, ret);
        }
    );
};

module.exports = function(baum){
    var nodeCrypt = {
        algorithmSequence: [
            'rc4',
            'blowfish',
            'cast',
            'aes-256-cbc-hmac-sha1',
        ],

        encrypt: function(algorithm, key, plaintext, callback){
            try{
                var cipher = $.nodejs.crypto.createCipher(algorithm, key);
                var buf1 = cipher.update(plaintext);
                var buf2 = cipher.final();
                console.log('Encrypt with algorithm [' + algorithm + '].');
                callback(null, $.nodejs.buffer.Buffer.concat([buf1, buf2]));
            } catch (e){
                callback(e, null);
            };
        },
        
        decrypt: function(algorithm, key, ciphertext, callback){
            try{
                var decipher = $.nodejs.crypto.createDecipher(algorithm, key);
                var buf1 = decipher.update(ciphertext);
                var buf2 = decipher.final();
                callback(null, $.nodejs.buffer.Buffer.concat([buf1, buf2]));
            } catch (e){
                callback(e, null);
            };
        },
    };

    function encryptor(keys, plaintext, rueckruf){
        var seq = [function(callback){callback(null, plaintext);}];
        for(var i in nodeCrypt.algorithmSequence){
            seq.push(new function(i){
                return function(input, callback){
                    nodeCrypt.encrypt(
                        nodeCrypt.algorithmSequence[i],
                        keys[i],
                        input,
                        callback
                    );
                };
            }(i));
        };

        $.nodejs.async.waterfall(
            seq,
            function(err, result){
                rueckruf(err, result);
                console.log(result);
            }
        );
    };

    function decryptor(keys, ciphertext, rueckruf){
        $.nodejs.async.waterfall(
            [
            ],
            function(err, result){
            }
        );
    };

    return new function(){
        var self = this;

        this.encrypt = function(key, plaintext, rueckruf){
            $.nodejs.async.waterfall(
                [
                    // random bytes
                    function(callback){
                        // should we here inject our own code for adding seeds
                        // of randoming? XXX
                        // We may also try to query for some numbers from a
                        // hardware random number generator. Note that such 
                        // generators may not provide uniformly distributed
                        // numbers, but so long as they are not predictable,
                        // it is enough.
                        $.nodejs.crypto.randomBytes(256, callback);
                    },

                    // derive a series of keys
                    function(randomBytes, callback){
                        deriveKey(randomBytes,
                            key,
                            nodeCrypt.algorithmSequence.length,
                            256,
                            callback
                        );
                    },

                    // call encryptor
                    function(keys, callback){
                        plaintext = new $.nodejs.buffer.Buffer(plaintext);
                        encryptor(keys, plaintext, callback);
                    },
                ],
                function(err, result){
                    rueckruf(err, result);
                }
            );
        };

        this.decrypt = function(key, ciphertext, rueckruf){
        };

        return this;
    };
};
