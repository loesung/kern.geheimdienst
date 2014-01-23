function database(){
    var self = this;
    var data = {};

    this.set = function(table, key, value){
        var ret = [table, key, null];
        if(undefined == value){
            if(undefined == data[table]) return ret;
            if(undefined == data[table][key]) return ret;
            delete data[table][key];
        } else {
            if(undefined == data[table]) data[table] = {};
            data[table][key] = value;
            ret[2] = value;
        };
        return ret;
    };

    this.load = function(stuff){
        self.set(stuff[0], stuff[1], stuff[2]);
    };

    this.get = function(table, key){
        if(undefined == data[table]) return null;
        if(undefined == key){
            var ret = {};
            for(var i in data[table])
                ret[i] = data[table][i];
            return ret;
        };
        if(undefined == data[table][key]) return null;
        return data[table][key];
    };

    this.all = function(){
        var ret = [];
        for(var table in data){
            for(var key in data[table]){
                ret.push([table, key, data[table][key]]);
            };
        };
        return ret;
    };

    return this;
};

function storage($, _, path){
    var self = this;

    var data = new database(),
        isKey = /^[0-9a-z_\.\-]+$/i,
        passphrase = null,
        mainKey = null;

    function tableItem(table){
        return function(key, value){
            if(key)
                if(!isKey.test(key)) return false;

            if(undefined === value){
                // retrive
                return data.get(table, key);
            } else {
                var memory = data.set(table, key, value);
                save(memory);
            };
        };
    };

    function fileAccessError(callback){
        passphrase = null;
        if(callback) callback(true);
    };

    function save(memory, rueckruf){
        var workflow = [];

        try{
            var content = new $.nodejs.buffer.Buffer(JSON.stringify(memory));
        } catch(e){
            String('Unable to serialize this value. Saving process aborted!')
                .WARNING();
            return;
        };
        
        // encrypt entry content using random bytes
        workflow.push(function(callback){
            _.symcrypt.encryptEncoded(mainKey, content, callback);
        });

        // append to file
        workflow.push(function(result, callback){
            var entry = result.toString('base64') + '\n';
            /*
            var entry = [
                result[1].toString('base64'),//randomBytes
                result[2].toString('base64'),//hmac
                result[0].toString('base64'),//ciphertext
            ].join('|') + '\n';
            */

            $.nodejs.fs.appendFile(path, entry, function(err){
                callback(null, entry);
            });
        });

        // FINAL.
        $.nodejs.async.waterfall(workflow, function(err, result){
            if(null != err) return fileAccessError(rueckruf);
            if(rueckruf) rueckruf(err, result);
        });
    };

    function loadItem(itemStr, callback){
        /*
        try{
            var parts = itemStr.split('|');
            var randomBytes = new $.nodejs.buffer.Buffer(parts[0], 'base64'),
                hmac = new $.nodejs.buffer.Buffer(parts[1], 'base64'),
                ciphertext =
                    new $.nodejs.buffer.Buffer(parts[2], 'base64')
            ;
        } catch(e) {
            console.log(e);
            return callback(true);
        };
        var workflow = [];

        workflow.push((function(randomBytes, hmac, ciphertext){
            return function(callback){
                _.symcrypt.decrypt(
                    mainKey,
                    [ciphertext, randomBytes, hmac],
                    callback
                );
            };
        })(randomBytes, hmac, ciphertext));
        */
        var workflow = [];
        var buffer = new $.nodejs.buffer.Buffer(itemStr, 'base64');

        workflow.push((function(item){
            return function(callback){
                _.symcrypt.decryptEncoded(
                    mainKey,
                    buffer,
                    callback
                );
            };
        })(itemStr));

        workflow.push(function(result, callback){
            try{
                var obj = JSON.parse(result.toString());
                callback(null, obj);
            } catch(e){
                console.log(result, e);
                callback(true);
            };
        });

        $.nodejs.async.waterfall(workflow, function(err, result){
            if(null != err) return callback(true);
            data.load(result);
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
                checkValue = getCheckValue(derivedPassphrase);
                mainKey = derivedPassphrase;

                var task = [], dataItems = data.all();

                for(var i in dataItems){
                    task.push((function(dataItem){
                        return function(callback){
                            save(
                                dataItem,
                                callback
                            );
                        };
                    })(dataItems[i]));
                };

                $.nodejs.async.series(task, function(err, result){
                    if(null != err) return callback(err);
                    var content = checkValue + '\n';
                    content += result.join('');
                    $.nodejs.fs.writeFileSync(path, content);
                    callback(null);
                });
            });

            $.nodejs.async.waterfall(workflow, function(err, result){
                if(null != err) return fileAccessError(rueckruf);
                if(null == err) passphrase = filePassphrase;
            });
        };
    };

    function passphraseHashGenerator(aPassphrase){
        return function(callback){
            // Use large iteration to protect key and derive a check value.
            $.nodejs.crypto.pbkdf2(
                aPassphrase,
                'Geheimdienst',
                100000,
                128,
                callback
            );
        };
    };

    function getCheckValue(derivedPassphrase){
        return new _.digest.sha1(derivedPassphrase).toString('base64');
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
            checkValue = getCheckValue(derivedPassphrase);
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
                String(workflow.length + ' commands of loading executed.')
                    .NOTICE();
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
    return function(path){
        return new storage($, _, path);
    };
};
