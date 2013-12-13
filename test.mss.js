require('./lib/baum.js');
require('./lib/_.js');

var mss = _.asymcrypt.signing('mss');
var tb = process.hrtime();
for(var i = 1; i<= 10; i++){
mss.sign(
    new $.nodejs.buffer.Buffer('abcdefg'), 
    new $.nodejs.buffer.Buffer('abcdefg0')
);
};
var te = process.hrtime();
console.log('end', (te[1]-tb[1] + 1000000000*(te[0]-tb[0])) / 1000000000);
