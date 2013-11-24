/*
 * API for encrypt given text.
 *
 * This uses the cascade encryption function(defined in /lib/symcrypt.js) to
 * get a given plaintext encrypted.
 *
 * Request URI: /encrypt/<KEY-SOURCE>
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
 */
function passOn(callback){
    callback(null);
};

function checksum(input, compareTo, algorithm){
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
    var workflow = [];

    try{
        plaintext = post.parsed['plaintext'];
        plaintext = $.nodejs.buffer.Buffer(plaintext, 'hex');
    } catch (e){
        rueckruf(400);
        return;
    };

    if(undefined != checksum){
        // check conflict
        workflow.push(function(callback){
            if(checksum(plaintext, checksum, 'md5'))
                callback(null);
            else
                callback(409);
        });
    } else {
        workflow.push(passOn);
    };

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
                    if(checksum(key, checksum, 'md5'))
                        callback(null);
                    else
                        callback(409);
                });
            } else
                workflow.push(passOn);

            workflow.push(function(callback){
                _.symcrypt.encrypt(key, plaintext, function(err, result){
                    if(null != err){
                        callback(422);
                        return;
                    };

                    callback(null, _.package.ciphertext.pack(result));
                });
            });
            break;

        case 'codebook':
            rueckruf(501);
            return;
            break;

        default:
            rueckruf(400);
            return;
            break;
    };

    $.nodejs.async.waterfall(
        workflow,
        function(err, result){
            rueckruf(null, result);
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
