require('../lib/baum.js');
require('../lib/_.js');

var storage = _.storage('../testStorage'), core;

var ciphertext1, ciphertext2;

$.nodejs.async.waterfall(
    [
        function(callback){
            storage.load('abc', true, function(){
                core = require('../core')(storage);
                callback(null);
            });
        },

        /* ciphertext from codebooks */
        function(callback){
            core.codebook.list(null, callback);
        },

        function(result, callback){
            for(var i in result)
                break;
            var codebookIDs = Object.keys(result).slice(0, 2);
            core.encrypt.withCodebooks(
                codebookIDs,
                new $.nodejs.buffer.Buffer('abcdefg', 'ascii'),
                {
                    armor: true,
                },
                callback
            );
        },

        function(result, callback){
            ciphertext1 = result;
            callback(null);
        },
        

        /* ciphertext from passphrases */
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

        function(ciphertext, callback){
            ciphertext2 = ciphertext;
            callback(null);
        },



        /* test */
        function(callback){
            core.decrypt.examine(ciphertext1, function(err, result){
                console.log(err);
                console.log(result);
                console.log('******************');
                callback(err);
            });
        },

        function(callback){
            core.decrypt.examine(ciphertext2, function(err, result){
                console.log(err);
                console.log(result);
                console.log('******************');
                callback(err);
            });
        },
    ],

    function(err, result){
    }
);
