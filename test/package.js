require('../lib/baum.js');
require('../lib/_.js');

var identityIns = _.package.pack('identity', {
    subject: new $.nodejs.buffer.Buffer('0101', 'hex'),
});

console.log(identityIns);
