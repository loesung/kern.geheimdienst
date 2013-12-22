var includes = [
    
];
var handlers = [];

for(var i in includes){
    var handler = require(includes[i]);
    handlers.push((function(handler){
        
    })(handler));
};

module.exports = function(e){


    var table = {
        '^\/encrypt\/(key|codebook)$': require('./router.encrypt.js')(e),
        '^\/decrypt\/(analyze)?$': require('./router.decrypt.js')(e),
    };

    return function(callback){
        for(var regexp in table){
            var result = new RegExp(regexp).exec(e.request.url);
            if(null != result){
                table[regexp](result, callback);
                return;
            };
        };
        callback(400);
    };
};
