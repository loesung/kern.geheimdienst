var _encryptor = require('./_encryptor.js');

function encrypt(storage, core){
    var self = this;

    var encryptor = _encryptor(storage, core);

    this.withPassphrases = 
        require('./withPassphrases.js')(storage, core, encryptor);
    this.withCodebooks = 
        require('./withCodebooks.js')(storage, core, encryptor);

    return this;
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function(s, c){
    return new encrypt(s, c);
};
