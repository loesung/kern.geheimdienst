module.exports = function(key, ciphertext, callback){
    var answer = key, examineTargets = ciphertext.passphrases, trys=[];

    try{
        // to find an answer
        if(!$.types.isBuffer(answer)){
            answer = key.passphrase;
            examineTargets = [examineTargets[index], ];
        };

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
        _.symcrypt.decryptEncodedCompressed(
            mainKey, 
            ciphertext.ciphertext,
            callback
        );
    });


    $.nodejs.async.waterfall(workflow, function(err, result){
        if(null != err) return callback(err);
        callback(null, result);
    });
};
