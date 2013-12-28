require('../lib/baum.js');
require('../lib/_.js');

var storage = _.storage('../testStorage');
storage.load('abc', false, function(){
    storage.table('table')('1', 'value = 1!');
    storage.table('table')('2', {test: true, file:'abc'});
    console.log('*****************************', storage.table('table')('2'));
    storage.flush();
});
