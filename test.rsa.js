require('./lib/baum.js');
require('./lib/_.js');

var rsa0 = _.asymcrypt.encrypting('rsa'),
    rsa1 = _.asymcrypt.signing('rsa')
;

var workflow = [

    function(callback){
        rsa0.generate(2048, callback);
    },

    function(callback){
        console.log(rsa0);
        console.log(rsa1);

        rsa1.setPrivateKey(rsa0.getPrivateKey(), callback);
    },

    function(callback){
        console.log(rsa1);
    },

];

$.nodejs.async.series(workflow, function(err){
    console.log('ERROR', err);
});
