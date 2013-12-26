var includes = [
    'identity',
    'codebook',
];
var handlers = [];

$.global.set('router', $.net.urlRouter());
for(var i in includes){
    $.global.get('router').sub(
        includes[i],
        require(
            $.process.resolvePath('./logic/' + includes[i] + '/__init__.js')
        )()
    );
};

function callHandler(handler){
    return function(e, callback){
        var options = handler.__options;
        var data = {
            get: $.nodejs.querystring.parse(
                $.nodejs.url.parse(e.request.url).query
            ),
            post: {},
        };

        // deal with http method.
        var methods = ['post', 'get'];
        if(options && options.methods)
            methods = options.methods;
        if(methods.indexOf(e.method) < 0)
            return callback(405);
        if('post' == e.method){
            e.on('ready', function(post){
                data.post = post.parsed; // raw data is not passed.
                handler(data, callback);
            });
        } else {
            handler(data, callback);
        };
    };
};

module.exports = function(e){
    return function(callback){
        console.log(e.request.url);

        var handler = $.global.get('router')(e.request.url);
        if(!handler) return callback(400);

        callHandler(handler)(e, callback);
    };
};
