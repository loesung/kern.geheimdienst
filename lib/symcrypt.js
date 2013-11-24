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

function bitmask(key, input, callback){
    $.nodejs.crypto.pbkdf2(
        key,
        key.slice(0, 20),
        4,
        input.length,
        function(err, bitstream){
            console.log('Masking the input using bitstream from pbkdf2.');
            for(var i=0; i<input.length; i++){
                bitstream.writeInt8((input.readInt8(i) ^ bitstream.readInt8(i)), i);
            };
            callback(null, bitstream);
        }
    );
};

module.exports = function(baum){
    var nodeCrypt = {
        algorithmSequence: [
            'rc4',
            'blowfish',
            'cast',
            'aes-256-cbc',
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
                console.log('Decrypt with algorithm [' + algorithm + '].');
                callback(null, $.nodejs.buffer.Buffer.concat([buf1, buf2]));
            } catch (e){
                callback(e, null);
            };
        },
    };

    function encryptor(keys, plaintext, rueckruf){
        var firstKey = keys.shift();
        var seq = [function(callback){
            bitmask(firstKey, plaintext, callback);
        }];

        for(var i in nodeCrypt.algorithmSequence){
            seq.push(new function(i){
                return function(input, callback){
//                    console.log(nodeCrypt.algorithmSequence[i] + ' is taking over.', keys[i].slice(0, 32).toString('hex'));
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
//                console.log(result);
            }
        );
    };

    function decryptor(keys, ciphertext, rueckruf){
        keys = keys.slice().reverse();
        var reversedSeq = nodeCrypt.algorithmSequence.slice().reverse();
        var lastKey = keys.pop();

        var seq = [function(callback){
            callback(null, ciphertext);
        }];
        for(var i in reversedSeq){
            seq.push(new function(i){
                return function(input, callback){
//                    console.log(reversedSeq[i] + ' is taking over.', keys[i].slice(0,32).toString('hex'));
                    nodeCrypt.decrypt(
                        reversedSeq[i],
                        keys[i],
                        input,
                        callback
                    );
                };
            }(i));
        };

        seq.push(function(input, callback){
            bitmask(lastKey, input, callback);
        });

        $.nodejs.async.waterfall(
            seq,
            function(err, result){
                rueckruf(err, result);
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
                        $.nodejs.crypto.randomBytes(16, callback);
                    },

                    // derive a series of keys
                    function(randomBytes, callback){
                        deriveKey(
                            randomBytes,
                            key,
                            nodeCrypt.algorithmSequence.length + 1,
                            256,
                            function(err, keys){
                                callback(null, keys, randomBytes);
                            }
                        );
                    },

                    // call encryptor
                    function(keys, randomBytes, callback){
                        encryptor(keys, plaintext, function(err, result){
                            callback(null, result, randomBytes);
                        });
                    },
                ],
                function(err, result, randomBytes){
                    var output = [result, randomBytes];
                    rueckruf(err, output);
                }
            );
        };

        this.decrypt = function(key, cipherresult, rueckruf){
            var ciphertext = cipherresult[0],
                randomBytes = cipherresult[1];

            $.nodejs.async.waterfall(
                [
                    // derive a series of keys
                    function(callback){
                        deriveKey(
                            randomBytes,
                            key,
                            nodeCrypt.algorithmSequence.length + 1,
                            256,
                            function(err, keys){
                                callback(null, keys);
                            }
                        );
                    },

                    // call encryptor
                    function(keys, callback){
                        decryptor(keys, ciphertext, function(err, result){
                            callback(null, result);
                        });
                    },
                ],
                function(err, result){
                    rueckruf(err, result);
                }
            );
            
        };

        return this;
    };
};
