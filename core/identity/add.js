module.exports = function(storage, subject, callback){
    var identityContent = {
        subject: subject,
    };

    var strIdentityContent = 
        _.package._pack('identityContent', identityContent);

    var identityID = _.package._pack(
        'identityID',
        _.digest.whirlpool(strIdentityContent)
    );

    var identity = {
        content: identityContent,
        id: identityID,
    };

    callback(null, identity);
};
