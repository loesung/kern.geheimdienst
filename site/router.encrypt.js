function job(e, matchResult, post, rueckruf){
    var keySource = matchResult[1],
        key = null,
        plaintext = post.parsed['plaintext'],
        checksum = post.parsed['checksum'];

    if(undefined == plaintext){
        rueckruf(400);
        return;
    };

    switch(keySource){
        case 'key':
            rueckruf(null, plaintext);
            break;

        case 'codebook':
            rueckruf(501);
            break;

        default:
            rueckruf(400);
            break;
    };
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
