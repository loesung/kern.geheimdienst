require('./lib/baum.js');
require('./lib/_.js');

var mss = _.asymcrypt.signing('mss');
/*var result = mss.sign(
    new $.nodejs.buffer.Buffer('abcdefg'), 
    new $.nodejs.buffer.Buffer('abcdefg0')
);*/

console.log(mss.derivePublicKey(
    new $.nodejs.buffer.Buffer('abcdefg0')
));
