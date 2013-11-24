/*
 * Used to pack and unpack different types of messages.
 */
function pack(obj){
};

function unpack(packed){
};

module.exports = function(baum){
    return new function(){
        this.ciphertext = {
            pack: function(cipherresult){
                return 'fool';
            },

            unpack: function(ciphertext){
            },
        };
    };
};
