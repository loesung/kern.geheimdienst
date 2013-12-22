require('./lib/baum.js');
require('./lib/_.js');

var storage = _.storage('./testStorage', 'abc');
storage.table('table')('1', 'value1');
