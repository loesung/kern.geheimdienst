module.exports = function($){
    var exporting = {};
    var asn1 = $.nodejs['asn1.js'];

    var passphraseHint = asn1.define('passphraseHint', function(){
        this.seq().obj(
            this.key('hint').octstr(),
            this.key('ciphertext').bitstr()
        );
    });

    var identityID = asn1.define('identityID', function(){
        this.bitstr();
    });

    var time = asn1.define('time', function(){
        this.int();
    });

    //////////////////////////////////////////////////////////////////////

    var identity = asn1.define('identity', function(){
        this.seq().obj(
            this.key('subject').bitstr()
        );
    });

    var codebook = asn1.define('codebook', function(){
        this.seq().obj(
            this.key('member').seqof(identityID),
            this.key('credential').bitstr(),
            this.key('validAfter').use(time),
            this.key('validTo').use(time)
        );
    });

    var certificate = asn1.define('certificate', function(){
        this.seq().obj(
            this.key('owner').use(identityID)
        );
    });

    //////////////////////////////////////////////////////////////////////

    var ciphertextWithPassphrases = 
        asn1.define('ciphertextWithPassphrases', function(){
            this.seq().obj(
                this.key('passphrases').seqof(passphraseHint),
                this.key('ciphertext').bitstr()
            );
        });

    exporting = {
        identity: identity,

        codebook: codebook,

        ciphertextWithPassphrases: ciphertextWithPassphrases,
    };

    return exporting;
};
