// VERIFY CODEBOOK ID BEFORE USING IT.
VERIFY_CODEBOOK_INTEGRITY_BEFORE_USE = true;

module.exports = function(storage, core, ciphertextEncryptor){
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
        workflow.push(function(callback){
            var selectedCodebooks = [];
            for(var i in codebookIDs){
                var bufCodebookID = codebookIDs[i],
                    strCodebookID = bufCodebookID.toString('hex');

                try{
                    var codebookLoaded = _.package.parse(
                        storage.table('codebook')(strCodebookID)
                    );
                    if(codebookLoaded[0] != 'codebook')
                        throw Error();

                    var codebook = codebookLoaded[1];
                    if(codebook.id.toString('hex') != strCodebookID)
                        throw Error();
                } catch(e){
                    // delete buged item, this shouldn't happen.
                    storage.table('codebook')(strCodebookID, null);
                    return callback(Error('codebook-entry-bug-in-database'));
                };

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
                        _.digest[CODEBOOK_ID_HASH_ALGORITHM](
                            strCodebookContent
                        );

                    if(expectedID.toString() != codebook.id.toString())
                        return callback(Error('codebook-corrupted'));
                };

                // this codebook is now ready
                selectedCodebooks.push({
                    id: codebook.id,
                    credential: codebook.content.credential,
                });
            };

            callback(null, selectedCodebooks);
        });

        /* call ciphertext generator */
        workflow.push(function(selectedCodebooks, callback){
            var mainEncryptKeyEncryptor = (function(codebooks){
                return function (mainEncryptKey, rueckruf){
                    var hints = [];

                    // construct codebook encryptors to encrypt the
                    // main encrypt key.
                    for(var i in codebooks){
                        hints.push((function(id, credential){
                            return function(callback){
                                _.symcrypt.encryptEncoded(
                                    credential,
                                    mainEncryptKey,
                                    function(err, ciphertext){
                                        callback(
                                            null,
                                            {
                                                id: id,
                                                ciphertext: ciphertext,
                                            }
                                        );
                                    }
                                );
                            };
                        })(codebooks[i].id, codebooks[i].credential));
                    };

                    // run the encryptors
                    $.nodejs.async.series(hints, rueckruf);
                };
            })(selectedCodebooks);
            
            selectedCodebooks = null;
            ciphertextEncryptor(
                false,
                mainEncryptKeyEncryptor,
                false, 

                plaintext,
                useropt,
                callback
            );
        });

        
        $.nodejs.async.waterfall(workflow, callback);
    };
};
