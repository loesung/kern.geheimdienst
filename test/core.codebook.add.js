require('../lib/baum.js');
require('../lib/_.js');

var storage = _.storage('../testStorage');
var core;

$.nodejs.async.waterfall([

    function(callback){
        storage.load('abc', true, function(){
            callback(null);
        });
    },

    function(callback){
        core = require('../core')(storage);
        core.identity.list(null, callback);
    },

    function(result, callback){
        for(var i in result)
            break;

        console.log(i);
        
        core.codebook.add.sharedsecret(
            i,
            new $.nodejs.buffer.Buffer('sharedsecret', 'ascii'),
            callback
        );
    },


], function(err, result){
    console.log(err);
    console.log(result);
});
