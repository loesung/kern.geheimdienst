require('../lib/baum.js');
require('../lib/_.js');
var ecdh = require('../lib/jsbn/__init__.js')($, _);

var alice = new ecdh('secp256r1'),
    bob = new ecdh('secp256r1');

$.nodejs.async.series(
    [
        alice.generateKeys,
        bob.generateKeys,
    ],
    function(err, result){
        console.log(result);
        console.log('Publickey Alices', alice.getPublicKey());
        console.log('Publickey Bobs', bob.getPublicKey());

        console.log('Secret Alices', alice.computeSecret(bob.getPublicKey()));
        console.log('Secret Bobs', bob.computeSecret(alice.getPublicKey())); 
    }
);
