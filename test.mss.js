require('./lib/baum.js');
require('./lib/_.js');

var mss = _.asymcrypt.signing('mss');

mss.setPrivateKey(new $.nodejs.buffer.Buffer('abababababababababababababababababababababababababababab', 'hex'));
mss.getPublicKey(function(err, key){
    console.log(err, key);
});
