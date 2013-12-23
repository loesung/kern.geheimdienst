require('./lib/baum.js');
require('./lib/_.js');

var rsa = _.asymcrypt.encrypting('rsa');
rsa.generate(2048, function(err, result){
    if(null != err)
        return console.log('err');

    
    
});
