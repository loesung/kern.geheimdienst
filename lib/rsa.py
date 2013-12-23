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
from Crypto.Hash import SHA

def generate(bits):
    if bits not in [2048, 3072, 4096, 8192]:
        return False
    key = RSA.generate(bits)
    pubKey = key.publickey().exportKey('DER')
    prvKey = key.exportKey('DER')
    return (pubKey, prvKey)

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
    if not (key.has_private() and key.can_sign()):
        return False
    h = SHA.new()
    h.update(message)
    signer = PKCS1_PSS.new(key)
    signature = signer.sign(h)
    return signature

def verify(pubKey, message, signature):
    key = RSA.importKey(pubKey)
    if key.has_private():
        return False
    h = SHA.new()
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

    pubKey, prvKey = generate(2048)

    signature = sign(prvKey, 'message')
    print verify(pubKey, 'message', signature)
