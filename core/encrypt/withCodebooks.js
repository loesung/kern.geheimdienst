module.exports = function(storage, core){
    return function(a, b, c, d){
        /*
         * (codebookIDs, plaintext, [options], callback)
         *
         * options:
         *     encryptKeyLength: >= 32
         */

        var codebookIDs = a, plaintext = b;
        if(d == undefined)
            var useropt = {},
                callback = c;
        else
            var useropt = c,
                callback = d;

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

        /* filter codebook IDs */
        workflow.push(function(callback){
            core._util.filter.codebookIDs(codebookIDs, function(err, result){
                if(null == err) codebookIDs = result;
                callback(err);
            });
        });

        // get random encryption key
        workflow.push(function(callback){
            // 128 bytes = 1024 bits
            $.security.random.bytes(options.encryptKeyLength, callback);
        });

        /* get codebook and encrypt Key */
        workflow.push(function(callback){
        });

        
        $.nodejs.async.waterfall(workflow, callback);
    };
};
