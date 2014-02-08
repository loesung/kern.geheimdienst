require('../lib/baum.js');
require('../lib/_.js');

var storage = _.storage('../testStorage'), core;


$.nodejs.async.waterfall([

    function(callback){
        storage.load('abc', true, function(){
            core = require('../core')(storage);
            callback(null);
        });
    },

    function(callback){
        core.codebook.list(null, callback);
    },

    function(result, callback){
        for(var i in result)
            break;

        var codebookIDs = Object.keys(result).slice(0, 2);
        
        core.encrypt.withCodebooks(
            codebookIDs,
            
            new $.nodejs.buffer.Buffer('abcdefg', 'ascii'),

            {
                armor: true,
            },

            callback
        );
    },


], function(err, result){
    console.log(result);
});
