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
        core.identity.add({
            subject: 'testSubject', 
        }, callback);
    },


], function(err, result){
    console.log(err);
    console.log(result);
});
