function add(data, callback){
};

function list(data, callback){
    var identity = $.global.get('storage').table('identity');
    callback(null, identity());
};

module.exports = function(){
    var router = $.net.urlRouter();

    router.handle('add', add, {methods: ['post']});
    router.handle('', list);

    return router;
};
