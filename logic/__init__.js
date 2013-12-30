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
            console.log(err, result);
            if(null != err){
                var code = 400;
                if(!isNaN(err)) code = Math.round(err);
            } else {
                var code = 200;
            };

            e.response.writeHead(code);
            if(undefined == result){
                e.response.end(
                    code + ': ' + $.nodejs.http.STATUS_CODES[code]
                );
            } else {
                if($.types.isString(result))
                    e.response.end(result);
                else
                    e.response.end(JSON.stringify(result));
            };
        }
    );
};
