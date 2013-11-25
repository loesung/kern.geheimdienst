/*
 * API for encrypt given text.
 *
 * This uses the cascade encryption function(defined in /lib/symcrypt.js) to
 * get a given plaintext encrypted.
 *
 *                      COMMAND FORMAT AND MEANINGS
 *
 * Request URI:    /encrypt/<KEY-SOURCE>
 * Request Method: POST(only)
 *
 * KEY-SOURCE:  choose between 'key' or 'codebook'. This will result in more
 *              requirements in the request body.
 *   - When using 'key', in the request body there MUST include following
 *     items:
 *       1) key,    HEX encoded key. The limit to key length does not exist.
 *                  However, a key length of at least 256 bits is at least
 *                  required by common practice, and up to 1024 bits is good
 *                  in case of quantum computers.
 *   - When using 'codebook', such items are required:
 *       1)...
 *
 * In the request body, following items are required:
 *   - plaintext,   HEX encoded plaintext, the plaintext that is going to be
 *                  encrypted.
 *
 * Following items are optional in the request body. But they may cause errors
 * when the resulting conditions are not satisfied.
 *   - checksum,    HEX encoded, MD5 checksum of the ORIGINAL plaintext.
 *                  Remember this is not the checksum of the HEX-encoded input
 *                  and is designed to see, if what the program going to deal
 *                  with is equal to what you want.
 *   - keychecksum, like 'checksum', but for the verification of the key. If
 *                  <KEY-SOURCE> is not 'key', this will be ignored.
 *
 *                            RETURN VALUES
 * HTTP Status Code is used to signal the type of error:
 *   - 400          cannot read plaintext or key, or the command is not
 *                  understood.
 *   - 405          the 'method' is not 'POST', as expected.
 *   - 409          checksum of plaintext or key not match.
 *   - 422          failure occured during compressing or encrypting.
 *   - 501          this feature is not implemented.
 */
function passOn(callback){
    callback(null);
};

function doChecksum(input, compareTo, algorithm){
    try{
        var digest = _.digest.md5(input).hex;
        return (digest == compareTo.trim().toLowerCase)
    } catch (e){
        return false;
    };
};

function job(e, matchResult, post, rueckruf){
    var keySource = matchResult[1],
        key = null,
        plaintext = null,
        checksum = post.parsed['checksum'],
        keychecksum = post.parsed['keychecksum'];
    var workflow = [],
        keyHints = null;

    // read HEX-encoded plaintext
    try{
        plaintext = post.parsed['plaintext'];
        plaintext = $.nodejs.buffer.Buffer(plaintext, 'hex');
    } catch (e){
        rueckruf(400);
        return;
    };

    // if there is a checksum provided, try it.
    if(undefined != checksum){
        // check conflict
        workflow.push(function(callback){
            if(doChecksum(plaintext, checksum, 'md5'))
                callback(null);
            else
                callback(409);
        });
    } else {
        workflow.push(passOn);
    };

    // determine the key source
    switch(keySource){
        case 'key':
            try{
                key = post.parsed['key'];
                key = $.nodejs.buffer.Buffer(key, 'hex');
            } catch(e) {
                rueckruf(400);
                return;
            };

            if(undefined != keychecksum){
                workflow.push(function(callback){
                    if(doChecksum(key, keychecksum, 'md5'))
                        callback(null);
                    else
                        callback(409);
                });
            } else
                workflow.push(passOn);

            keyHints = null;
            break;

        case 'codebook':
            // XXX decide and get key hint
            rueckruf(501);
            return;
            break;

        default:
            rueckruf(400);
            return;
            break;
    };

    // push compression command
    workflow.push(function(callback){
        $.nodejs.zlib.deflateRaw(plaintext, function(err, result){
            if(null != err)
                callback(422);
            else {
                callback(null, result);
            };
        });
    });

    // push encryption command
    workflow.push(function(compressed, callback){
        _.symcrypt.encrypt(key, compressed, function(err, result){
            if(null != err){
                callback(422);
                return;
            };

            callback(null, result);
        });
    });

    // command execution
    $.nodejs.async.waterfall(
        workflow,
        function(err, cipherresult){
            if(null != err){
                rueckruf(err);
            } else {
                var result = {
                    'compress': 'zlib',
                    'result': cipherresult,
                    'key': keyHints,
                };
                rueckruf(null, _.package.ciphertext.pack(result));
            };
        }
    );
};



module.exports = function(e){
    return function(matchResult, callback){
        if(e.method != 'post'){
            callback(405); // method not allowed.
            return;
        };

        e.on('ready', function(post){
            job(e, matchResult, post, callback);
        });
    };
};
