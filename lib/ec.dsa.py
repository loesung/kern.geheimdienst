# -*- coding: utf-8 -*-
"""
Python Interface of ECDSA
=======================
This a python interface to python-ecdsa module. Instead of seeking for a
full-featured ECDSA library on NodeJS, the author has decided to write this
wrapper.

The interface provides following features: 
    * obtaining a new pair of ECDSA keys,
    * signing a message with a private key,
    * verifying a signature with a public key.
"""
import hashlib

from ecdsa import SigningKey, VerifyingKey
from ecdsa import NIST192p, NIST224p, NIST256p, NIST384p, NIST521p

_policy_ = {
    'NIST192p': (NIST192p, hashlib.sha1),
    'NIST224p': (NIST224p, hashlib.sha224),
    'NIST256p': (NIST256p, hashlib.sha256),
    'NIST384p': (NIST384p, hashlib.sha384),
    'NIST521p': (NIST521p, hashlib.sha512),
}

def _getHashFunc(keylen):
    if keylen >= 512:
        return hashlib.sha512
    elif keylen >= 384:
        return hashlib.sha384
    elif keylen >= 256:
        return hashlib.sha256
    elif keylen >= 224:
        return hashlib.sha224
    elif keylen >= 160:
        return hashlib.sha1
    else:
        return hashlib.md5

def generate(curve):
    if curve not in _policy_.keys():
        return False
    sk = SigningKey.generate(curve=_policy_[curve][0])
    vk = sk.get_verifying_key()

    pubKey = vk.to_string()
    prvKey = sk.to_string()
    return (pubKey, prvKey)

# TODO above is done. modify following.

def sign(prvKey, message):
    sk = SigningKey.from_string(prvKey)
    hashed = _getHashFunc(len(sk.to_string()))(message).digest()
    signature = sk.sign(message)
    return signature

def verify(pubKey, message, signature):
    try:
        vk = VerifyingKey.from_string(pubKey)
        hashed = _getHashFunc(len(sk.to_string()))(message).digest()
        if verifier.verify(hashed, signature):
            return True
        else:
            return False
    except Exception,e:
        return False


if __name__ == '__main__':
    import json
    import sys
    
    cmdDesc = """
ECDSA: public key cryptography for digital signature and encryption
===================================================================

SYNOPSIS
    python ecdsa.py generate <curve name> 
    python ecdsa.py verify <key> <data> <signature>
    python ecdsa.py sign <key> <data>

NOTICE
    1. <curve name> should be one of following values:
        %s
       other values will be rejected.
    2. <key>, <data> and <signature> are all HEX-encoded strings.

RETURN VALUE
    0       if all job done without questions. If <operand> is 'verify', this
            means the verification is done and result is positive.
    1       inputed parameter seems wrong.
    3       the verification failed due to corrupted data or signature.
    127     bad input received and help info is displayed.

    """ % (' '.join([i for i in _policy_.keys()]), )
    cmdDesc = cmdDesc.strip()

    try:
        cmdOperand = sys.argv[1].strip().lower()
        if cmdOperand == 'generate':
            cmdBits = int(sys.argv[2])
        else:
            cmdKey = sys.argv[2].decode('hex')
            if cmdOperand == 'examine':
                pass
            else:
                cmdData = sys.argv[3].decode('hex')
                if cmdOperand == 'verify':
                    cmdSignature = sys.argv[4].decode('hex')
                elif cmdOperand in ['sign', 'encrypt', 'decrypt']:
                    pass
                else:
                    raise Exception()

    except Exception,e:
        print cmdDesc
        sys.exit(127)

    if cmdOperand == 'generate':
        genRet = generate(cmdBits)
        if genRet:
            pubKey, prvKey = genRet
            print pubKey.encode('base64')
            print '*'
            print prvKey.encode('base64')
        else:
            print 'Parameter of bits is not acceptable.'
            sys.exit(1)
        sys.exit(0)

    if cmdOperand == 'examine':
        examineRet = examine(cmdKey)
        if examineRet == False:
            print 'Cannot read this key.'
            sys.exit(1)
        print json.dumps(examineRet)
        sys.exit(0)

    if cmdOperand == 'verify':
        try:
            verifyRet = verify(cmdKey, cmdData, cmdSignature)
        except ValueError,e:
            print 'Invalid key.'
            sys.exit(1)
        if verifyRet == True:
            sys.exit(0)
        else:
            sys.exit(3)

    if cmdOperand == 'sign':
        try:
            signRet = sign(cmdKey, cmdData)
        except ValueError,e:
            print 'Invalid key.'
            sys.exit(1)
        print signRet.encode('base64')
        sys.exit(0)
