module.exports = function(codebook){
    function addFunc(owners, credential, status, rueckruf){
        var workflow = [];

        var newCodebook = {
            id: null,
            credential: null,
            owners: owners,
            status: status,
            creation: (new Date().getTime()),
        };
        
        // make credential more random 
        workflow.push(function(callback){
            $.nodejs.crypto.pbkdf2(
                credential,
                new $.nodejs.buffer.Buffer(
                    'loesung-sharedsecret'
                ), //just avoiding existing things
                2,  // enough. that is not deriving a key.
                512, // bytes
                callback
            );
        });

        // get the codebook id
        workflow.push(function(credential, callback){
            newCodebook.credential = credential.toString('hex');
            callback(
                null,
                _.object.derive.codebook.id.fromCredential(credential)
            );
        });

        // save codebook id.
        workflow.push(function(codebookID, callback){
            newCodebook.id = codebookID;
            callback(null);
        });

        // FINAL
        $.nodejs.async.waterfall(workflow, function(err){
            if(null != err) return rueckruf(true);
            codebook(newCodebook.id, newCodebook);
            rueckruf(null);
        });
    };

    var handlers = {
            'letter': require('./letter.js')(codebook, addFunc),
            'sharedsecret': require('./sharedsecret.js')(codebook, addFunc),
        },
        router = $.net.urlRouter()
    ;

    router.handle(
        'letter',
        handlers['letter'],
        {methods: ['post']}
    );
    router.handle(
        'sharedsecret',
        handlers['sharedsecret'], 
        {methods: ['post']}
    );

    return router;
};
