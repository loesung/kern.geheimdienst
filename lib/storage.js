function storage($, _, path, passphrase){
    var self = this;

    var data = {},
        isKey = /^[0-9a-z_\.\-]+$/i;

    passphrase = new $.nodejs.buffer.Buffer(passphrase);

    function tableItem(tableName){
        return function(key, value, options){
            if(key)
                if(!isKey.test(key)) return false;

            if(undefined == value){
                console.log(data);
                // retrive
                if(undefined == key){
                    // list all
                } else {
                    // show the key
                    if(undefined == data[tableName]) return false;
                    if(undefined == data[tableName][key]) return false;
                    return data[tableName][key];
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
            ].join('|') + '\n';

            $.nodejs.fs.appendFile(path, entry, function(err){
                callback(null, entry);
            });
        });

        // FINAL.
        $.nodejs.async.waterfall(workflow, function(err, result){
            if(rueckruf) rueckruf(err, result);
        });
    };

    function loadItem(itemStr, callback){
        try{
            var parts = itemStr.split('|');
            var randomBytes = new $.nodejs.buffer.Buffer(parts[0], 'base64'),
                hmac = new $.nodejs.buffer.Buffer(parts[1], 'base64'),
                table = parts[2],
                key = parts[3],
                ciphertext = new $.nodejs.buffer.Buffer(parts[4], 'base64')
            ;
        } catch(e) {
            return callback(true);
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
            if(null != err) return callback(true);
            if(undefined == data[table]) data[table] = {};
            data[table][key] = result;
            callback(null);
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
        var filePassphrase;
        if(undefined == newPassphrase)
            filePassphrase = passphrase;
        else
            filePassphrase = new $.nodejs.buffer.Buffer(newPassphrase);

        var task = [];

        for(var table in data){
            for(var key in data[table]){
                task.push((function(table, key){
                    return function(callback){
                        saveItem(table, key, data[table][key], callback);
                    };
                })(table, key));
            }
        };

        $.nodejs.async.parallel(task, function(err, result){
            $.nodejs.fs.writeFileSync(path, result.join(''));
        });

    };

    // init: load file
    this.load = function(callback){
        var workflow = [];
        workflow.push(function(callback){
            $.nodejs.fs.readFile(path, callback);
        });

        workflow.push(function(data, callback){
            try{
                var str = data.toString();
                var parts = str.split('\n');
                var workflow = [];
                for(var i in parts){
                    if(parts[i] == '') continue;
                    workflow.push((function(part){
                        return function(callback){
                            loadItem(part, function(err, result){
                                callback(null)
                            });
                        };
                    })(parts[i]));
                };
                $.nodejs.async.series(workflow, function(){
                    callback(null);
                });
            } catch(e){
                callback(true);
            };
        });

        $.nodejs.async.waterfall(workflow, function(err, result){
            callback(err, result);
        });
    };
};

module.exports = function($, _){
    return function(path, passphrase){
        return new storage($, _, path, passphrase);
    };
};
