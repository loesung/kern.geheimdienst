var identity = $.global.get('storage').table('identity');

var handlers = {
    'add': require('./add.js')(identity),
    'delete': require('./delete.js')(identity),
    '': require('./list.js')(identity),
};

var router = $.net.urlRouter();
module.exports = router; 

router.handle('add', handlers['add'], {methods: ['post']});
router.handle('delete', handlers['delete'], {methods: ['post']});
router.handle('', handlers['']);
