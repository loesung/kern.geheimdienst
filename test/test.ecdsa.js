require('../lib/baum.js');
require('../lib/_.js');

var ecdsa0 = _.asymcrypt.signing('ecdsa'),
    ecdsa1 = _.asymcrypt.signing('ecdsa'),
    ecdsa2 = _.asymcrypt.signing('ecdsa')
;

var signature,
    fake = new $.nodejs.buffer.Buffer('ab'),
    tosign = new $.nodejs.buffer.Buffer('a');

var workflow = [
    function(callback){
        ecdsa0.generate('NIST192p', callback);
    },
    function(callback){
        ecdsa1.setPrivateKey(ecdsa0.getPrivateKey());

        callback(null);
    },
    function(callback){
        ecdsa2.setPublicKey(ecdsa0.getPublicKey());
        callback(null);
    },


    function(callback){
        ecdsa1.sign(tosign, function(err, result){
            signature = result;
            callback(null, signature);
        });
    },
    function(signature, callback){
        ecdsa2.verify(tosign, signature, function(err, result){
            console.log(result);
        });
    },


];

$.nodejs.async.waterfall(workflow, function(err){
    console.log('ERROR', err);
});
