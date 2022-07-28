const crypto = require('crypto')

const ran = {
    token: ()=>crypto.randomBytes(64).toString('base64url'),
    referralCode: ()=>crypto.randomBytes(5).toString('hex'),
    resetToken: ()=>crypto.randomBytes(64).toString('base64url'),
    acc: ()=>{
        const arr = [];
        const length = 8;
        for(let i=0; i<=length; i++){
            arr.push(Math.floor(Math.random() * length))
        }
        return `02${arr.join('')}`
    }
}

module.exports = ran