_ = (function($){
    var self = this;

    this.digest = require('./digest.js')($, this);
    this.symcrypt = require('./symcrypt.js')($, this);
    this.asymcrypt = require('./asymcrypt.js')($, this);
    this.package = require('./package.js')($, this);

    return this;
})($);
