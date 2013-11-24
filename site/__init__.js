var processors = {
    'auth': require('./auth.js'),
    'router': require('./router.js'),
};

module.exports = function(e){
    $.nodejs.async.waterfall(
        [
            processors['auth'](e),

            processors['router'](e), // must return a result.
        ],
        function(err, result){
            if(null != err){
                e.response.writeHead(403);
                e.response.end();
            } else {
                e.response.writeHead(200);
                e.response.end(result);
            };
        }
    );
};
