require('./lib/baum.js');
CONFIG = $.config.createConfig('./config/');
/*var socketPath = CONFIG.get('socket-path');

var IPCClient = $.net.IPC.client(socketPath);

IPCClient.request(
    '/abc/def',    
    function(err, e){
        if(null == err){
            console.log(e.response.statusCode);
            console.log(e.response.headers);
            e.on('ready', function(data){
                console.log(data);
            });
        };
    }
);*/

var symcrypt = require('./lib/symcrypt')($);
var l = 1024 * 1;
$.nodejs.crypto.pseudoRandomBytes(l, function(err, plaintext){
    var b = new Date().getTime();
    symcrypt.encrypt('abcdefg', plaintext, function(err, got){
        var e = new Date().getTime();
        console.log(err, got);
        console.log(got.length);
        console.log('Costed ' + (e-b) + ' milliseconds.');
        console.log('Speed', l * 1000.0 / 1024 / (e-b), 'kBytes/second');
    });
});
