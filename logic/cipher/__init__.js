/*
 *
    var table = {
        '^\/encrypt\/(key|codebook)$': require('./router.encrypt.js')(e),
        '^\/decrypt\/(analyze)?$': require('./router.decrypt.js')(e),
    };

*/

module.exports = function(){
    var router = $.net.urlRouter();

    router.handle(
        'encrypt',
        function(data, callback){
            callback(null, JSON.stringify(data));
        },
        {
            methods: ['post', 'get'],
        }
    );
    router.handle('decrypt', function(){});

    return router;
};
