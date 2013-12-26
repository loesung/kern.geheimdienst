module.exports = function($, _){
    function standardHash(data, key){
        return _.digest.whirlpoolHmac(data, key).toString('hex');
    };

    return new function(){
        function doTest(rule){
            return function(obj){
                if(!$.types.isString(obj)) return false;
                return rule.test(obj);
            };
        };

        this.test = {
            identity: {
                id: doTest(/^[0-9a-f]{128}$/i),
                name: doTest(/^[0-9a-zA-Z_\(\)\[\]\.]{5,64}$/),
            },

            codebook: {
                id: doTest(/^[0-9a-f]{128}$/i),
            },
        };

        this.derive = {
            identity: {
                id: {
                    fromName: function(name){
                        return standardHash(name, 'identity-id');
                    },
                },
            },

            codebook: {
                id: {
                    fromCredential: function(credential){
                        return standardHash(credential, 'codebook-id');
                    },
                },
            },
        };

        this.enumerate = {
            codebook: {     // 0x01 .. ..
                status: {    // 0x0101 ..
                    NEW: 0x010101,
                    ESTABLISHED: 0x010102,
                    OLD: 0x010103,
                },
            },
        };

        return this;
    };
};
