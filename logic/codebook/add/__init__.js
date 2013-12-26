module.exports = function(codebook){
    var handlers = {
            'letter': require('./letter.js')(codebook),
        },
        router = $.net.urlRouter()
    ;

    router.handle('letter', handlers['letter']);

    return router;
};
