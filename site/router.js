module.exports = function(e){
    var table = {
        '^\/encrypt\/(key|codebook)$': require('./router.encrypt.js')(e),
    };

    return function(callback){
        for(var regexp in table){
            var result = new RegExp(regexp).exec(e.request.url);
            if(null != result){
                table[regexp](result, callback);
                return;
            };
        };
        callback('no-router');
    };
};
