require('../lib/baum.js');
require('../lib/_.js');
var ecdh = require('../lib/jsbn/__init__.js')($, _);

var curve = 'secp256r1';

var alice = new ecdh(curve),
    bob = new ecdh(curve);
/*
alice.setPrivateKey('83A2C9C8B96E5AF70BD480B472409A9A327257F1EBB73F5B073354B248668563');
bob.setPrivateKey('5E35D7D3F3C54DBAC72E61819E730B019A84208CA3A35E4C2E353DFCCB2A3B53');

console.log(alice.getPublicKey());

process.exit();
*/

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
