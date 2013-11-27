require('./lib/baum.js');
require('./lib/_.js');
CONFIG = $.config.createConfig('./config/');
/*
var socketPath = CONFIG.get('socket-path');

var IPCClient = $.net.IPC.client(socketPath);

console.log(socketPath);

IPCClient.request(
    '/encrypt/key',    
    function(err, e){
        if(null == err){
            console.log(e.response.statusCode);
            console.log(e.response.headers);
            e.on('ready', function(data){
                console.log(data.raw);
            });
        };
    },
    {
        post: 'checksum=&plaintext=' + $.nodejs.buffer.Buffer('Test Text One\nText Text;').toString('hex'),
    }
);

*/var symcrypt = require('./lib/symcrypt')($, _);
var l = 1024;

var key = new $.nodejs.buffer.Buffer('abcdefg');

$.nodejs.async.waterfall(
    [
        function(callback){
            source = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
            source += 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
            source += 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
            source += 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
            console.log(source.length);
            callback(null, new $.nodejs.buffer.Buffer(source));
            //$.nodejs.crypto.pseudoRandomBytes(l, callback);
        },

        function(got, callback){
            symcrypt.encrypt(key, got, callback);
        },

        function(got, callback){
            console.log(got);
            console.log(got[0].length);
            console.log(got[1].length);

            symcrypt.decrypt(key, got, callback);
        },

        function(got, callback){
            console.log(got.toString('ascii'));
            console.log(got.length);
        },

    ],

    function(err, result){
    }
);/**/
