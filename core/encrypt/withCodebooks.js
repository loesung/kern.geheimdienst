// VERIFY CODEBOOK ID BEFORE USING IT.
VERIFY_CODEBOOK_INTEGRITY_BEFORE_USE = true;

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

        //////////////////////////////////////////////////////////////
        
        var workflow = [];

        /* filter codebook IDs */
        workflow.push(function(callback){
            core._util.filter.codebookIDs(codebookIDs, function(err, result){
                if(null == err) codebookIDs = result;
                callback(err);
            });
        });

        /* read in all codebook IDs */

        
        $.nodejs.async.waterfall(workflow, callback);
    };
};
