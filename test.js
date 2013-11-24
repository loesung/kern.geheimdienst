require('./lib/baum.js');
CONFIG = $.config.createConfig('./config/');
var socketPath = CONFIG.get('socket-path');

var IPCClient = $.net.IPC.client(socketPath);

console.log(socketPath);

IPCClient.request(
    '/encrypt/codebook',    
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
        post: 'abcdefg',
    }
);

/*var symcrypt = require('./lib/symcrypt')($);
var l = 1024;

$.nodejs.async.waterfall(
    [
        function(callback){
            source = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
            source += 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
            source += 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
            source += 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
            console.log(source.length);
            callback(null, source);
            //$.nodejs.crypto.pseudoRandomBytes(l, callback);
        },

        function(got, callback){
            symcrypt.encrypt('abcdefg', got, callback);
        },

        function(got, callback){
            console.log(got);
            console.log(got[0].length);
            console.log(got[1].length);

            symcrypt.decrypt('abcdefg', got, callback);
        },

        function(got, callback){
            console.log(got.toString('ascii'));
            console.log(got.length);
        },

    ],

    function(err, result){
    }
);*/
