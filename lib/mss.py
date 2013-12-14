# -*- coding: utf-8 -*-
"""
Python Implementation of Merkle Tree Signature

This is an implementation of a new method of digitally sign a message. It is
however unable to perform encryption. For more details, please refer to:

[1] Ralph Merkle. A certified digital signature.
[2] Johannes Buchmann, Erik Dahmen, Elena Klintsevich. Merkle Signature with
    Virtually Unlimited Signature Capacity.
[3] Johannes Buchmann, Erik Dahmen, Andreas Huelsing. XMSS – A Practical
    Forward Secure Signature Scheme based on Minimal Security Assumptions.

This implementation is similar to [2]. However no optimization is done for
caching the results at higher levels of trees.

The signature capacity is designed to be 2^40.
"""
import math
import hashlib

w_bits = 8 
w = 2 ** w_bits
m = 256
hashAlgorithm = hashlib.sha256

l_1 = int(math.ceil(m * 1.0 / w_bits))
l_2 = int(math.floor(math.log(l_1 * (w - 1)) / math.log(w)) + 1)
l = l_1 + l_2

class winternitzOTS:

    def _str2baseW(self, string, w_bits):
        assert(len(string) * 8 == m)

        binstr = ''.join([bin(ord(i))[2:].rjust(8, '0') for i in string])

        bits = len(binstr)

        result = [0,] * l_1

        for i in xrange(0, l_1):
            start = m - (i + 1) * w_bits
            end = start + w_bits
            if start < 0:
                start = 0
            result[l_1 - i - 1] = int(binstr[start:end], 2)

        assert(len(result) == l_1)
        return result
    
    def _winternitzHash(self, message):
        messageHash = hashAlgorithm(message).digest()
        b, C = [], 0

        # W-OTS signs messages of binary length m.
        assert(m == len(messageHash) * 8)

        # They are processed in base w representation.
        M = self._str2baseW(messageHash, w_bits)

        # The checksum ...
        for each in M:
            C += w - 1 - each 

        # in base w representation... 
        Cw = []
        C = bin(C)[2:] #''.join([bin(ord(i))[2:].rjust(8, '0') for i in C])
        while C != '':
            Cw.append(int(C[-w_bits:], 2))
            C = C[0:-w_bits]

        while len(Cw) < l_2:
            Cw.append(0)

        # is appended to M.
        b = M + Cw
        
        # It is of length l_2
        assert(len(Cw) == l_2)

        # The result is (b_1, ..., b_l)
        assert(len(b) == l)

        return b

    def _iterateHashInit(self, privateKey, i):
        return hashAlgorithm(privateKey + hex(i)[2:].rjust(8, '0')).digest()

    def publicKey(self, privateKey):
        retPub = []
        for i in xrange(0, l):
            iterateHash = self._iterateHashInit(privateKey, i)
            for j in xrange(0, w):
                iterateHash = hashAlgorithm(iterateHash).digest()
            retPub.append(iterateHash)
        return retPub

    def sign(self, privateKey, message):
        """
        generate Winternitz-OTS signature

        The public key and the signature are given out in the result.
        """ 
        signArray = self._winternitzHash(message)
        
        retSig, retPub = [], []
        benchmarkCount=0

        for i in xrange(0, l):
            signedValue = signArray[i]
            iterateHash = self._iterateHashInit(privateKey, i)
            benchmarkCount += 1
            
            for j in xrange(0, w):
                if j == signedValue:
                    retSig.append(iterateHash)
                iterateHash = hashAlgorithm(iterateHash).digest()
                # ^^ hash after potential push, therefore
                # no fear of leaking private key.
                benchmarkCount += 1
            
            retPub.append(iterateHash)

        print '# hashed %d times' % benchmarkCount

        return [retPub, retSig]

    def verify(self, publicKey, signature, message):
        signedArray = self._winternitzHash(message)
        for i in xrange(0, l):
            remainingTimes = w - signedArray[i] 
            if remainingTimes < 0:
                return False

            iterateHash = signature[i]

            for j in xrange(0, remainingTimes):
                iterateHash = hashAlgorithm(iterateHash).digest()

            if iterateHash != publicKey[i]:
                return False

        return True

##############################################################################

class Treehash:
    
    def __init__(self, seed, Leafcalc, joinHash):
        self.seed, self.Leafcalc, self.joinHash = seed, Leafcalc, joinHash
        self.stack = []
        self.auths = False 

    def _extract(self, freshNode):
        if self.auths == False:
            return;

        if freshNode[1] >= len(self.auths):
            return;

        if type(self.auths[freshNode[1]]) == str:
            return

        if 0 == self.auths[freshNode[1]]:
            self.auths[freshNode[1]] = freshNode[0]
        else:
            self.auths[freshNode[1]] -= 1

    def feed(self, phi):
        Leaf = self.Leafcalc(self.seed, phi)
        self._extract(Leaf)

        while (\
            len(self.stack) > 0) and\
            (Leaf[1] == self.stack[len(self.stack) - 1][1]) :

            topNode = self.stack.pop()

            Leaf = (self.joinHash(topNode[0], Leaf[0]), Leaf[1] + 1)

            self._extract(Leaf)
        
        self.stack.append(Leaf)

    def setExtractor(self, auths):
        self.auths = auths

    def getExtracted(self):
        return self.auths

##############################################################################

class MSS:

    layer = False
    capacity = 0

    def __init__(self, layer):
        self.capacity = 2 ** layer
        self.layer = layer

    def _joinHash(self, hash1, hash2):
        if hash1 > hash2:
            return hashAlgorithm(hash1 + hash2).digest()
        else:
            return hashAlgorithm(hash2 + hash1).digest()

    def _leafPrivateKey(self, seed, li):
        concat = seed + 'leaf' + hex(li)[2:].rjust(8, '0')
        return hashAlgorithm(concat).digest()

    def _leafCalc(self, seed, phi):
        # Hash the public key on a leaf.
        leafPrivateKey = self._leafPrivateKey(seed, phi)
        wOTS = winternitzOTS()
        leafPublicKey = ''.join(wOTS.publicKey(leafPrivateKey))
        hashResult = hashAlgorithm(leafPublicKey).digest()
        return (hashResult, 0)

    def root(self, seed):
        treehash = Treehash(seed, self._leafCalc, self._joinHash)
        for i in xrange(0, self.capacity):
            treehash.feed(i)
        return treehash.stack[0][0]

    def sign(self, seed, li, message):
        treehash = Treehash(seed, self._leafCalc, self._joinHash)
        # TODO check 0 < li < capacity

#            console.log('li', li)
        # decide auth path positions
        auths = []
        selected = li

        for i in xrange(0, self.layer):
            if selected % 2 == 1:
                auths.append(selected - 1)
            else:
                auths.append(selected + 1)
            selected = selected / 2

        print auths

        # feed the tree to get root, and by the way get auth.
        treehash.setExtractor(auths)
        for i in xrange(0, self.capacity):
            treehash.feed(i)
        auths = treehash.getExtracted()

        # sign message using key@li. XXX here we have not reuse the
        # public key, which must have been derived in above process.

        wots = winternitzOTS()
        wotsPrivateKey = self._leafPrivateKey(seed, li)
        wotsRet = wots.sign(wotsPrivateKey, message)

        # otsPubKey, otsSig, auths
        return (wotsRet[0], wotsRet[1], auths)

    def verify(self, otsPubKey, otsSig, auths, message, compare=False):
        if len(auths) != self.layer:
            return False

        # verify W-OTS signature
        wots = winternitzOTS()
        if not wots.verify(otsPubKey, otsSig, message):
            return False

        # now verify auth path
        hashResult = hashAlgorithm(''.join(otsPubKey)).digest()
        #console.log('Verify - Public Key hash: ', hashResult.toString('hex'))
        #console.log('verify auths with', auths)
        for each in auths:
            hashResult = self._joinHash(hashResult, each)

        if False != compare:
            return compare == hashResult
        else:
            return hashResult

##############################################################################

if __name__ == '__main__':
    mss = MSS(5)
    
    root = mss.root('')
    print 'Root is: ', root.encode('hex')

    signature = mss.sign('', 0, 'abcdefg')
#    print signature

    verifyResult = mss.verify(signature[0], signature[1], signature[2], 'abcdefg')
    print verifyResult.encode('hex')
