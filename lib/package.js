/*
 * Used to pack and unpack different types of messages.
 */
module.exports = function(baum){
    function pack(obj){
        return baum.nodejs.buffalo.serialize(obj);
    };

    function unpack(packed){
        return baum.nodejs.buffalo.parse(packed);
    };

    function capsule(packedBuffer, title){
    };

    function uncapsule(capsule){
    };
    
    return new function(){
        this.ciphertext = {
            pack: function(cipherresult){
                var packedBuf = pack(cipherresult);
                console.log(cipherresult);
                console.log( baum.nodejs.buffer.Buffer(unpack(packedBuf).result[2], 'ascii') );
                return packedBuf.toString('base64');
            },

            unpack: function(ciphertext){
            },
        };
    };
};
