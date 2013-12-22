module.exports = function(){
    return  {
        pattern: /^\/codebook\/new\/(sharedsecret|letter)\/?$/,
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
