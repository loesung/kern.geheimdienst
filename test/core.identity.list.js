require('../lib/baum.js');
require('../lib/_.js');

var storage = _.storage('../testStorage');
var core;

$.nodejs.async.series([

    function(callback){
        storage.load('abc', true, callback);
    },

    function(callback){
        core = require('../core')(storage);
        core.identity.list('test', callback);
    },

], function(err, result){
    console.log(result);    
});
