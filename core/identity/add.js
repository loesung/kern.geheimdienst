module.exports = function(storage, subject, callback){
    if(!(
        /^[0-9a-zA-Z_\(\)\[\]\.]{5,64}$/.test(subject)
    ))
        return callback(Error('invalid-subject'));

    var identityContent = {
        subject: subject,
    };

    var strIdentityContent = 
        _.package._pack('identityContent', identityContent);

    var identityID = _.digest.whirlpool(strIdentityContent).slice(0, 32);

    var identity = {
        content: identityContent,
        id: identityID,
    };



    callback(null, _.package.parse(_.package.pack('identity', identity)));
};
