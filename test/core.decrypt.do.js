require('../lib/baum.js');
require('../lib/_.js');

var core = require('../core')(null),
    ciphertextWithPassphrases;

$.nodejs.async.waterfall(
    [
        function(callback){
            core.encrypt.withPassphrases(
                [
                    new $.nodejs.buffer.Buffer('Be sure to use a passphrase that is very very long.', 'ascii'),
                    {
                        hint: new $.nodejs.buffer.Buffer('The password is `test` repeated 10 times. But in practice you must never write like this.', 'ascii'),
                        passphrase: new $.nodejs.buffer.Buffer('testtesttesttesttesttesttesttesttesttest', 'ascii'),
                    },
                ],

                new $.nodejs.buffer.Buffer('message', 'ascii'),
                callback
            );
        },

        function(c, callback){
            console.log('ciphertext obtained.');
            ciphertextWithPassphrases = c;
            core.decrypt.examine(ciphertextWithPassphrases, callback);
        },

        function(r, callback){
            core.decrypt.do(
                new $.nodejs.buffer.Buffer('Be sure to use a passphrase that is very very long.'),
                ciphertextWithPassphrases,
                callback
            );
        },
    ],

    function(err, result){
        console.log(err);
        console.log(result);
    }
);
