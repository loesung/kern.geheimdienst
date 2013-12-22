function storage($, _, path, passphrase){
    var data = {},
        isKey = /^[0-9a-z_\.\-]+$/i;

    var fileObj = $.nodejs.fs.openSync(path, 'a+');
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
        
        // encrypt entry content using random bytes
        workflow.push(function(callback){
            _.symcrypt.encrypt(passphrase, content, callback);
        });

        // append to file
        workflow.push(function(result, callback){
            var entry = [
                result[1].toString('base64'),//randomBytes
                result[2].toString('base64'),//hmac
                table,
                key,
                result[0].toString('base64'),//ciphertext
            ].join('|') + '*';

            loadItem(entry);

            $.nodejs.fs.appendFile(
                path,
                entry,
                callback
            );
        });

        // FINAL.
        $.nodejs.async.waterfall(workflow, function(err, result){
            if(rueckruf) rueckruf(err, result);
        });
    };

    function loadItem(itemStr){
        try{
            var parts = itemStr.split('|');
            var randomBytes = new $.nodejs.buffer.Buffer(parts[0], 'base64'),
                hmac = new $.nodejs.buffer.Buffer(parts[1], 'base64'),
                table = parts[2],
                key = parts[3],
                ciphertext = new $.nodejs.buffer.Buffer(parts[4], 'base64')
            ;
        } catch(e) {
            return;
        };
        var workflow = [];

        workflow.push(function(callback){
            _.symcrypt.decrypt(
                passphrase,
                [ciphertext, randomBytes, hmac],
                callback
            );
        });

        workflow.push(function(result, callback){
            try{
                var obj = JSON.parse(result.toString());
                callback(null, obj);
            } catch(e){
                callback(true);
            };
        });

        $.nodejs.async.waterfall(workflow, function(err, result){
            if(null != err) return;
            console.log(table, key, result);
        });
    };
    
    this.table = function(name){
        if(!isKey.test(name)) return false;
        return tableItem(name);
    };

    this.flush = function(newPassphrase){
        // remove duplicate item and flush all data write to file immediately.
        // optionally, a new passphrase can be given.
        // this will write a new file from begin.
    };
};

module.exports = function($, _){
    return function(path, passphrase){
        return new storage($, _, path, passphrase);
    };
};
