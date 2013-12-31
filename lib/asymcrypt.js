/*
 * Asymmetric Cipher
 */

var mss = require('./asymcrypt.mss.js'),
    ecdsa = require('./asymcrypt.ecdsa.js'),
    rsa = require('./asymcrypt.rsa.js');

module.exports = function($, _){
    return new function(){
        var self = this

        this.signing = function(algorithm){
            if('mss' == algorithm)
                return new mss($, _);
            else if('rsa' == algorithm)
                return new rsa($, _, true, false);
            else if('ecdsa' == algorithm)
                return new ecdsa($, _);
            else
                return false;
        };

        this.encrypting = function(algorithm){
            return new rsa($, _, false, true);
        };

        return this;
    };
};
