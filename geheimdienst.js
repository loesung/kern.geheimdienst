/*
 * A registery server
 *
 * This server listens on a UNIX socket. It provides all other servers on
 * this system with access to global options.
 */
require('./lib/baum.js');
require('./lib/_.js');

$.global.set('config', $.config.createConfig('./config/'));

var socketPath = $.global.get('config').get('socket-path'),
    storagePath = 
        $.process.resolvePath($.global.get('config').get('storage-path')),
    passphrase = process.argv[2];

if(!$.types.isString(passphrase)){
    console.log('Need a passphrase.');
    process.exit(1);
};

$.global.set('storage', _.storage(storagePath));

var IPCServer = $.net.IPC.server(socketPath);
console.log('IPC Server created at: ' + socketPath);

IPCServer.on('data', require('./logic/__init__.js'));
IPCServer.on('error', function(err){
    try{
        console.log('ERROR! ' + err);
    } catch(e){
    };
});

IPCServer.start();
