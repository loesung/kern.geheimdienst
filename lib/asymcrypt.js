function mss(){
};

module.exports = function($, _){
    return new function(){
        var self = this

        this.signing = function(algorithm){
            return new mss($, _);
        };

        this.encrypting = function(algorithm){
        };

        return this;
    };
};
