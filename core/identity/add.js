module.exports.fromObject = function(storage, object, callback){
    add(storage, object.subject, callback);
};

module.exports.fromPacked = function(storage, packed, callback){
    try{
        var unpacked = _.package.parse(packed), subject;
        if(unpacked[0] == 'identity')
            subject = unpacked[1]['content'].subject;
        else if(unpacked[0] == 'identityContent')
            subject = unpacked[1].subject;
        else
            throw Error('unrecognized-package');
    } catch(e){
        return callback(e);
    };
    add(storage, subject, callback);
};

function add(storage, subject, callback){
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
