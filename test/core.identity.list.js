require('../lib/baum.js');
require('../lib/_.js');

var storage = _.storage('../testStorage');

$.nodejs.async.series([

    function(callback){
        storage.load('abc', true, callback);
    },


], function(err, result){
    
});
