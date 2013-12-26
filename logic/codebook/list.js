module.exports = function(codebook){
    function filterCodebook(aCodebook){
        return {
            id: aCodebook.id,
            owners: aCodebook.owner,
            status: aCodebook.status,
            creation: aCodebook.creation,
        };
    };

    return function(data, callback){
        var identityQuery = data.get.identity,
            codebookQuery = data.get.codebook;

        if(undefined == identityQuery && undefined == codebookQuery)
            return callback(403);   // cannot list all codebook

        if(undefined != identityQuery && undefined != codebookQuery)
            return callback(409);   // conflict

        if(codebookQuery){
            codebookQuery = codebookQuery.toLowerCase();

            if(!_.object.test.codebook.id(codebookQuery))
                return callback(400); // bad codebook id
            
            var theCodebook = codebook(codebookQuery);
            if(false === theCodebook) return callback(404); // not found

            return callback(null, filterCodebook(theCodebook));
        };

        if(identityQuery){
            identityQuery = identityQuery.toLowerCase();

            if(!_.object.test.identity.id(identityQuery))
                return callback(400); // bad identity id
            
            var allCodebooks = codebook(),
                ret = [];
            for(var codebookID in allCodebooks){
                if(allCodebooks[codebookID].owners.indexOf(identityQuery))
                    ret.push(filterCodebook[codebookID]);
            };

            return callback(null, ret);
        };

        return callback(422);
    };
};
