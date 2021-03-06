/*
 * Wrapper to this JSBN library, providing interface to ECDH.
 */
var bi = require('./BigInteger.js'),
    BigInteger = bi.BigInteger,
    Barrett = bi.Barrett;

var ec = require('./ec.js')(BigInteger, Barrett),
    ECPointFp = ec.ECPointFp,
    ECCurveFp = ec.ECCurveFp,
    getSECCurveByName = require('./sec.js')(BigInteger, ECCurveFp);

module.exports = function($, _){
    return function(groupName){
        var self = this;

        var c = getSECCurveByName(groupName);
        var ecdhParam = {
            a: c.getCurve().getA().toBigInteger().toString(),
            b: c.getCurve().getB().toBigInteger().toString(),
            q: c.getCurve().getQ().toString(),
            gx: c.getG().getX().toBigInteger().toString(),
            gy: c.getG().getY().toBigInteger().toString(),
            n: c.getN().toString(),
        };

        var hexPrivateKey = '';

        function get_curve() {
            return new ECCurveFp(
                new BigInteger(ecdhParam.q),
                new BigInteger(ecdhParam.a),
                new BigInteger(ecdhParam.b)
            );
        };

        function get_G(curve) {
            return new ECPointFp(
                curve,
                curve.fromBigInteger(new BigInteger(ecdhParam.gx)),
                curve.fromBigInteger(new BigInteger(ecdhParam.gy))
            );
        }

        this.getPublicKey = function(){
            if(!hexPrivateKey) return null;
            
            var curve = get_curve();
            var G = get_G(curve);
            var a = new BigInteger(hexPrivateKey);
            var P = G.multiply(a);

            var hexPublicKeyX = P.getX().toBigInteger().toString(16),
                hexPublicKeyY = P.getY().toBigInteger().toString(16);

            return [hexPublicKeyX, hexPublicKeyY];
        };

        // TODO here we may allow use some user generated seed.
        //      and, do a setPrivateKey method.
        this.generateKeys = function(callback){
            var n = new BigInteger(ecdhParam.n);
            $.security.random.bytes(n.bitLength() / 8, function(err, bytes){
                if(err != null) return callback(err);
                hexPrivateKey = bytes.toString('hex');
                if(callback) callback(null, hexPrivateKey);
            });
        };

        this.setPrivateKey = function(h){
            hexPrivateKey = h;
        };

        this.computeSecret = function(anotherPublicKey){
            if(!hexPrivateKey) return null;
            
            var curve = get_curve();
            var P = new ECPointFp(
                curve,
                curve.fromBigInteger(new BigInteger(anotherPublicKey[0], 16)),
                curve.fromBigInteger(new BigInteger(anotherPublicKey[1], 16))
            );

            var a = new BigInteger(hexPrivateKey);
            var S = P.multiply(a);

            return [
                S.getX().toBigInteger().toString(16),
                S.getY().toBigInteger().toString(16),
            ];
        };

        return this;
    };
};
