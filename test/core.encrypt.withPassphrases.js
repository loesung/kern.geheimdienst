require('../lib/baum.js');
require('../lib/_.js');

var core = require('../core')(null);

core.encrypt.withPassphrases(
    [
        new $.nodejs.buffer.Buffer('Be sure to use a passphrase that is very very long.', 'ascii'),
    ],

    new $.nodejs.buffer.Buffer('message', 'ascii'),

    {
        armor: true,
    },

    function(err, result){
        console.log(err);
        console.log(result);
    }
);
