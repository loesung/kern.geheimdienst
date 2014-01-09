/*
 * Wrapper to this JSBN library, providing interface to ECDH.
 */
var ec = require('./ec.js');
var BigInteger = require('./BigInteger.js'),
    ECPointFp = ec.ECPointFp,
    ECCurveFp = ec.ECCurveFp,
    getSECCurveByName = require('./sec.js');

module.exports = function(){
    var self = this;

    var a, b, q;

    function get_curve() {
        return new ECCurveFp(
            new BigInteger(q),
            new BigInteger(a),
            new BigInteger(b)
        );
    };

    function get_G(curve) {
        return new ECPointFp(
            curve,
            curve.fromBigInteger(new BigInteger(document.ecdhtest.gx.value)),
            curve.fromBigInteger(new BigInteger(document.ecdhtest.gy.value))
        );
    }

function pick_rand() {
  var n = new BigInteger(document.ecdhtest.n.value);
  var n1 = n.subtract(BigInteger.ONE);
  var r = new BigInteger(n.bitLength(), rng);
  return r.mod(n1).add(BigInteger.ONE);
}

function do_alice_rand() {
  var r = pick_rand();
  document.ecdhtest.alice_priv.value = r.toString();
  document.ecdhtest.alice_pub_x.value = "";
  document.ecdhtest.alice_pub_y.value = "";
  document.ecdhtest.alice_key_x.value = "";
  document.ecdhtest.alice_key_y.value = "";
  document.ecdhtest.bob_key_x.value = "";
  document.ecdhtest.bob_key_y.value = "";
  do_status("Alice's random value generated");
}

function do_bob_rand() {
  var r = pick_rand();
  document.ecdhtest.bob_priv.value = r.toString();
  document.ecdhtest.bob_pub_x.value = "";
  document.ecdhtest.bob_pub_y.value = "";
  document.ecdhtest.alice_key_x.value = "";
  document.ecdhtest.alice_key_y.value = "";
  document.ecdhtest.bob_key_x.value = "";
  document.ecdhtest.bob_key_y.value = "";
  do_status("Bob's random value generated");
}

function do_alice_pub() {
  if(document.ecdhtest.alice_priv.value.length == 0) {
    alert("Please generate Alice's private value first");
    return;
  }
  var before = new Date();
  var curve = get_curve();
  var G = get_G(curve);
  var a = new BigInteger(document.ecdhtest.alice_priv.value);
  var P = G.multiply(a);
  var after = new Date();
  document.ecdhtest.alice_pub_x.value = P.getX().toBigInteger().toString();
  document.ecdhtest.alice_pub_y.value = P.getY().toBigInteger().toString();
  document.ecdhtest.bob_key_x.value = "";
  document.ecdhtest.bob_key_y.value = "";
  do_status("Alice's public point computed in " + (after - before) + "ms");
}

function do_bob_pub() {
  if(document.ecdhtest.bob_priv.value.length == 0) {
    alert("Please generate Bob's private value first");
    return;
  }
  var before = new Date();
  var curve = get_curve();
  var G = get_G(curve);
  var a = new BigInteger(document.ecdhtest.bob_priv.value);
  var P = G.multiply(a);
  var after = new Date();
  document.ecdhtest.bob_pub_x.value = P.getX().toBigInteger().toString();
  document.ecdhtest.bob_pub_y.value = P.getY().toBigInteger().toString();
  document.ecdhtest.alice_key_x.value = "";
  document.ecdhtest.alice_key_y.value = "";
  do_status("Bob's public point computed in " + (after - before) + "ms");
}

function do_alice_key() {
  if(document.ecdhtest.alice_priv.value.length == 0) {
    alert("Please generate Alice's private value first");
    return;
  }
  if(document.ecdhtest.bob_pub_x.value.length == 0) {
    alert("Please compute Bob's public value first");
    return;
  }
  var before = new Date();
  var curve = get_curve();
  var P = new ECPointFp(curve,
    curve.fromBigInteger(new BigInteger(document.ecdhtest.bob_pub_x.value)),
    curve.fromBigInteger(new BigInteger(document.ecdhtest.bob_pub_y.value)));
  var a = new BigInteger(document.ecdhtest.alice_priv.value);
  var S = P.multiply(a);
  var after = new Date();
  document.ecdhtest.alice_key_x.value = S.getX().toBigInteger().toString();
  document.ecdhtest.alice_key_y.value = S.getY().toBigInteger().toString();
  do_status("Alice's key derived in " + (after - before) + "ms");
}

    return this;
};
