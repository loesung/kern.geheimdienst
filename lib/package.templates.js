module.exports = function($){
    var exporting = {};
    var asn1 = $.nodejs['asn1.js'];

    ///////////////////// BASIC NON-EXPORTABLE TYPES /////////////////////

    var passphraseHint = asn1.define('passphraseHint', function(){
        this.seq().obj(
            this.key('hint').optional().explicit(1).octstr(),
            this.key('ciphertext').octstr()
        );
    });

    var codebookHint = asn1.define('codebookHint', function(){
        this.seq().obj(
            this.key('id').octstr(),
            this.key('ciphertext').octstr()
        );
    });

    var time = asn1.define('time', function(){
        this.int();
    });

    var pkiAlgorithm = asn1.define('pkiAlgorithm', function(){
        this.enum({
            0: 'MSS',
        });
    });

    var keySignatureAuthorizationType =
        asn1.define('keySignatureAuthorizationType', function(){
            this.enum({
                0: 'selfIdentityKeyID', // self signature
                1: 'keySignatureID',    // trusting a given signature
                2: 'trustOwnership',    // trust the declared ownership
                                        // of a key
            });
        });

    /////////////////////// CRYPTOGRAPHIC OBJECTS ////////////////////////

    /* identity */

    var identityContent = asn1.define('identityContent', function(){
        this.seq().obj(
            this.key('subject').octstr()
        );
    });

    var identityID = asn1.define('identityID', function(){
        this.octstr();
    });

    var identity = asn1.define('identity', function(){
        this.seq().obj(
            this.key('content').use(identityContent),
            this.key('id').use(identityID)
        );
    });

    /* codebook */

    var codebookContent = asn1.define('codebookContent', function(){
        this.seq().obj(
            this.key('members').seqof(identityID),
            this.key('credential').octstr(),
            this.key('validAfter').use(time),
            this.key('validTo').use(time)
        );
    });

    var codebook = asn1.define('codebook', function(){
        this.seq().obj(
            this.key('id').octstr(),
            this.key('content').use(codebookContent)
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
        // identity key
    var identityKeyContent = asn1.define('identityKeyContent', function(){
        this.seq().obj(
            this.key('algorithm').use(pkiAlgorithm),
            this.key('public').octstr()
        );
    });

    var identityKeyID = asn1.define('identityKeyID', function(){
        this.octstr();
    });

    var identityKey = asn1.define('identityKey', function(){
        this.seq().obj(
            this.key('content').use(identityKeyContent),
            this.key('credential').optional.explicit(0).octstr(),
            this.key('id').use(identityKeyID)
        );
    });

        //key Signature
    var keySignatureAuthorization = 
        asn1.define('keySignatureAuthorization', function(){
            this.seq().obj(
                this.key('type').use(keySignatureAuthorizationType),
                this.key('value').octstr(),
                this.key('validAfter').use(time).optional().explicit(0),
                this.key('validTo').use(time).optional().explicit(0)
            );
        });

    var keySignatureID = asn1.define('keySignatureID', function(){
        this.octstr();
    });

    var keySignatureContent = asn1.define('keySignatureContent', function(){
        this.seq().obj(
            this.key('issuer').octstr(),
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

        // for presenting a certification
    var certification = asn1.define('certification', function(){
        this.seq().obj(
            this.key('owner').use(identityID),
            this.key('identityKey').use(identityKey),
            this.key('signatures').seqof(keySignature)
        );
    });

    //////////////////////////////////////////////////////////////////////

    var ciphertext = 
        asn1.define('ciphertext', function(){
            this.seq().obj(
                this.key('passphrases').seqof(passphraseHint)
                    .optional().explicit(1),
                this.key('codebooks').seqof(codebookHint)
                    .optional().explicit(2),

                this.key('ciphertext').octstr()
            );
        });
    // XXX ciphertext is capable of carrying multiple types of hints:
    // passphrases, codebooks, and (not implemented) public keys.

    //////////////////////////////////////////////////////////////////////

    var envelope = asn1.define('envelope', function(){
        this.seq().obj(
            this.key('dataType').enum({
                1: 'ciphertext',
                2: 'codebook',
                3: 'identity',
            }),
            this.key('data').octstr()
        );
    });

    exporting = {
        identityContent: identityContent,
        identityID: identityID,
        identity: identity,

        keySignatureAuthorization: keySignatureAuthorization,
        keySignatureContent: keySignatureContent,
        keySignature: keySignature,

        codebookContent: codebookContent,
        codebook: codebook,

        ciphertext: ciphertext,

        envelope: envelope,
    };

    return exporting;
};
