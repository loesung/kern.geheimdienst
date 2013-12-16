# -*- coding: utf-8 -*-
"""
Python Implementation of Merkle Tree Signature
==============================================

This is an implementation of a new method of digitally sign a message. It is
however unable to perform encryption. For more details, please refer to:

[1] Ralph Merkle. A certified digital signature.
[2] Johannes Buchmann, Erik Dahmen, Elena Klintsevich. Merkle Signature with
    Virtually Unlimited Signature Capacity.
[3] Johannes Buchmann, Erik Dahmen, Andreas Huelsing. XMSS – A Practical
    Forward Secure Signature Scheme based on Minimal Security Assumptions.

This implementation is similar to [2]. 

By command line calling of this program, a signature capacity of 2^24 is
provided. This is subject to, however, a slow speed of generating public key
and doing signature.


NOTICE ON THE CACHE
-------------------
To speed up such operations, and to keep record of the usage of all keys in
order to avoid reusage of same OTS key, a cache is accepted and regenerated
at each time. It is around the size of a signature, some value less than
100KBytes, may be around 10KBytes. 

IF NO CACHE IS PROVIDED, THE PROGRAM WILL START AT BEGIN, WHICH IS EXTREMELY
DANGEROUS AND PROVIDE NO SECURITY.

In order to examine the integrity of cache, a HMAC of cache with private key
is shipped together with the regenerated cache. If a cache is found to be
corrupted, program will exit and do no more operations.


The capacity and speed provided by this implementation is not very suitable
for embedded systems, and not for servers who need to do tens or hundreds of 
signs within seconds. This implementation is meant to provide occasionally 
signing, with very low frequency(like only a few times a day). It is however 
worth mentioning, that the algorithm itself is far better than DSA and RSA. 

Those who are interested in this algorithm should consider implement it in C,
or use hardware acceleration, in which way the capacity can be largely
extended and relativly small sizes maintained by choosing large w(or w_bits).
"""
import math
import hashlib

w_bits = 10
w = 2 ** w_bits

hashAlgorithm = hashlib.sha224
m = 8 * len(hashAlgorithm('').digest())

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
        filler = '0' * (m / 8)
        retPub = [filler,] * l
        for i in xrange(0, l):
            iterateHash = self._iterateHashInit(privateKey, i)
            for j in xrange(0, w):
                iterateHash = hashAlgorithm(iterateHash).digest()
            retPub[i] = iterateHash
        return retPub

    def sign(self, privateKey, message):
        """
        generate Winternitz-OTS signature

        The public key and the signature are given out in the result.
        """ 
        signArray = self._winternitzHash(message)
        
        filler = '0' * (m / 8)
        retSig, retPub = [filler,] * l, [filler,] * l
#        benchmarkCount=0

        for i in xrange(0, l):
            signedValue = signArray[i]
            iterateHash = self._iterateHashInit(privateKey, i)
#            benchmarkCount += 1
            
            for j in xrange(0, w):
                if j == signedValue:
                    retSig[i] = iterateHash
                iterateHash = hashAlgorithm(iterateHash).digest()
                # ^^ hash after potential push, therefore
                # no fear of leaking private key.
#                benchmarkCount += 1
           
            retPub[i] = iterateHash

#        print '# hashed %d times' % benchmarkCount

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

    root = ''
    
    def __init__(self, seed, Leafcalc, joinHash):
        self.seed, self.Leafcalc, self.joinHash = seed, Leafcalc, joinHash
        self.stack = []
        self.auths = False 

    def _extract(self, freshNode):
        if self.auths == False:
            return

        if freshNode[1] >= len(self.auths):
            self.root = freshNode[0]
            return

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
#        print 'After feed final result: ', [i[1] for i in self.stack]

    def setExtractor(self, auths):
#       print 'setExtractor', auths
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
        
        if li >= self.capacity or li < 0:
            raise Exception('Unrealistic exception of this single tree.')

        # decide auth path positions
        auths = []
        selected = li

        for i in xrange(0, self.layer):
            if selected % 2 == 1:
                auths.append(selected - 1)
            else:
                auths.append(selected + 1)
            selected = selected / 2

        # feed the tree to get root, and by the way get auth.
        # print auths
        treehash.setExtractor(auths)
#       print 'Feed to get tree hash: ', self.capacity
        for i in xrange(0, self.capacity):
            treehash.feed(i)
        auths = treehash.getExtracted()
        root = treehash.root

        # sign message using key@li. XXX here we have not reuse the
        # public key, which must have been derived in above process.

        wots = winternitzOTS()
        wotsPrivateKey = self._leafPrivateKey(seed, li)
        wotsRet = wots.sign(wotsPrivateKey, message)

        # otsPubKey, otsSig, auths, root
        return (wotsRet[0], wotsRet[1], auths, root)

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
    cmdDesc = """
MSS: another digital signature algorithm
========================================

This program provides a command line tool as well as a library to use MSS
algorithm, a digital signature algorithm, and is believed to be secure even
under attack of quantum computers.

SYNOPSIS
    python mss.py <operand> <key> [message [signature|cache]]

    <operand> is one value in "sign", "verify" or "init", which means:
        
        sign    Sign a given message. Under this choice, 'message' is 
                required, <key> is the private key, and the last parameter is
                taken as a cache.

        verify  Verify a signature with given public key. Under this choice,
                'message' and 'signature' is required, and the <key> is taken
                as a public key.

        init    The <key> is regarded as a private key. The result will print
                out the public key derived basing on this private key.

NOTICE
    <key>, message and signature/cache are all given in HEX-encoded string 
    without spaces. If decoding such strings failed, the program will exit
    with printing this help info.

    The <key>, either a public key or a private key, is a string with %2d 
    bytes. The private key can be set to any random string.

RETURN VALUE
    0       If all job done without questions. If <operand> is 'verify', this
            means the verification is done and result is positive.
    1       When a signature is not verified, the return value is 1.
    31      Errors occured in doing respective processes.
    63      Given key is not of required length.
    127     If bad input received and help info is displayed.
    """ % (m / 8)
    cmdDesc = cmdDesc.strip()

    import time
    import hmac
    import sys
    import pickle as serialization 

    treePlan = [3, 4, 4, 4, 4, 5]

    treeNum = len(treePlan)
    trees = [MSS(i) for i in treePlan]

    def deriveSeed(privateKey, treeID):
        concat = privateKey + 'leaf' + hex(treeID)[2:].rjust(2, '0')
        return hashAlgorithm(concat).digest()

    class CACHE:
        counter = 0
        _cache = {}
        def __init__(self, privateKey, cacheStr=False):
            self._key = privateKey

            if cacheStr != False:
                try:
                    h = cacheStr[:m / 4]
                    j = cacheStr[len(h):]
                    jh = hmac.HMAC(self._key, j, hashAlgorithm).hexdigest()
                    if jh != h:
                        raise Exception()

                    deserialized = serialization.loads(j)
                    self.counter = deserialized['counter']
                    self._cache = deserialized['cache']

                    print 'Load cache, counter=%d' % self.counter
                except Exception,e:
                    print e
                    raise Exception('Invalid cache or private key.')

        def __str__(self):
            j = serialization.dumps({
                'counter': self.counter,
                'cache': self._cache,
            })
            h = hmac.HMAC(self._key, j, hashAlgorithm).hexdigest()
            return h + j

        def setTreeSig(self, treeID, leafID, signature):
            print 'Set to cache Tree#%d, leaf#%d, siglen=%d.' % (treeID, leafID, len(signature))
            self._cache[treeID] = {
                'leaf': leafID,
                'sig': signature
            }

        def getTreeSig(self, treeID, leafID):
            try:
                if self._cache.has_key(treeID):
                    cached = self._cache[treeID]
                    if cached['leaf'] == leafID:
                        return cached['sig']
                    else:
                        return False
            except:
                pass
            return False


    def sign(privateKey, message, cacheStr=False):
        signature = [] 
        c = CACHE(privateKey, cacheStr)
        c.counter += 1
       
        toSign = message
        counter = c.counter
        for i in xrange(0, treeNum):
            treeID = treeNum - 1 - i    # 5 > 4 > 3 > 2 > 1 > 0
            leafID = counter & (2 ** treePlan[treeID] - 1)
            
            if i > 0:
                cached = c.getTreeSig(treeID, leafID)
                if cached != False:
                    signature += cached
                    continue

            treeSeed = deriveSeed(privateKey, treeID)
            # otsPubKey, otsSig, auths, root
            result = trees[treeID].sign(treeSeed, leafID, toSign)

            print 'Tree #%d' % treeID,\
                result[3].encode('hex'),\
                'LEAF(%d)' % leafID,\
                'len(pub)=%d bytes' % (len(result[0][0]) * len(result[0])),\
                'len(sig)=%d bytes' % (len(result[1][0]) * len(result[1])),\
                'len(auths)=%d bytes' % (len(result[2][0]) * len(result[2]))

            toSign = result[3]
            counter = counter >> treePlan[treeID]

            treeSig = result[0] + result[1] + result[2]
            if i > 0:
                c.setTreeSig(treeID, leafID, treeSig)
            signature += treeSig 
#        print len(signature)
        
        return (''.join(signature), str(c))

    def verify(publicKey, signature, message):
        def arrayGen(src):
            byteLen = m / 8
            count = len(src) / byteLen
            ret = ['',] * count
            for i in xrange(0, count):
                ret[i] = src[i * byteLen:][:byteLen]
            return ret

        if len(signature) / m != (2 * l * treeNum + sum(treePlan)) / 8:
            return False

        toVerify = message
        for i in xrange(0, treeNum):
            treeID = treeNum - 1 - i
            cStrLen = (2 * l + treePlan[treeID]) * m / 8
            cStr = signature[:cStrLen]
            signature = signature[cStrLen:]
#           print len(cStr)

            authLen = treePlan[treeID] * m / 8
            auth = arrayGen(cStr[-authLen:])

            cStr = cStr[0:-authLen]
            pub = cStr[:len(cStr)/2]
            sig = cStr[len(pub):]
            pub = arrayGen(pub)
            sig = arrayGen(sig)

#           print len(auth), len(pub), len(sig)
            if 0 == treeID:
                return trees[treeID].verify(
                    pub, sig, auth, toVerify, publicKey)
            else:
                verification = trees[treeID].verify(pub, sig, auth, toVerify)
                if type(verification) == str:
                    toVerify = verification
                if not verification:
                    return False
                print verification.encode('hex')
        return False # just in case 

    def derivePublicKey(privateKey):
        root = trees[0].root(deriveSeed(privateKey, 0))
        return root 

    # Begin command line logic
    try:
        cmdOperand = sys.argv[1].strip().lower()
        cmdKey = sys.argv[2].decode('hex')
        if cmdOperand in ['sign', 'verify']:
            cmdMessage = sys.argv[3].decode('hex')
            if len(sys.argv) >= 5:
                cmdLast = sys.argv[4].decode('hex')
            else:
                cmdLast = False
        elif cmdOperand == 'init':
            pass
        else:
            raise Exception('Not recognized operand.')
    except Exception,e:
        print cmdDesc
#        print ' '.join(sys.argv)
        sys.exit(127)

    if len(cmdKey) != m / 8:
        print 'Key of incorrect length. Must be %d bytes.' % (m / 8)
        sys.exit(63)

    # do our job
    if cmdOperand == 'sign':
        try:
            signature, cache = sign(cmdKey, cmdMessage, cmdLast)
            print signature.encode('base64')
            print cache.encode('base64')
            sys.exit(0)
        except:
            sys.exit(31)

    if cmdOperand == 'init':
        try:
            root = derivePublicKey(cmdKey)
            print root.encode('hex')
            sys.exit(0)
        except Exception, e:
            print e
            sys.exit(31)

    if cmdOperand == 'verify':
        try:
            if verify(cmdKey, cmdLast, cmdMessage):
                print 'Good signature.'
                sys.exit(0)
            else:
                sys.exit(1)
        except Exception, e:
            print e
            sys.exit(31)

    """
    # test code
    root = derivePublicKey('')
    print 'Derived public key:', root.encode('hex')

    sigRet = sign('', 'abcd', False)
    cache = sigRet['cache'] 

    bt = time.time()
    for i in xrange(0,100):
        sigRet = sign('', 'abcd', cache)
        cache = sigRet['cache'] 
        signature = sigRet['result']
        continue
        verification = verify(root, signature, 'abcd')

        if verification:
            print 'Verification: OK, signature length: %d bytes.' % len(signature)
    et = time.time()

    print et-bt
    """
    sys.exit(127)
