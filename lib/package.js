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
        var b64 = packedBuffer.toString('base64');
        var b64p = '';
        while(b64.length > 0){
            b64p += b64.substr(0, 64) + '\n';
            b64 = b64.substr(64);
        };
        title = title.toUpperCase().trim();

        return '-----BEGIN ' + title + '-----\n'
            + b64p
            + '-----END ' + title + '-----';
    };

    function uncapsule(capsule){
        var extractor = /\-{5}BEGIN[A-Z\s]+\-{5}([a-zA-Z0-9=\+\n\s\/]+)\-{5}END[A-Z\s]+\-{5}/;
        var b64p = extractor.exec(capsule)[1];
        if(undefined == b64p)
            return null;
        var b64 = b64p.replace(/[^a-z0-9=\+\/]+/gi, '');

        try{
            var packedBuffer = new $.nodejs.buffer.Buffer(b64, 'base64');
        } catch(e){
            return null;
        };
        return packedBuffer;
    };
    
    return new function(){
        var self = this;
        this.ciphertext = {
            pack: function(cipherresult){
                var capsulated = capsule(pack(cipherresult), 'ciphertext');
                return capsulated;
            },

            unpack: function(ciphertext){
                var buffer = uncapsule(ciphertext);
                if(null == buffer) return null;
                try{
                    return unpack(buffer);
                } catch(e){
                    return null;
                };
            },
        };
    };
};
