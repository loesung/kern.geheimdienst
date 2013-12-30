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
                var code = 400;
                if($.types.isNumber(err))
                    code = err;
                if(undefined == result){
                    e.response.end(
                        code + ': ' + $.nodejs.http.STATUS_CODES[code]
                    );
                    return;
                };
            } else {
                var code = 200;
            };
            e.response.writeHead(code);
            if($.types.isString(result))
                e.response.end(result);
            else
                e.response.end(JSON.stringify(result));
        }
    );
};
