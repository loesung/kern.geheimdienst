module.exports = function(e){
    $.nodejs.async.waterfall(
        [
            require('./auth.js')(e),

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
