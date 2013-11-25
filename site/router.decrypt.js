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
