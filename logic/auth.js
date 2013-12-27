function loadStorage(passphrase){
    $.global.get('storage').load(passphrase, function(err){
        if(null != err){
            console.log('Failed to read storage using given passphrase.');
            console.log(err);
            process.exit(1);
            return;
        };
    });
};

module.exports = function(e){
    return function(callback){
        function failAuth(){
            e.response.writeHead(401, {
                'WWW-Authenticate': 'Basic realm="Geheimdienst"',
            });
            callback(401);
        };

        var requestAuth = e.request.headers['authorization'], password;

        // obtain the password in request
        if(undefined == requestAuth){
            return failAuth();
        } else {
            var b64auth = /^Basic\s(.+)$/.exec(requestAuth)[1];
            try{
                var plainAuth = new $.nodejs.buffer.Buffer(b64auth, 'base64'),
                    colonPos = plainAuth.toString().indexOf(':');

                if(colonPos < 0) return failAuth();
                password = plainAuth.slice(colonPos + 1);

                password = new $.nodejs.buffer.Buffer(
                    password.toString(),
                    'hex'
                );
            } catch(e){
                return failAuth();
            };
        };

        // check if storage is loaded
        if($.global.get('storage').loaded()){
            if(!$.global.get('storage').checkPassphrase(password))
                failAuth();
            else
                callback(null);
        } else {
            $.global.get('storage').load(password, function(err){
                String("Loading database.").NOTICE();
                if(null == err) 
                    callback(null);
                else
                    failAuth();
            });
        };
    };
};
