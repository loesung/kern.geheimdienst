function decryptWithPassphrases(ciphertext, key, callback){
    var answer = key, examineTargets = ciphertext.passphrases, trys=[];

    try{
        // to find an answer
        if($.types.isObject(answer)){
            answer = key.passphrase;
            examineTargets = [examineTargets[index], ];
        };

        if(!$.types.isBuffer(answer))
            answer = new $.nodejs.buffer.Buffer(answer);

        for(var i in examineTargets){
            var examineTarget = examineTargets[i],
                hintCiphertext = examineTarget.ciphertext;

            if($.types.isBuffer(hintCiphertext)) trys.push(hintCiphertext);
        };
    } catch(e){
        return callback(Error('unrecognized-key'));
    };

    // decrypt all possibilities and obtain the main key.
    var tasks = [];
    for(var i in trys){
        tasks.push((function(tryCiphertext, answerKey){
            return function(callback){
                _.symcrypt.decryptEncoded(
                    answerKey,
                    tryCiphertext,
                    function(err, result){
                        if(null != err) return callback(null, false);
                        callback(null, result);
                    }
                );
            };
        })(trys[i], answer));
    };


    var workflow = [];
   
    // do decryption to obtain the main key
    workflow.push(function(callback){
        $.nodejs.async.series(tasks, callback);
    });

    // find the first main key to decrypt
    workflow.push(function(results, callback){
        var found = false;
        for(var i in results)
            if(results[i]){
                found = results[i];
                break;
            };
        if(!found) return callback(Error('wrong-passphrase'));
        callback(null, found);
    });

    // decrypt
    workflow.push(function(mainKey, callback){
        _.symcrypt.decryptEncodedCompressed(mainKey, ciphertext, callback);
    });


    $.nodejs.async.waterfall(workflow, function(err, result){
        if(null != err) return callback(err);
        callback(null, result);
    });
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function(storage){
    /* decrypt message
     * 
     * the ciphertext will be automatically recognized. the key should be
     * provided according to the answer provided by `core.decrypt.examine`.
     */
    return function(ciphertext, key, callback){
        var overview = _.package.parse(message);
        if(null == overview) return callback(Error('unrecognized-data'));

        var dataType = overview[0], data = overview[1];
        if(!dataType.startsWith('ciphertext'))
            return callback(Error('not-ciphertext'));

        switch(dataType){
            case 'ciphertextWithPassphrases':
                decryptWithPassphrases(data, key, callback);
                break;
            default:
                return callback(Error('unrecognized-data'));
        };
    };
};
