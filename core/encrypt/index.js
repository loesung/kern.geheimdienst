// Default bytes for a encryption key, used for actual encryption of data.
var DEFAULT_ENCRYPT_KEY_LENGTH = 128;

// Acceptable min. length of passphrase in bytes.
var PASSPHRASE_MIN_LENGTH = 20;

//////////////////////////////////////////////////////////////////////////////

function encrypt(storage){
    var self = this;

    this.withPassphrases = function(a, b, c, d){
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

        var options = {
            'encryptKeyLength': DEFAULT_ENCRYPT_KEY_LENGTH,
            'armor': false || useropt.armor,
        };
        if(
            useropt.encryptKeyLength &&
            $.types.isNumber(useropt.encryptKeyLength) &&
            useropt.encryptKeyLength >= 32
        )
            options.encryptKeyLength = Math.ceil(useropt.encryptKeyLength);

        //////////////////////////////////////////////////////////////

        var workflow = [];
        
        // get random encryption key
        workflow.push(function(callback){
            // 128 bytes = 1024 bits
            $.security.random.bytes(options.encryptKeyLength, callback);
        });

        // encrypt the encryption key using passphrases
        workflow.push(function(encryptKey, rueckruf){
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
                rueckruf(null, encryptKey, hints);
            });
        });

        // encrypt plaintext
        workflow.push(function(encryptKey, hints, callback){
            _.symcrypt.encryptEncodedCompressed(
                encryptKey,
                plaintext,
                function(err, ciphertext){
                    if(null != err) return callback(err);
                    callback(null, {
                        passphrases: hints,
                        ciphertext: ciphertext,
                    });
                }
            );
        });

        $.nodejs.async.waterfall(workflow, function(err, result){
            if(null != err) return callback(err);
            var template = 'ciphertextWithPassphrases';
            if(options.armor)
                callback(null, _.package.armoredPack(template, result));
            else
                callback(null, _.package.pack(template, result));
        });
    };

    return this;
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function(s){
    return new encrypt(s);
};
