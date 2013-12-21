function storage($, _, path, passphrase){
    var data = {},
        isKey = /^[0-9a-z_\.\-]+$/i;

    var fileObj = $.nodejs.fs.openSync(path, 'w+');
    passphrase = new $.nodejs.buffer.Buffer(passphrase);

    function tableItem(tableName){
        return function(key, value, options){
            if(key)
                if(!isKey.test(key)) return false;

            if(undefined == value){
                // retrive
                if(undefined == key){
                    // list all
                } else {
                    // show the key
                };
            } else {
                // options when given, possible also delete
                // remember to save
                if(undefined == data[tableName]) data[tableName] = {};
                data[tableName][key] = value;
                saveItem(tableName, key, value, null);
            };
        };
    };

    function saveItem(table, key, value, rueckruf){
        var workflow = [];

        try{
            var content = new $.nodejs.buffer.Buffer(JSON.stringify(value));
        } catch(e){
            String('Unable to serialize this value. Saving process aborted!')
                .WARNING();
            return;
        };
        
        // get 32 random bytes 
        workflow.push(function(callback){
            $.security.random.bytes(32, function(err, result){
                if(null != err){
                    String('Unable to encrypt new item. New item aborted!')
                        .WARNING();
                    return callback(err, null);
                };
                callback(null, result);
            });
        });

        // derive entry encrypting key, basing on 32 random bytes and
        // passphrase. When the passphrase changes in the future, those items
        // encrypted and wrote to the disk will be no more accessible. Only
        // by using the 'compact' function will things get renewed.
        workflow.push(function(bytes, callback){
            $.nodejs.crypto.pbkdf2(bytes, passphrase, 2, 128,
                function(err, bytes){
                    if(null != err){
                        String('Unable to derive entry encrypting key.')
                            .WARNING();
                        return callback(err, null);
                    };
                    callback(null, bytes);
                }
            );
        });

        // encrypt entry content using random bytes
        workflow.push(function(bytes, callback){
            _.symcrypt.encrypt(bytes, content, callback);
        });


        // FINAL.
        $.nodejs.async.waterfall(workflow, function(err, result){
            var entry = table + '|' + key + '|' + content;

            if(rueckruf){
            };
        });
    };
    
    this.table = function(name){
        if(!isKey.test(name)) return false;
        return tableItem(name);
    };

    this.compact = function(){
        // all data write to file immediately. 
    };
};

module.exports = function($, _){
    return function(path, passphrase){
        return new storage($, _, path, passphrase);
    };
};
