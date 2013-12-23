require('./lib/baum.js');
require('./lib/_.js');

var rsa = _.asymcrypt.encrypting('rsa');
rsa.generate(2048, function(err, result){
    if(null != err)
        return console.log('err');
   
    rsa.encrypt(new $.nodejs.buffer.Buffer('a'), function(err, result){
        rsa.decrypt(result, function(err, result){
            console.log(err, result.toString());
        });
    });
});
