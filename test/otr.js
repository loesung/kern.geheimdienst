require('../lib/baum.js');
require('../lib/_.js');

var sharedsecret = new $.nodejs.buffer.Buffer('the secret key', 'ascii');
var otrAlice = _.otr(sharedsecret), otrBob = _.otr(sharedsecret);

otrAlice.on('send', function(message){
    console.log('alice should send following ciphertext: \n', message);
    otrBob.receive(message);
});

otrBob.on('receive', function(message){
    console.log('bob received following text: \n', message);
});

otrBob.on('error', function(err){
    console.log('bob found an error: \n', err);
});

otrAlice.send(new $.nodejs.buffer.Buffer('hallo', 'ascii'));
