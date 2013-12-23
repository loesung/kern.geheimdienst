# -*- coding: utf-8 -*-
"""
Python Interface of RSA
=======================
This a python interface to python-crypto module. Instead of seeking for a
full-featured RSA library on NodeJS, the author has decided to write this
wrapper.

The interface provides following features: 
    * obtaining a new pair of RSA keys,
    * encrypting message with a public key,
    * decrypting message with a private key,
    * signing a message with a private key,
    * verifying a signature with a public key.
"""

from Crypto.Cipher import PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_PSS
from Crypto.Hash import SHA, SHA224, SHA256, SHA384, SHA512

_policy_ = {
    2048: SHA256,
    3072: SHA256,
    4096: SHA384,
    8192: SHA512,
}

def generate(bits):
    if bits not in _policy_.keys():
        return False
    key = RSA.generate(bits)
    pubKey = key.publickey().exportKey('DER')
    prvKey = key.exportKey('DER')
    return (pubKey, prvKey)

def examine(key):
    try:
        key = RSA.importKey(key)
        return {
            'size': key.size(),
            'private': key.has_private(),
            'encrypt': key.can_encrypt() and (not key.has_private()),
            'decrypt': key.can_encrypt() and key.has_private(),
            'sign': key.can_sign() and key.has_private(),
            'verify': key.can_sign() and (not key.has_private()),
        }
    except Exception,e:
        return False

def encrypt(pubKey, message):
    key = RSA.importKey(pubKey)
    if not (key.can_encrypt() and not key.has_private()):
        return False
    try:
        cipher = PKCS1_OAEP.new(key)
        ciphertext = cipher.encrypt(message)
    except Exception,e:
        return False
    return ciphertext

def decrypt(prvKey, ciphertext):
    key = RSA.importKey(prvKey)
    if not key.has_private():
        return False
    try:
        cipher = PKCS1_OAEP.new(key)
        message = cipher.decrypt(ciphertext)
    except Exception,e:
        return False
    return message

def sign(prvKey, message):
    key = RSA.importKey(prvKey)
    keySize = key.size() + 1
    if keySize not in _policy_.keys():
        return False
    else:
        hasher = _policy_[keySize]

    if not (key.has_private() and key.can_sign()):
        return False
    h = hasher.new()
    h.update(message)
    signer = PKCS1_PSS.new(key)
    signature = signer.sign(h)
    return signature

def verify(pubKey, message, signature):
    key = RSA.importKey(pubKey)
    keySize = key.size() + 1
    if keySize not in _policy_.keys():
        return False
    else:
        hasher = _policy_[keySize]

    if key.has_private():
        return False
    h = hasher.new()
    h.update(message)
    verifier = PKCS1_PSS.new(key)
    if verifier.verify(h, signature):
        return True
    else:
        return False


if __name__ == '__main__':
    import sys
    
    cmdDesc = """
RSA: public key cryptography for digital signature and encryption
=================================================================

SYNOPSIS
    python rsa.py generate <bits>
    python rsa.py examine <key>
    python rsa.py <sign|verify|encrypt|decrypt> <key> <data>
    """
    cmdDesc = cmdDesc.strip()

    try:
        cmdOperand = sys.argv[1]
    except Exception,e:
        pass

    pubKey, prvKey = generate(3072)

    signature = sign(prvKey, 'message')
    print verify(pubKey, 'message', signature)

    print examine(pubKey)
    print examine(prvKey)
