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

var b = 0, e = 0, testlen = 1024 * 10;
var source = '';

$.nodejs.async.waterfall(
    [
        function(callback){
            source = $.nodejs.crypto.pseudoRandomBytes(testlen, function(e,s){
                callback(null, s);
            });
        },

        function(got, callback){
            b = new Date().getTime();
            symcrypt.encrypt(key, got, callback);
        },

        function(got, callback){
            e = new Date().getTime();
            console.log('encryption time in [ms]:', e-b);
            console.log('encryption speed: ', testlen / (e-b) * 1000.0, 'Byte/s');
            console.log(got[0].length);
            console.log(got[1].length);

            b = new Date().getTime();
            symcrypt.decrypt(key, got, callback);
        },

        function(got, callback){
            e = new Date().getTime();
            console.log('decryption time in [ms]:', e-b);
            console.log('decryption speed: ', got.length / (e-b) * 1000.0, 'Byte/s');
        },

    ],

    function(err, result){
    }
);/**/
