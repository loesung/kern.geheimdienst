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

        /* read in all codebooks */
        var selectedCodebooks;
        workflow.push(function(callback){
            for(var i in codebookIDs){
                var bufCodebookID = codebookIDs[i],
                    strCodebookID = bufCodebookID.toString('hex');

                try{
                    var codebookLoaded = _.package.parse(
                        storage.table('codebook')(strCodebookID)
                    );
                    if(codebookLoaded[0] != 'codebook')
                        throw Error();
                } catch(e){
                    // delete buged item, this shouldn't happen.
                    storage.table('codebook')(strCodebookID, null);
                    return callback(Error('fatal-non-codebook-in-database'));
                };

                var codebook = codebookLoaded[1];

                // Verify codebook integrity, i.e. verify codebook id, which
                // is the hash of serialized codebook content.
                // This can be controlled in `core/config.js`.
                if(ALWAYS_VERIFY_CODEBOOK_INTEGRITY){
                    var codebookContent = codebook.content,
                        strCodebookContent = _.package._pack(
                            'codebookContent', 
                            codebookContent
                        );

                    var expectedID = 
                        _.digest[CODEBOOK_ID_HASH_ALGORITHM](strContent);

                    if(expectedID.toString() != codebook.id.toString())
                        return callback(Error('codebook-corrupted'));
                };


            };
        });

        
        $.nodejs.async.waterfall(workflow, callback);
    };
};
