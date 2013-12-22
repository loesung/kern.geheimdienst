/*
 *
    var table = {
        '^\/encrypt\/(key|codebook)$': require('./router.encrypt.js')(e),
        '^\/decrypt\/(analyze)?$': require('./router.decrypt.js')(e),
    };

*/

module.exports = function(){
    return {
        pattern: /^\/cipher\/(decrypt|encrypt)\/?$/,
        mapping: {
            1: 'action',
        },

        configure: {
            method: ['post', 'get'],

        },

        handler: function(data, callback){
            callback(null, JSON.stringify(data));
        },
    };
};
