module.exports = function(storage, core, ciphertextEncryptor){
    return function(a, b, c, d){
        /*
         * (passphrases, plaintext, [options], callback)
         *
         * passphrases: array or a single array item, followings:
         *     1. a buffer
         *     2. {hint: <buffer>, passphrase: <buffer>}
         *
         * options:
         *     encryptKeyLength: >= 32
         */

        var passphrases = a, plaintext = b;
        if(d == undefined)
            var useropt = {},
                callback = c;
        else
            var useropt = c,
                callback = d;

        //////////////////////////////////////////////////////////////

        var workPassphrases = [], workHints = [];

        if(!$.types.isArray(passphrases)) passphrases = [passphrases,];
        for(var i in passphrases){
            var item = passphrases[i],
                passphrase, hint;

            if(!$.types.isBuffer(item)){
                passphrase = item.passphrase;
                hint = item.hint;
            } else {
                passphrase = item;
                hint = null;
            };

            if(!(
                    $.types.isBuffer(passphrase) &&
                    ($.types.isBuffer(hint) || null == hint)
                )
            )
                return callback(Error('Unexpected passphrases.'));

            if(passphrase.length < PASSPHRASE_MIN_LENGTH)
                return callback(Error('Passphrase too short.'));

            workPassphrases.push(passphrase);
            workHints.push(hint);
        };

        // main encryption key encryptor with passphrases
        function mainEncryptKeyEncryptor(encryptKey, rueckruf){
            var task = [];
            for(var i=0; i<workPassphrases.length; i++){
                task.push((function(k, p){
                    return function(callback){
                        _.symcrypt.encryptEncoded(p, k, callback);
                    };
                })(encryptKey, workPassphrases[i]));
            };

            $.nodejs.async.series(task, function(err, result){
                if(null != err) return rueckruf(err);
                var hints = [];
                for(var i in result){
                    if(workHints[i])
                        hints.push({
                            hint: workHints[i],
                            ciphertext: result[i],
                        });
                    else
                        hints.push({
                            ciphertext: result[i],
                        });
                };
                rueckruf(null, hints);
            });
        };

        ciphertextEncryptor(
            mainEncryptKeyEncryptor,
            false,
            false, 

            plaintext,
            useropt,
            callback
        );
    };
};
