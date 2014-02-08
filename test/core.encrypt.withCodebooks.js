require('../lib/baum.js');
require('../lib/_.js');

var storage = _.storage('../testStorage');
var core = require('../core')(null);


$.nodejs.async.waterfall([

    function(callback){
        storage.load('abc', true, function(){
            callback(null);
        });
    },

    function(callback){
        core = require('../core')(storage);
        core.codebook.list(null, callback);
    },

    function(result, callback){
        for(var i in result)
            break;

        console.log('hay', result);
    },


], function(err, result){
    console.log(err);
    console.log(result);
});
