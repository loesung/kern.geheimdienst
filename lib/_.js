_ = (function($){
    var self = this;

    this.object = require('./object.js')($, this);

    this.digest = require('./digest.js')($, this);
    this.symcrypt = require('./symcrypt.js')($, this);
    this.asymcrypt = require('./asymcrypt.js')($, this);
    this.package = require('./package.js')($, this);
    this.storage = require('./storage.js')($, this);

    return this;
})($);
