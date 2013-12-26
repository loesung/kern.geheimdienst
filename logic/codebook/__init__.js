var codebook = $.global.get('storage').table('codebook');

var handlers = {
    'add': require('./add/__init__.js')(codebook),
    '': require('./list.js')(codebook),
};

module.exports = function(){
    var router = $.net.urlRouter();

    router.sub('add', handlers['add']);
    //router.handle('delete', handlers['delete'], {methods: ['post']});
    router.handle('', handlers['']);

    return router;
};
