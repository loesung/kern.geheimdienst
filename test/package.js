require('../lib/baum.js');
require('../lib/_.js');

var der = _.package.armoredPack('ciphertext-with-passphrases', {
    passphrases: [
        {
            hint: '',
            ciphertext: '0101',
        },
        {
            hint: 'abc',
            ciphertext: '0202',
        },
    ], 
    ciphertext: '010202',
});

console.log(der);

var decoded = _.package.parse('ciphertext-with-passphrases', der);
console.log(decoded);
