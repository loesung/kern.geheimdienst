
require('../lib/baum.js');
require('../lib/_.js');

var storage = _.storage('../testStorage');
var core;

$.nodejs.async.waterfall([

    function(callback){
        storage.load('abc', true, function(){
            core = require('../core')(storage);
            callback(null);
        });
    },

    function(callback){
        core.system.optimize();
    },

], function(err, result){
    console.log(err);
    console.log(result);
});
