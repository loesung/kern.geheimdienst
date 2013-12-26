var identity = $.global.get('storage').table('identity');

var handlers = {
    'add': require('./add.js')(identity),
    'delete': require('./delete.js')(identity),
    '': require('./list.js')(identity),
};

module.exports = function(){
    var router = $.net.urlRouter();

    router.handle('add', handlers['add'], {methods: ['post']});
    router.handle('delete', handlers['delete'], {methods: ['post']});
    router.handle('', handlers['']);

    return router;
};
