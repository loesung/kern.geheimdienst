function storage($, _, path){
    var self = this;

    var data = {},
        isKey = /^[0-9a-z_\.\-]+$/i,
        passphrase = null,
        mainKey = null;

    function tableItem(tableName){
        return function(key, value){
            if(key)
                if(!isKey.test(key)) return false;

            if(undefined === value){
                // retrive
                if(undefined == data[tableName]) return false;
                if(undefined == key){
                    // list all
                    var ret = {};
                    for(var i in data[tableName])
                        ret[i] = data[tableName][i];
                    return ret;
                } else {
                    // show the key
                    if(undefined == data[tableName][key]) return false;
                    return data[tableName][key];
                };
            } else {
                // remember to save
                // WHEN value == null, delete this item.
                if(null == value){
                    if(undefined != data[tableName]){
                        console.log('Delete item.');
                        if(undefined != data[tableName][key])
                            delete data[tableName][key];
                    }; 
                    deleteItem(tableName, key, null);
                } else {
                    if(undefined == data[tableName]) data[tableName] = {};
                    data[tableName][key] = value;
                    saveItem(tableName, key, value, null);
                };
            };
        };
    };

    function deleteItem(table, key, rueckruf){  
        var entry = [
            '',//randomBytes
            '',//hmac
            table,
            key,
            '!', 
        ].join('|') + '\n';

        $.nodejs.fs.appendFile(path, entry, function(err){
            if(rueckruf) rueckruf(null);
        });
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
            _.symcrypt.encrypt(mainKey, content, callback);
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
                key = parts[3];
            
            if('!' == parts[4]){
                if(undefined != data[table]){
                    if(undefined != data[table][key])
                        delete data[table][key];
                }; 
                return callback(null);
            } else
                var ciphertext =
                    new $.nodejs.buffer.Buffer(parts[4], 'base64')
                ;
        } catch(e) {
            console.log(e);
            return callback(true);
        };
        var workflow = [];

        workflow.push(function(callback){
            _.symcrypt.decrypt(
                mainKey,
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
    
    function initialize(){
        self.flush = function(newPassphrase){
            // remove duplicate item and flush all data write to file 
            // immediately.
            // optionally, a new passphrase can be given.
            // this will write a new file from begin.
            var filePassphrase;
            if(undefined == newPassphrase)
                filePassphrase = passphrase;
            else
                filePassphrase = new $.nodejs.buffer.Buffer(newPassphrase);

            var workflow = [];
            workflow.push(passphraseHashGenerator(filePassphrase));
            workflow.push(function(derivedPassphrase, callback){
                checkValue = 
                    getCheckValue(derivedPassphrase).toString('base64');
                mainKey = derivedPassphrase;

                var task = [];

                for(var table in data){
                    for(var key in data[table]){
                        task.push((function(table, key){
                            return function(callback){
                                saveItem(
                                    table,
                                    key,
                                    data[table][key],
                                    callback
                                );
                            };
                        })(table, key));
                    }
                };

                $.nodejs.async.parallel(task, function(err, result){
                    if(null != err) return callback(err);
                    var content = checkValue + '\n';
                    content += result.join('');
                    $.nodejs.fs.writeFileSync(path, content);
                    callback(null);
                });
            });

            $.nodejs.async.waterfall(workflow, function(err, result){
                if(null == err) passphrase = filePassphrase;
            });
        };
    };

    function passphraseHashGenerator(passphrase){
        return function(callback){
            // Use large iteration to protect key and derive a check value.
            $.nodejs.crypto.pbkdf2(
                passphrase,
                'Geheimdienst',
                100000,
                16,
                callback
            );
        };
    };

    function getCheckValue(derivedPassphrase){
        return new _.digest.sha1(derivedPassphrase);
    };

    // init: load file
    this.load = function(aPassphrase, allowCreate, callback){
        var workflow = [], checkValue;

        if($.types.isString(aPassphrase))
            passphrase = new $.nodejs.buffer.Buffer(aPassphrase);
        else
            passphrase = aPassphrase;

        // detect accessibility.
        //  1. if not exist, create and treat the passphrase as the one that
        //     is going to protect this file.
        //  2. if exist, check the passphrase. if not passed, call error.
        workflow.push(passphraseHashGenerator(passphrase));
        workflow.push(function(derivedPassphrase, callback){
            checkValue = getCheckValue(derivedPassphrase).toString('base64');
            mainKey = derivedPassphrase;

            $.nodejs.fs.exists(path, function(exists){
                if(exists) return callback(null);
                if(!allowCreate) return callback(404);

                var content = checkValue + '\n';
                $.nodejs.fs.writeFile(path, content, callback);
            });
        });

        // read file
        workflow.push(function(callback){
            $.nodejs.fs.readFile(path, callback);
        });

        workflow.push(function(data, callback){
            var str = data.toString();
            var parts = str.split('\n');
            var workflow = [];

            // check passphrase
            var fileHead = parts[0];
            parts = parts.slice(1);
            if(fileHead != checkValue){
                return callback(true);
            };

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

            data = {};
            $.nodejs.async.series(workflow, function(){
                callback(null);
            });
        });

        $.nodejs.async.waterfall(workflow, function(err, result){
            if(err == null){
                initialize();
            } else {
                passphrase = null;
            };
            callback(err, result);
        });
    };

    this.checkPassphrase = function(input){
        return input.toString('hex') == passphrase.toString('hex');
    };

    this.loaded = function(){
        return null != passphrase;
    };

    this.table = function(name){
        if(!isKey.test(name)) return false;
        return tableItem(name);
    };
};

module.exports = function($, _){
    return function(path, passphrase){
        return new storage($, _, path, passphrase);
    };
};
