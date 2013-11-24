_ = (function($){
    var self = this;

    this.symcrypt = require('./symcrypt.js')($);
    this.digest = require('./digest.js')($);

    return this;
})($);
