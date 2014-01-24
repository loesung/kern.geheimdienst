module.exports = function($){
    var ret = {};
    var asn1 = $.nodejs['asn1.js'];

    var passphraseHint = asn1.define('passphraseHint', function(){
        this.seq().obj(
            this.key('hint').octstr(),
            this.key('ciphertext').octstr()
        );
    });

    ret['ciphertext-with-passphrases'] =
        asn1.define('ciphertextWithPassphrases', function(){
            this.seq().obj(
                this.key('passphrases').seqof(passphraseHint),
                this.key('ciphertext').octstr()
            );
        });

    return ret;
};
