require('./lib/baum.js');
require('./lib/_.js');

var rsa0 = _.asymcrypt.encrypting('rsa'),
    rsa1 = _.asymcrypt.signing('rsa'),
    rsa2 = _.asymcrypt.signing('rsa')
;

var signature,
    fake = new $.nodejs.buffer.Buffer('ab'),
    tosign = new $.nodejs.buffer.Buffer('a');

var workflow = [
    function(callback){
        rsa0.generate(2048, callback);
    },
    function(callback){
        rsa1.setPrivateKey(rsa0.getPrivateKey(), callback);
    },
    function(callback){
        rsa2.setPublicKey(rsa0.getPublicKey(), callback);
    },


    function(callback){
        rsa1.sign(tosign, function(err, result){
            signature = result;
            callback(null);
        });
    },
    function(s, callback){
        rsa2.verify(fake, signature, function(err, result){
            console.log(result);
        });
    },


];

$.nodejs.async.series(workflow, function(err){
    console.log('ERROR', err);
});
