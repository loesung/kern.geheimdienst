var identity = $.global.get('storage').table('identity');

var handlers = {
    add: require('./add.js')(identity),
    _: require('./list.js')(identity),
};

module.exports = function(){
    var router = $.net.urlRouter();

    router.handle('add', handlers.add, {methods: ['post']});
    router.handle('', handlers._);

    return router;
};
