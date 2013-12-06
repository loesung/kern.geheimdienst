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

var b = 0, e = 0, testlen = 1024 * 1024;
var source = '';

function timediff(ns2, ns1){
    var ns = ns2[1] - ns1[1];
    var s = ns2[0] - ns1[0];
    if(ns < 0){
        ns += 1000000000;
        s -= 1;
    };
    return s * 1000000000 + ns;
};

$.nodejs.async.waterfall(
    [
        function(callback){
            source = $.nodejs.crypto.pseudoRandomBytes(testlen, function(e,s){
                callback(null, s);
            });
        },

        function(got, callback){
            b = process.hrtime();
            symcrypt.encrypt(key, got, callback);
        },

        function(got, callback){
            e = process.hrtime();
            console.log('encryption time in [ns]:', timediff(e,b));
            console.log('encryption speed: ', testlen / timediff(e,b) * 1000000000.0, 'Byte/s');
            console.log(got[0].length);
            console.log(got[1].length);

            b = process.hrtime();
            symcrypt.decrypt(key, got, callback);
        },

        function(got, callback){
            e = process.hrtime();
            console.log('decryption time in [ns]:', timediff(e,b));
            console.log('decryption speed: ', got.length / timediff(e,b) * 1000000000.0, 'Byte/s');
        },

    ],

    function(err, result){
    }
);/**/
