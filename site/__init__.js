var processors = {
    'auth': require('./auth.js'),
};

module.exports = function(e){
    $.nodejs.async.waterfall(
        [
            processors['auth'](e),

        ],
        function(err, result){
            if(null != err){
                e.response.writeHead(403);
                e.response.end();
            } else {
                e.response.end('hallo');
            };
        }
    );
};
