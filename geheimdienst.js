/*
 * A registery server
 *
 * This server listens on a UNIX socket. It provides all other servers on
 * this system with access to global options.
 */
require('./lib/baum.js');
require('./lib/_.js');
CONFIG = $.config.createConfig('./config/');

var socketPath = CONFIG.get('socket-path');

var IPCServer = $.net.IPC.server(socketPath);
console.log('IPC Server created at: ' + socketPath);

IPCServer.on('data', function(e){
    
    _.symcrypt.encrypt('abcdefg', (new Date().getTime().toString()), function(err, cipherresult){
        _.symcrypt.decrypt('abcdefg', cipherresult, function(err, data){
            e.response.setHeader('content-type', 'text/html');
            e.response.writeHead(200);
            e.response.write(JSON.stringify(data.toString()) + '\n');
            e.response.write($.nodejs.url.format(e.url));
            e.end('Here is Regtable from Project Loesung.');
        });
    });

});

IPCServer.start();
