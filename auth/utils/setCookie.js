require('dotenv').config()

const setCookie_ =(status, type, msg, res)=>{
    res.cookie("status", status, {httpOnly: false, secure: false});
    res.cookie("type", type, {httpOnly: false, secure: false});
    res.cookie("msg", msg, {httpOnly: false, secure: false});
}



function setCookie(accesstoken, refreshtoken, res, user){
    
    res.cookie("accesstoken", accesstoken, {
        httpOnly: false,
        maxAge: Number(process.env.COOKIE_ACCESSTOKEN_DURATION),
        secure: false
    });

    res.cookie("refreshtoken", refreshtoken, {
        httpOnly: false,
        maxAge: Number(process.env.COOKIE_REFRESHTOKEN_DURATION),
        secure: false
    });

    //check if user is blocked
    if(user.isBlocked){
        setCookie_(true, 'blocked', "You account is blocked, please contact customer suuport", res)
    }

    //check if user is unverified and not blocked
    if(!user.isVerified && !user.isBlocked){
        setCookie_(true, 'unverirified', "You account is not verified", res);
    }

    //check if user is verified and not blocked
    if(user.isVerified && !user.isAdmin && !user.isBlocked){
        setCookie_(true, 'verirified', "You account is not verified", res);
    }

    //check if user is an admin and not blocked
    if(user.isVerified && user.isAdmin && !user.isBlocked){
        setCookie_(true, 'admin', "You account is not verified", res)
    }
}

module.exports = setCookie