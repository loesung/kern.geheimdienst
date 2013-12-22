require('./lib/baum.js');
require('./lib/_.js');

var storage = _.storage('./testStorage', 'abc');
storage.load(function(){
    console.log('*****************************', storage.table('table')('1'));
    storage.table('table')('1', 'value1');
    storage.table('table')('2', 'value2');
//    storage.flush();
});
