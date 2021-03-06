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

    var asymmetricKeyHint = asn1.define('asymmetricKeyHint', function(){
        this.seq().obj(
            this.key('asymmetricKeyID').octstr(), // receiver's key id
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

    var signatureAuthorizationType =
        asn1.define('signatureAuthorizationType', function(){
            this.enum({
                0: 'identityBinding',
                1: 'miscellaneous',
                127: 'approval',
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
    var publicKey = asn1.define('publicKeyContent', function(){
        this.seq().obj(
            this.key('algorithm').use(pkiAlgorithm),
            this.key('data').octstr()
        );
    });

    var asymmetricKey = asn1.define('aymmetricKey', function(){
        this.seq().obj(
            this.key('publicKey').use(publicKey),
            this.key('privateKey').optional.explicit(0).octstr(),
            this.key('id').octstr(),    // = the hash of public key
        );
    });

        //key Signature
    var signatureAuthorization = 
        asn1.define('signatureAuthorization', function(){
            this.seq().obj(
                this.key('type').use(signatureAuthorizationType),
                this.key('value').octstr(),
                this.key('validAfter').use(time).optional().explicit(0),
                this.key('validTo').use(time).optional().explicit(1)
            );
        });

    var signatureContent = asn1.define('signatureContent', function(){
        this.seq().obj(
            this.key('issuer').octstr(),
            this.key('holder').octstr(),
            this.key('validAfter').use(time),
            this.key('validTo').use(time),
            this.key('authorization').seqof(signatureAuthorization),
            this.key('revokeMagic').octstr()
        )
    });

    var signature = asn1.define('signature', function(){
        this.seq().obj(
            this.key('content').use(signatureContent),
            this.key('signature').octstr(),
            this.key('id').octstr(),
        );
    });

        // for presenting a certification, but this may not be a certificate.
        // (This just presents the necessary info, may be an excerpt.)
    var certification = asn1.define('certification', function(){
        this.seq().obj(
            this.key('owner').use(identityID),
            this.key('publicKey').use(publicKey),
            this.key('signatures').seqof(signature)
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
                this.key('asymmetricKeys').seqof(asymmetricKeyHint)
                    .optional().explicit(3),

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

        signatureAuthorization: signatureAuthorization,
        signatureContent: signatureContent,
        signature: signature,

        codebookContent: codebookContent,
        codebook: codebook,

        ciphertext: ciphertext,

        envelope: envelope,
    };

    return exporting;
};
