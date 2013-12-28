module.exports = function(e){
    return function(callback){
        function failAuth(code){
            e.response.writeHead(code, {
                'WWW-Authenticate': 'Basic realm="Geheimdienst"',
            });
            callback(code);
        };

        var requestAuth = e.request.headers['authorization'], 
            username,
            password;

        // obtain the password in request
        if(undefined == requestAuth){
            return failAuth(401);
        } else {
            var b64auth = /^Basic\s(.+)$/.exec(requestAuth)[1];
            try{
                var plainAuth = new $.nodejs.buffer.Buffer(b64auth, 'base64'),
                    colonPos = plainAuth.toString().indexOf(':');

                if(colonPos < 0) return failAuth();
                username = plainAuth.slice(0, colonPos);
                password = plainAuth.slice(colonPos + 1);

                password = new $.nodejs.buffer.Buffer(
                    password.toString(),
                    'hex'
                );
            } catch(e){
                return failAuth(401);
            };
        };

        // check if storage is loaded
        if($.global.get('storage').loaded()){
            if(!$.global.get('storage').checkPassphrase(password))
                failAuth(401);
            else
                callback(null);
        } else {
            var allowCreate = (username == 'creator');
            $.global.get('storage').load(password, allowCreate, function(err){
                String("Loading database. Creation is " + (allowCreate?'allow':'disallow') + 'ed.' ).NOTICE();
                if(null == err) 
                    callback(null);
                else {
                    String("Error: " + err + ' Authorization failed.');
                    failAuth((404 == err?404:401));
                };
            });
        };
    };
};
