module.exports = function($){
    var exporting = {};
    var asn1 = $.nodejs['asn1.js'];

    ///////////////////// BASIC NON-EXPORTABLE TYPES /////////////////////

    var passphraseHint = asn1.define('passphraseHint', function(){
        this.seq().obj(
            this.key('hint').optional().explicit(0).octstr(),
            this.key('ciphertext').octstr()
        );
    });

    var identityID = asn1.define('identityID', function(){
        this.octstr();
    });

    var time = asn1.define('time', function(){
        this.int();
    });

    var pkiAlgorithm = asn1.define('pkiAlgorithm', function(){
        this.enum({
            0: 'MSS',
        });
    });

    /////////////////////// CRYPTOGRAPHIC OBJECTS ////////////////////////

    /* identity */

    var identity = asn1.define('identity', function(){
        this.seq().obj(
            this.key('subject').octstr()
        );
    });


    /* codebook */

    var codebook = asn1.define('codebook', function(){
        this.seq().obj(
            this.key('member').seqof(identityID),
            this.key('credential').octstr(),
            this.key('validAfter').use(time),
            this.key('validTo').use(time)
        );
    });

    var codebookRequestContent =
        asn1.define('codebookRequestContent', function(){
            this.seq().obj(
                this.key('requester').use(identityID),
                this.key('algorithm').use(pkiAlgorithm),
                this.key('hint').octstr()
            );
        });

    var codebookRequest = asn1.define('codebookRequest', function(){
        this.seq().obj(
            this.key('content').use(codebookRequestContent),
            this.key('id').octstr(),
            this.key('signature').octstr()
        );
    });

    var codebookResponseContent = 
        asn1.define('codebookResponseContent', function(){
            this.seq().obj(
                this.key('responser').use(identityID),
                this.key('requestID').octstr(),
                this.key('response').octstr()
            );
        });

    var codebookResponse = asn1.define('codebookResponse', function(){
        this.seq().obj(
            this.key('content').use(codebookResponseContent),
            this.key('signature').octstr()
        );
    });


    /* PKI */

    var keySignatureAuthorization = 
        asn1.define('keySignatureAuthorization', function(){
            this.seq().obj(
                this.key('name').octstr(),
                this.key('value').octstr(),
                this.key('validTo').use(time).optional().explicit(0)
            );
        });

    var keySignatureContent = asn1.define('keySignatureContent', function(){
        this.seq().obj(
            this.key('issuer').octstr(),
            this.key('signed').enum({
                0: 'fingerprint',
                1: 'signature',
            }),
            this.key('validAfter').use(time),
            this.key('validTo').use(time),
            this.key('authorization').seqof(keySignatureAuthorization),
            this.key('revokeMagic').octstr()
        )
    });

    var keySignature = asn1.define('keySignature', function(){
        this.seq().obj(
            this.key('content').use(keySignatureContent),
            this.key('signature').octstr()
        );
    });

    var identityKey = asn1.define('identityKey', function(){
        this.seq().obj(
            this.key('algorithm').use(pkiAlgorithm),
            this.key('publicCredential').octstr(),
            this.key('privateCredential').optional().explicit(0).octstr(),
            this.key('fingerprint').octstr()
        );
    });

    var certificate = asn1.define('certificate', function(){
        this.seq().obj(
            this.key('owner').use(identityID),
            this.key('type').enum({0: 'public', 1: 'private'}),
            this.key('identityKeys').seqof(identityKey),
            this.key('signatures').seqof(keySignature)
        );
    });

    //////////////////////////////////////////////////////////////////////

    var ciphertextWithPassphrases = 
        asn1.define('ciphertextWithPassphrases', function(){
            this.seq().obj(
                this.key('passphrases').seqof(passphraseHint),
                this.key('ciphertext').octstr()
            );
        });

    //////////////////////////////////////////////////////////////////////

    var envelope = asn1.define('envelope', function(){
        this.seq().obj(
            this.key('dataType').enum({
                1: 'ciphertextWithPassphrases',
                2: 'codebook',
                3: 'identity',
            }),
            this.key('data').octstr()
        );
    });

    exporting = {
        identity: identity,

        keySignatureAuthorization: keySignatureAuthorization,
        keySignatureContent: keySignatureContent,
        keySignature: keySignature,

        codebook: codebook,

        ciphertextWithPassphrases: ciphertextWithPassphrases,

        envelope: envelope,
    };

    return exporting;
};
