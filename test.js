require('./lib/baum.js');
CONFIG = $.config.createConfig('./config/');
var socketPath = CONFIG.get('socket-path');

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
);
