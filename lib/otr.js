/*
 * OTR model
 * =========
 *
 * This model provides an abstract layer of OTR protocol. The OTR instance as
 * an EventEmitter will emit 'receive' and 'send' events.
 *
 * You may initialize an instance by either create() it brandly new, or by
 * importKey() to import a new key.
 *
 * This is only an abstract layer for easing the use case of OTR session. You
 * should use other ways to combine the OTR session with key managements.
 *
 *
 * IMPORTANT
 *     The key used to intialize a OTR session is although theorically
 *     always the same, but we need to store status info, such as if we have 
 *     sent the FIRST-MESSAGE(a known plaintext, for those who we want to put
 *     in a situation of being able to tamper our data).
 *
 *     Therefore, you are expected to SAVE the key each time you have used it
 *     in an OTR-instance and decided to close this instance. The next time
 *     you should use the renewed key to initialize this instance.
 *
 *     There may be no serious security harm to violations of above, however
 *     significant increase of traffic may occur.
 *
 *     The key, that after create and being exported, can also be sent to our
 *     partner and be used to resume a session. There is no harm, because
 *     OTR is symmetric.
 */

function otr(){
    $.nodejs.events.EventEmitter.call(this);
    var self = this;

    this.create = function(callback){
        
    };

    this.importKey = function(){
    };

    function initialize(key){
        self.exportKey = function(){
        };

        self.receive = function(){
        };

        self.send = function(){
        };

        delete self.importKey;
        delete self.create;
    };

    return this;
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function(){
    $.nodejs.util.inherits(otr, $.nodejs.events.EventEmitter);
    return new otr();
};
