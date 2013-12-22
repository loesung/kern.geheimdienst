require('./lib/baum.js');
require('./lib/_.js');

var storage = _.storage('./testStorage', 'abc');
storage.load(function(){
//  storage.table('table')('1', 'value = 1!');
//    storage.table('table')('2', 'value = 2! second time');
    console.log('I AM HERE.');
    console.log('*****************************', storage.table('table')('2'));
//    storage.flush();
});
