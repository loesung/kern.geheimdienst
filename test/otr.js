require('../lib/baum.js');
require('../lib/_.js');

var sharedsecret = new $.nodejs.buffer.Buffer('the secret key', 'ascii');
var otrAlice = _.otr(sharedsecret), otrBob = _.otr(sharedsecret);

otrAlice.on('send', function(message){
    console.log('alice should send following ciphertext: \n', message);
});

otrAlice.send(new $.nodejs.buffer.Buffer('hallo', 'ascii'));
