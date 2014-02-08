module.exports = function(storage){
    return function(){
        storage.flush();
    };
};
