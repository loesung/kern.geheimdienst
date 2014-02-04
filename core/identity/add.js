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

    try{
        var strIdentityContent = 
            _.package._pack('identityContent', identityContent);
    } catch(e){
        return callback(Error('invalid-content'));
    };

    var identityID = _.digest.whirlpool(strIdentityContent).slice(0, 32);

    var identity = {
        content: identityContent,
        id: identityID,
    };

    var strIdentityID = identityID.toString('hex');
    var strIdentity = _.package.armoredPack('identity', identity).toString();

    if(storage.table('identity')(strIdentityID))
        return callback(Error('identity-already-exists'));

    storage.table('identity')(strIdentityID, strIdentity);

    callback(null);
};
