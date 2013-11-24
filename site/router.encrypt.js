function job(e, matchResult, post, rueckruf){
    var keySource = matchResult[1],
        key = null,
        plaintext = post.parsed['plaintext'],
        checksum = post.parsed['checksum'];
    var workflow = [];

    if(undefined == plaintext){
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
