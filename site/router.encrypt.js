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
 *      
 */

function job(e, matchResult, post, rueckruf){
    var keySource = matchResult[1],
        key = null,
        plaintext = post.parsed['plaintext'],
        checksum = post.parsed['checksum'];
    var workflow = [];

    try{
        plaintext = $.nodejs.buffer.Buffer(plaintext, 'hex');
    } catch (e){
        console.log(e);
        rueckruf(400);
        return;
    };

    if(undefined != checksum){
        // check conflict
        workflow.push(function(callback){
            var digest = _.digest.md5(plaintext).hex;
            console.log(digest);
            callback(null);
        });
    } else {
        workflow.push(function(callback){
            callback(null);
        });
    };

    switch(keySource){
        case 'key':
            key = post.parsed['key'];
            if(undefined == key)
                rueckruf(400);
            else
                workflow.push(function(callback){
                    callback(null, plaintext);
                });
            break;

        case 'codebook':
            rueckruf(501);
            break;

        default:
            rueckruf(400);
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
