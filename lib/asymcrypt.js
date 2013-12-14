function mss($, _){
    var algorithm = _.digest.sha256;

    function rebase_string(buf, w_bits){
        var binstr = '';
        var string = buf.toString('hex');
        for(var i=0; i<string.length; i++){
            var b = parseInt(string.substr(i,1), 16).toString(2);
            binstr += '0000'.substr(0, 4-b.length) + b;
        };

        var pad_zero_count = binstr.length % w_bits;
        if(pad_zero_count > 0)
            binstr = 
                '000000000000000000000'.substr(0, w_bits - pad_zero_count)
                + binstr
            ;

        var result = [], fetch;
        while(binstr != ''){
            fetch = binstr.substr(0, w_bits);
            binstr = binstr.substr(w_bits);
            result.push(parseInt(fetch, 2));
        };
        return result;
    };
    
    function winternitzOTS(){
        var self = this;

        var w_bits = 6;

        var w = Math.pow(2, w_bits);
        var m = 256, 
            l_1 = Math.ceil(m / Math.log(w) * Math.log(2)),
            l_2 = Math.floor(Math.log(l_1 * (w - 1)) / Math.log(w)) + 1,
            l = l_1 + l_2;
        
        function hashMessage(message){
            return algorithm(message);
        };

        function winternitzCompress(messageHash){
            var M = [], b = [], C = 0;
            // W-OTS signs messages of binary length m.
            if(m != messageHash.length * 8) throw Error();

            // They are processed in base w representation.
            M = rebase_string(messageHash, w_bits);
            if(l_1 != M.length) throw Error();
            // The checksum ...
            for(var i=1; i<=l_1; i++){
                C += w - 1 - M[i-1];
            };

            // in base w representation... 
            var Cw = [];
            C = C.toString(2);
            while(C.length > 0){
                Cw.unshift(parseInt(C.substr(-w_bits),2));
                C = C.substr(0, C.length - w_bits);
            };
            while(Cw.length < l_2)
                Cw.unshift(0);

            // is appended to M.
            b = M.slice(0, M.length);
            for(var i in Cw)
                b.push(Cw[i]);
            
            // It is of length l_2
            if(l_2 != Cw.length) throw Error();

            // The result is (b_1, ..., b_l)

            if(l != b.length) throw Error();

            return b;            
        };

        function iterateHashInit(privateKey, i){
            return algorithm(
                $.nodejs.buffer.Buffer.concat([
                    privateKey,
                    new $.nodejs.buffer.Buffer((i).toString(), 'ascii'),
                ])
            );
        };

        this.publicKey = function(privateKey){
            var iterateHash, retPub = [];
            for(var i=0; i<l; i++){
                iterateHash = iterateHashInit(privateKey, i);
                for(var j=0; j<w; j++){
                    iterateHash = algorithm(iterateHash);
                };
                retPub.push(iterateHash);
            };
            return retPub;
        };

        this.sign = function(privateKey, message){
            /*
             * generate Winternitz-OTS signature
             *
             * The public key and the signature are given out in the result.
             */
            var messageHash = hashMessage(message);
            var signArray = winternitzCompress(messageHash);
            
            var signedValue, iterateHash, retSig=[], retPub=[];
            var benchmarkCount=0;
            for(var i in signArray){
                signedValue = signArray[i];
                iterateHash = iterateHashInit(privateKey, i);
                benchmarkCount += 1;
                
                for(var j=0; j<w; j++){
                    if(j == signedValue) retSig.push(iterateHash);
                    iterateHash = algorithm(iterateHash); 
                    // ^^ hash after potential push, therefore
                    // no fear of leaking private key.
                    benchmarkCount += 1;
                };
                retPub.push(iterateHash);
            };

            return [retPub, retSig];
        };

        this.verify = function(publicKey, signature, message){
            var messageHash = hashMessage(message);
            var signedArray = winternitzCompress(messageHash);

            var remainingTimes, iterateHash;
            for(var i in signedArray){
                remainingTimes = w - signedArray[i];
                if(remainingTimes < 0) return false;

                iterateHash = signature[i];
                for(var j=0; j<remainingTimes; j++){
                    iterateHash = algorithm(iterateHash);
                };

                if(iterateHash.toString() != publicKey[i].toString()){
                    return false;
                };
            };

            return true;
        };

        return this;
    };

    function MSSTree(layer){
        var self = this;

        var capacity = Math.pow(2, layer);
        
        function joinHash(hash1, hash2){
            if(
                hash1.slice(0,1).toString('hex') >
                hash2.slice(0,1).toString('hex')
            )
                return algorithm($.nodejs.buffer.Buffer.concat([
                    hash1,
                    hash2,
                ]));
            else
                return algorithm($.nodejs.buffer.Buffer.concat([
                    hash2,
                    hash1,
                ]));
        };

        function getLeafPrivateKey(seed, li){
            var concat = $.nodejs.buffer.Buffer.concat([
                seed,
                new $.nodejs.buffer.Buffer('leaf'),
                new $.nodejs.buffer.Buffer((li).toString()),
            ]);
            return algorithm(concat);  // TODO use more strong derivation
        };

        function Leafcalc(seed, phi){
            // Hash the public key on a leaf.
            var leafPrivateKey = getLeafPrivateKey(seed, phi);
            var wOTS = new winternitzOTS();
            var leafPublicKey = wOTS.publicKey(leafPrivateKey),
                hashResult = algorithm(
                    $.nodejs.buffer.Buffer.concat(leafPublicKey)
                );
            return [
                hashResult,
                0
            ];
        };

        function Treehash(seed){
            var self = this;

            this.stack = [];
            this.auths = [];

            function extract(freshNode){
                console.log('!', freshNode[0].toString('hex'), freshNode[1]);
//                console.log('AUTHS=', self.auths);
                if(!isNaN(self.auths[freshNode[1]])){
                    if(0 == self.auths[freshNode[1]]){
                        self.auths[freshNode[1]] = freshNode[0];
                        console.log('recorded');
                    } else {
                        self.auths[freshNode[1]] -= 1;
                    };
                };
            };

            this.feed = function(phi){
                var Leaf = Leafcalc(seed, phi), topNode;
                extract(Leaf);

                while(
                    this.stack.length > 0 &&
                    Leaf[1] == this.stack[this.stack.length - 1][1]
                ){
                    topNode = this.stack.pop();

                    Leaf[0] = joinHash(topNode[0], Leaf[0]);
                    Leaf[1] += 1;

                    extract(Leaf);
                };
                this.stack.push(Leaf);
            };

            this.setExtractor = function(x){
                self.auths = x;
            };

            this.getExtracted = function(){
                return self.auths;
            };

            return this;
        };

        this.root = function(seed){
            var treehash = new Treehash(seed);
            for(var i=0; i<capacity; i++){
                treehash.feed(i);
            };
            return treehash.stack[0][0];
        };

        this.sign = function(seed, li, message){
            var treehash = new Treehash(seed);
            // TODO check 0 < li < capacity

            console.log('li', li);
            // decide auth path positions
            var auths = [], selected=li;

            for(var i=0; i<layer; i++){
                if(selected % 2 == 1)
                    auths.push(selected - 1);
                else
                    auths.push(selected + 1);
                selected = Math.floor(selected / 2);
            };

            console.log(auths);

            // feed the tree to get root, and by the way get auth.
            treehash.setExtractor(auths);
            for(var i=0; i<capacity; i++){
                treehash.feed(i);
            };
            auths = treehash.getExtracted();

            console.log('done', auths);

            // sign message using key@li. XXX here we have not reuse the
            // public key, which must have been derived in above process.

            var wots = new winternitzOTS(),
                wotsPrivateKey = getLeafPrivateKey(seed, li);
            var wotsRet = wots.sign(wotsPrivateKey, message);


            return [wotsRet[0], wotsRet[1], auths];
        };

        this.verify = function(otsPubKey, otsSig, auths, message, compare){
            if(auths.length != layer) return false;

            // verify W-OTS signature
            var wots = new winternitzOTS();
            if(!wots.verify(otsPubKey, otsSig, message)) return false;

            // now verify auth path
            var hashResult = algorithm($.nodejs.buffer.Buffer.concat(
                otsPubKey
            ));

            console.log('verify auths with', auths);
            for(var i in auths){
                hashResult = joinHash(hashResult, auths[i]); 
            };

            if(undefined != compare)
                return compare.toString() == hashResult.toString();
            else
                return hashResult;
        };

        return this;
    };

    function getTreeSeed(privateKey, ti){
        // depending on the parameter we'll be able to grow different trees.
        // XXX replace ti with 2 factors. The layer and the number in the
        // layer.
        return algorithm($.nodejs.buffer.Buffer.concat([
            privateKey,
            new $.nodejs.buffer.Buffer('tree'),
            new $.nodejs.buffer.Buffer((ti).toString()),
        ]));  // TODO use more strong derivation
    };

    /* export only testing */
    this.sign = function(privateKey, message){
        var singleTree = new MSSTree(3);
        return singleTree.sign(getTreeSeed(privateKey, 0), 3, message);
    };

    this.verify = function(a,b,c,d,e){
        var singleTree = new MSSTree(3);
        return singleTree.verify(a,b,c,d,e);
    };
    this.root = function(a,b,c,d,e){
        var singleTree = new MSSTree(3);
        return singleTree.root(a,b,c,d,e);
    };
    /* ok */

    this.derivePublicKey = function(privateKey){
        var seed = getTreeSeed(privateKey, 0);
        var tree = new MSSTree(3);
        return tree.root(seed);
    };

};

module.exports = function($, _){
    return new function(){
        var self = this

        this.signing = function(algorithm){
            return new mss($, _);
        };

        this.encrypting = function(algorithm){
        };

        return this;
    };
};
