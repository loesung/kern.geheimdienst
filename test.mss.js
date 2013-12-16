require('./lib/baum.js');
require('./lib/_.js');

var mss = _.asymcrypt.signing('mss');
var publicKey, signature;

mss.setPrivateKey(new $.nodejs.buffer.Buffer('abababababababababababababababababababababababababababab', 'hex'));

function signer(callback){
    mss.sign(new $.nodejs.buffer.Buffer('hi'), function(err, result){
        console.log(err, result);
        signature = result;
        callback(null);
    });
};

$.nodejs.async.waterfall([
    function(callback){
        mss.getPublicKey(function(err, key){
            publicKey = key;
            callback(err);
        });
    },

    signer, signer, signer,

    function(callback){
        mss.verify(signature, new $.nodejs.buffer.Buffer('hi'), function(e, r){
            console.log(r);
        });
    },

], function(err, result){
});
