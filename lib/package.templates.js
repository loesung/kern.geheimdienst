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

    var pkiAlgorithm = asn1.define('pkiAlgorithm', function(){
        this.enum({
            0: 'MSS',
        });
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

    var keySignatureAuthorization = 
        asn1.define('keySignatureAuthorization', function(){
            this.seq().obj(
                this.key('name').octstr(),
                this.key('value').octstr()
            );
        });

    var keySignature = asn1.define('keySignature', function(){
        this.seq().obj(
            this.key('issuer').bitstr(),
            this.key('signed').enum({
                0: 'fingerprint',
                1: 'signature',
            }),
            this.key('validAfter').use(time),
            this.key('validTo').use(time),
            this.key('authorization').seqof(keySignatureAuthorization),
            this.key('revokeMagic').bitstr(),

            this.key('signature').bitstr()
        )
    });

    var identityKey = asn1.define('identityKey', function(){
        this.seq().obj(
            this.key('algorithm').use(pkiAlgorithm),
            this.key('publicCredential').bitstr(),
            this.key('privateCredential').optional().bitstr(),
            this.key('fingerprint').bitstr(),
            this.key('signatures').seqof(keySignature)
        );
    });

    var certificate = asn1.define('certificate', function(){
        this.seq().obj(
            this.key('owner').use(identityID),
            this.key('publicKey').seqof(identityKey)
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
