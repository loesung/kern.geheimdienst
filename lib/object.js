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
                life: function(obj){
                    if(!$.types.isNumber(obj)) return false;
                    if(obj <= 0) return false;
                    return true;
                },
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

            pki: {      //0x02
                keyClass: {     //0x0201
                    PRIVATE: 0x020101,
                    PUBLIC: 0x020102,
                },

                keyAlgo: {      //0x0202
                    RSA2048SignOnly: 0x020201,
                    RSA3072SignOnly: 0x020202,
                    RSA4096SignOnly: 0x020203,
                    RSA8192SignOnly: 0x020204,

                    MSS224SignOnly: 0x020211,
                },
            },
        };

        this.denumerate = function(enumerator, value){
            for(var key in enumerator)
                if(enumerator[key] == value) return key;
            return null;
        };

        this.hash = function(obj){
            var keys = Object.keys(obj).sort(), key, objBuffer;
            var hashes = [];

            for(var i in keys){
                key = keys[i];
                if($.types.isObject(obj[key]))
                    hashes.push(self.hash(obj[key]));
                else {
                    key = new $.nodejs.buffer.Buffer(key);
                    if($.types.isString(obj[key]))
                        objBuffer = new $.nodejs.buffer.Buffer(obj[key]);
                    else if($.types.isArray(obj[key])){
                        var subHashes = [];
                        for(var i in obj[key])
                            subHashes.push(self.hash(obj[key][i]))
                        objBuffer = new $.nodejs.buffer.Buffer(
                            subHashes.join('-')
                        );
                    } else
                        objBuffer = new $.nodejs.buffer.Buffer(
                            obj[key].toString()
                        );
                    hashes.push(standardHash(objBuffer, key));
                };
            };

            return standardHash(hashes.join('|'), 'object-hash');
        };

        return this;
    };
};
