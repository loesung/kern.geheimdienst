function job(e, post, rueckruf){
    setTimeout(function(){rueckruf(null, 'abcdefg');}, 3000);
};

module.exports = function(e){
    return function(matchResult, callback){
        if(e.method != 'post'){
            callback(405); // method not allowed.
            return;
        };

        e.on('ready', function(post){
            job(e, post, callback);
        });
    };
};
