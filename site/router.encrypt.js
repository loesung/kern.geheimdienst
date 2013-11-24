function job(e, matchResult, post, rueckruf){
    var keySource = matchResult[1];
    switch(keySource){
        case 'key':
            setTimeout(function(){rueckruf(null, 'abcdefg');}, 3000);
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
