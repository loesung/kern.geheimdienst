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

        /* filter identity IDs */
        identityIDs = core._util.filter.identityIDs(identityIDs);


    };
};
