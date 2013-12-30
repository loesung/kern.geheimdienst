var codebook = $.global.get('storage').table('codebook');

var handlers = {
    'add': require('./add/__init__.js')(codebook),
    '': require('./list.js')(codebook),
};

var router = $.net.urlRouter();
module.exports = router;

router.sub('add', handlers['add']);
//router.handle('delete', handlers['delete'], {methods: ['post']});
router.handle('', handlers['']);
