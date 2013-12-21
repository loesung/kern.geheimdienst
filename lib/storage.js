function storage($, _, path, passphrase){
    var data = {},
        synced = false,
        isKey = /^[0-9a-z_]+$/i;

    function tableItem(tableName){
        return function(key, value){
            if(undefined == value){
                // retrive
            } else {
                // remember to save
            };
        };
    };
    
    this.table = function(name){
        if(!isKey.test(name)) return false;
        return tableItem(name);
    };

    this.sync = function(){
        // all data write to file immediately
        synced = true;
    };

};

module.exports = function($, _){
    return function(path, passphrase){
        return new storage($, _, path, passphrase);
    };
};
