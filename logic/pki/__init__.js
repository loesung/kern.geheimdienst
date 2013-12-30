var router = $.net.urlRouter();
module.exports = router;

var dataSource = {
    identity: $.global.get('storage').table('identity'),
    pki: $.global.get('storage').table('pki'),
};

router
    .handle('', require('./list.js')(dataSource))
    .handle('generate', require('./generate.js')(dataSource))
;
