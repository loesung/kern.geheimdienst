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
var l = 1024;

$.nodejs.async.waterfall(
    [
        function(callback){
            callback(null, 'testthingsakkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk!');
            //$.nodejs.crypto.pseudoRandomBytes(l, callback);
        },

        function(got, callback){
            symcrypt.encrypt('abcdefg', got, callback);
        },

        function(got, callback){
            console.log(got);
            console.log(got.length);

            symcrypt.decrypt('abcdefg', got, callback);
        },

        function(got, callback){
            console.log(got.toString('ascii'));
        },

    ],

    function(err, result){
    }
);
