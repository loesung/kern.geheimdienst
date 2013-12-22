var includes = [
    'cipher',
    'codebook',
];
var handlers = [];

for(var i in includes){
    var getHandler = require('./' + includes[i] + '.js')();
    if(!$.types.isArray(getHandler)) getHandler = [getHandler];

    for(var i in getHandler){
        var handler = getHandler[i];
        handlers.push((function(handler){
            console.log('add handler');
            return function(e, callback){
                var execResult = handler.pattern.exec(e.request.url);
                if(null == execResult) return false;

                // convert url regexp matched result into 'data'.
                var data = {};
                if(handler.mapping){
                    for(var i in handler.mapping){
                        if(undefined == execResult[i])
                            data[handler.mapping[i]] = null;
                        else
                            data[handler.mapping[i]] = execResult[i];
                    };
                };

                // deal with http method.
                var methods = ['post', 'get'];
                if(handler.configure && handler.configure.method)
                    methods = handler.configure.method;
                if(methods.indexOf(e.method) < 0)
                    return false;
                if('post' == e.method){
                    e.on('ready', function(post){
                        data['__post__'] = post;
                        for(var i in post.parsed)
                            if(undefined == data[i])
                                data[i] = post.parsed[i];
                        handler.handler(data, callback);
                    });
                } else {
                    handler.handler(data, callback);
                };

                return true;
            };
        })(handler));
    };
};

module.exports = function(e){
    return function(callback){
        console.log(e.request.url);
        for(var i in handlers){
            if(handlers[i](e, callback)) break;
        };
        callback(400);
    };
};
