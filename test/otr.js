require('../lib/baum.js');
require('../lib/_.js');

var sharedsecret = new $.nodejs.buffer.Buffer('the secret key', 'ascii');
var otrAlice = _.otr(sharedsecret), otrBob = _.otr(sharedsecret);

console.log(otrAlice);
