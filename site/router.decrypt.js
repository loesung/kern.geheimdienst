/*
 * API for decrypt given text.
 *
 * This uses the cascade encryption function(defined in /lib/symcrypt.js) to
 * get a given ciphertext decrypted.
 *
 *                      COMMAND FORMAT AND MEANINGS
 *
 * Request URI:    /decrypt/[OPERATION]
 * Request Method: POST(only)
 *
 * OPERATION:       when given, should be 'analyze'.
 *                  This will lead to an output, not really decrypting the
 *                  given ciphertext, but giving the analyze of 'Key Hint',
 *                  what is required to feed the key.
 *
 * In the request body, following items are required:
 *   - ciphertext,  HEX encoded ciphertext, the ciphertext that is going to be
 *                  decrypted.
 *
 * Following items are optional in the request body. But they may cause errors
 * when the resulting conditions are not satisfied.
 *   - checksum,    HEX encoded, MD5 checksum of the ORIGINAL ciphertext.
 *                  Remember this is not the checksum of the HEX-encoded input
 *                  and is designed to see, if what the program going to deal
 *                  with is equal to what you want.
 *
 *                            RETURN VALUES
 * HTTP Status Code is used to signal the type of error:
 *   - 400          cannot read ciphertext or key, or the command is not
 *                  understood.
 */
function analyzeJob(e, matchResult, ciphertext, callback){
    try{
        var report = {};
        var keyHints = ciphertext['key.hint'];

        if(null == keyHints)
            report.type = 'key';

        callback(null, $.nodejs.querystring.encode(report));
    } catch(e){
        callback(409);
    };
};

function decryptJob(e, matchResult, ciphertext, callback){
    callback(501);
};

function doChecksum(input, compareTo, algorithm){
    try{
        var digest = _.digest.md5(input).hex;
        return (digest == compareTo.trim().toLowerCase)
    } catch (e){
        return false;
    };
};

module.exports = function(e){
    return function(matchResult, rueckruf){
        if(e.method != 'post'){
            rueckruf(405); // method not allowed.
            return;
        };

        var workflow = [];

        e.on('ready', function(post){
            var ciphertext = post.parsed['ciphertext'],
                checksum = post.parsed['checksum'];

            try{
                ciphertext = new $.nodejs.buffer.Buffer(ciphertext, 'hex');
            } catch(e){
                rueckruf(400);
                return;
            };

            if(undefined != checksum){
                workflow.push(function(callback){
                    if(doChecksum(ciphertext, checksum, 'md5'))
                        callback(null);
                    else
                        callback(409);
                });
            };

            // push unpack command
            workflow.push(function(callback){
                ciphertext = ciphertext.toString('ascii');
                ciphertext = _.package.ciphertext.unpack(ciphertext);
                if(null == ciphertext)
                    callback(400);
                else
                    callback(null);
            });

            // push job command
            if('analyze' == matchResult[1]){
                workflow.push(function(callback){
                    analyzeJob(e, matchResult, ciphertext, callback);
                });
            } else {
                workflow.push(function(callback){
                    decryptJob(e, matchResult, ciphertext, callback);
                });
            };

            $.nodejs.async.waterfall(workflow, function(err, result){
                if(null == err){
                    rueckruf(null, result);
                } else {
                    rueckruf(err);
                };
            });

        }); // end of on('ready',...)
    }; // end of returned function
};
