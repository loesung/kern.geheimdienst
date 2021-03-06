/*
 * Used to pack and unpack different types of messages.
 */
module.exports = function(baum){
    var templates = require('./package.templates.js')(baum);

    function pack(templateName, obj){
        if(!templates[templateName]) throw Error('No such template.');
        return templates[templateName].encode(obj, 'der');
    };

    function unpack(templateName, packed){
        if(!templates[templateName]) throw Error('No such template.');
        return templates[templateName].decode(packed, 'der');
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
        try{
            var b64p = extractor.exec(capsule)[1];
            var b64 = b64p.replace(/[^a-z0-9=\+\/]+/gi, '');
            var packedBuffer = new $.nodejs.buffer.Buffer(b64, 'base64');
        } catch(e){
            return null;
        };
        return packedBuffer;
    };
    
    return new function(){
        var self = this;

        this._pack = function(template, data){
            return pack(template, data);
        };

        this.pack = function(template, data){
            var data = self._pack(template, data);
            return pack('envelope', {dataType: template, data: data});
        };

        this.armoredPack = function(template, data){
            var packed = self.pack(template, data);
            var title = {
                'ciphertext': 'CIPHERTEXT',
                'codebook': 'CODEBOOK',
            }[template] || 'ASCII PACKED';

            return capsule(packed, title);
        };

        this.parse = function(data){
            if(baum.types.isBuffer(data))
                var unpacked = data;
            else {
                var unpacked = uncapsule(data);
                if(!unpacked) unpacked = data;
            };
            
            try{
                var parsed = unpack('envelope', unpacked);
                var payload = unpack(parsed.dataType, parsed.data);
            } catch(e){
                //console.log(e);
                return null;
            };
            return [parsed.dataType, payload];
        };

        return this;
    };
};
