libraries
=========

**IMPORTANT** You have to create some links in order to make it work.

1. `baum.js`, this is the library tree. It is treated in a separated repo, may
   be _http://github.com/loesung/util.baum_ .

   Use `ln -s /PATH/TO/baum.js ./baum.js` to set up this link.

2. `python-ecdsa`, as required by `ecdsa.py`. Use following command to install
   this library. 
   
   `sudo pip install ecdsa`, when you are not root, or when you are,
   `pip install ecdsa`.
