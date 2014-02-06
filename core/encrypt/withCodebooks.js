function isSubset(testSubset, mainSet){
    var inMainset;
    for(var i in testSubset){
        inMainSet = false;
        for(var j in mainSet){
            if(testSubset[i] == mainSet[j]){
                inMainSet = true;
                break;
            };
        };
        if(!inMainSet) return false;
    };
    return true;
};

module.exports = function(storage, core){
    return function(a, b, c, d){
        /*
         * (identityIDs, plaintext, [options], callback)
         *
         * options:
         *     encryptKeyLength: >= 32
         */

        var identityIDs = a, plaintext = b;
        if(d == undefined)
            var useropt = {},
                callback = c;
        else
            var useropt = c,
                callback = d;

        //////////////////////////////////////////////////////////////
        
        var workflow = [];

        /* filter identity IDs */
        workflow.push(function(callback){
            core._util.filter.identityIDs(identityIDs, function(err, result){
                if(null == err) identityIDs = result;
                callback(err);
            });
        });


        /* 
         * get all possible codebooks
         *
         * that is to say, the members in each codebook is a subset of given
         * identityIDs.
         */
        workflow.push(function(callback){
        });

        
        $.nodejs.async.waterfall(workflow, callback);
    };
};
