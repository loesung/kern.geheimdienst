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
