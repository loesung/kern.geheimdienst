module.exports = function(){
    return {
        pattern: /^\/codebook\/(decrypt|encrypt)\/?$/,
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
