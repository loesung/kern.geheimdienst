function mss($, _){
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

        var result = [];
        while(binstr != ''){
            var fetch = binstr.substr(0, w_bits);
            binstr = binstr.substr(w_bits);
            result.push(parseInt(fetch, 2));
        };
        return result;
    };
    
    function winternitzOTS(){
        var self = this;

        var w_bits = 8, algorithm = _.digest.sha256;

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
            if(256 != messageHash.length * 8) throw Error();

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

        this.sign = function(privateKey, message){
            /*
             * generate Winternitz-OTS signature
             *
             * The public key and the signature are given out in the result.
             * Because it is not required, that when using W-OTS together with
             * Merkle Tree, each public key at the leave should be given out
             * at the very beginning, we will not add the feature of deriving
             * a public key from a private key.
             */
            var messageHash = hashMessage(message);
            var signArray = winternitzCompress(messageHash);
            
            var signedValue, iterateHash, retSig=[], retPub=[];
            var benchmarkCount=0;
            for(var i in signArray){
                signedValue = signArray[i];
                iterateHash = algorithm(
                    $.nodejs.buffer.Buffer.concat([
                        privateKey,
                        new $.nodejs.buffer.Buffer((i).toString(), 'ascii'),
                    ])
                );
                benchmarkCount += 1;
                
                for(var j=0; j<w; j++){
                    if(j == signedValue) retSig.push(iterateHash);
                    iterateHash = algorithm(iterateHash);
                    benchmarkCount += 1;
                };
                retPub.push(iterateHash);
            };
            console.log(retSig, retPub, benchmarkCount);
        };

        this.verify = function(publicKey, signature, message){
            var messageHash = hashMessage(message);
            var signedArray = winternitzCompress(messageHash);
        };

        return this;
    };

    this.sign = function(privateKey, message){
        winternitzOTS().sign(privateKey, message);
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
