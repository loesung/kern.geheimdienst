require('../lib/baum.js');
require('../lib/_.js');
var ecdh = require('../lib/jsbn/__init__.js')($, _);

var curve = 'secp256r1';

curve = 'sm2fp192';
var alice = new ecdh(curve),
    bob = new ecdh(curve);

alice.setPrivateKey('3AC0E717EB61602EFCBB1DE81AA144A272B44BA1F16936AC');
bob.setPrivateKey('25FBB32EFBEC6ECB1314332A026582DB7BE00C051CF2FA80');

console.log(alice.getPublicKey());

process.exit();


//////

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
