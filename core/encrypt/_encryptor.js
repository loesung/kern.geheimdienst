/*
 * the ciphertext generator
 *
 * at least one of the generators must be used. and each generator is a
 * function which takes one Buffer as input and callback with an array of
 * hints.
 */

module.exports = function(storage, core){
    return function(
        passphraseHintGenerator,
        codebookHintGenerator,
        publicKeyHintGenerator,
        plaintext,
        useropt,
        callback
    ){
        
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


        var workflow = [], mainEncryptKey;
        
        // get random encryption key
        workflow.push(function(callback){
            // 128 bytes = 1024 bits
            $.security.random.bytes(
                options.encryptKeyLength, 
                function(err, result){
                    if(null == err) mainEncryptKey = result;
                    callback(err);
                }
            );
        });


        // get all kinds of hints
        workflow.push(function(callback){
            var tasks = {};

            function nullRet(callback){
                callback(null, null);
            };

            if(passphraseHintGenerator)
                tasks.passphrases = function(callback){
                    passphraseHintGenerator(mainEncryptKey, callback);
                };
            else
                tasks.passphrases = nullRet;

            if(codebookHintGenerator)
                tasks.codebooks = function(callback){
                    codebookHintGenerator(mainEncryptKey, callback);
                };
            else
                tasks.codebooks = nullRet;

            // TODO add here public key hint

            $.nodejs.async.series(tasks, callback);
        });


        // encrypt plaintext
        workflow.push(function(hints, callback){
            var result = hints;

            if(null === hints.passphrases) delete hints.passphrases;
            if(null === hints.codebooks) delete hints.codebooks;

            _.symcrypt.encryptEncodedCompressed(
                mainEncryptKey,
                plaintext,
                function(err, ciphertext){
                    if(null != err) return callback(err);
                    result.ciphertext = ciphertext;
                    callback(null, result);
                }
            );
        });

        $.nodejs.async.waterfall(workflow, function(err, result){
            if(null != err) return callback(err);
            console.log(result);
            var template = 'ciphertext';
            if(options.armor)
                callback(null, _.package.armoredPack(template, result));
            else
                callback(null, _.package.pack(template, result));
        });

        /////////////////////// END OF PROCESS ///////////////////////
    };
};
