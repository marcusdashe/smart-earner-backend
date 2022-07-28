const mongoose = require('mongoose')
require('dotenv').config();
const Config = mongoose.model("Config");
const Email = require('@mozeyinedu/email')

const PRODUCTION = Boolean(process.env.PRODUCTION);
const createdYear = new Date().getFullYear();
const copyrightYear = createdYear > 2022 ? `2022 - ${new Date().getFullYear()}` : '2022'

const email = new Email({
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    host: process.env.HOST
});

module.exports = async(data, res)=>{

    // get config data if exist otherwise set the env

    const config = await Config.find({});
    let configData;

    if( config && config.length >= 1){
        configData = {
            name: config[0].name,
            bio: config[0].bio,
            brandColorA:  config[0].brandColorA,
        }

    }else{
        configData = {
            name: process.env.COMPANY_NAME,
            bio: process.env.BIO,
            brandColorA: process.env.BRAND_COLOR_A,
        }
    } 

    const URL = `${process.env.FRONTEND_BASE_URL}/${process.env.FRONTEND_RESET_PASS_URL}/?token=${data.passwordReset.token}`

    if(PRODUCTION){
        // email text
        const text = `
            <div style="border: 2px solid #aaa; box-sizing: border-box; margin: 0; background: #fff; height: 70vh; padding: 10px">

                <div style="text-align:center; height: 70px; background: ${configData.brandColorA}">
                    <h2 style="font-weight: bold; font-size: 1.5rem; color: #fff; padding:3px 3px 0 3px; margin:0">
                        ${configData.name}
                    </h2>
                    <small style="color: #aaa; width: 100%; font-size: 0.8rem; font-style: italic; font-weight: 600;">
                        ${configData.bio}
                    </small>
                </div>

                <div style="height: calc(100% - 70px - 40px - 20px - 10px - 10px); width:100%">
                    <div style="font-size: 1rem; text-align: center; color:#000; padding: 50px 10px 20px 10px">
                        Please ignore if this was not sent by you!.
                    </div>
                    <div>
                        <a style="display:inline-block; background: ${configData.brandColorA}; text-align:center; padding: 15px; color: #fff; font-weight: 600" href="${URL}">Click to Reset your Password</a>
                    </div>
                    <div style="text-align: center; margin: 5px 0; padding:10px">${URL}</div>
                </div>

                <div style="text-align:center; height: 40px; padding: 10px; background: #000">
                    <div style="color: #fff; padding: 0; margin:0">
                        Copyright @ ${copyrightYear} ${configData.name}
                    <div>
                </div>

            </div>
        `
        const options = {
            from: process.env.EMAIL_USER,
            to: data.email,
            subject: 'Reset Your Password',
            html: text,
        }
        
        email.send(options, async(err, resp)=>{
            if(err){
                if(err.message.includes("ENOTFOUND") || err.message.includes("EREFUSED") || err.message.includes("EHOSTUNREACH")){
                    return res.status(408).json({status: false, msg: "No network connectivity"})
                }
                else if(err.message.includes("ETIMEDOUT")){
                    return res.status(408).json({status: false, msg: "Request Time-out! Check your network connections"})
                }
                else{
                    return res.status(500).json({status: false, msg: "Internal Server error, please contact customer support"})
                }
            }
            else{
                return res.status(200).json({status: true, msg: `Check your email (${data.email}) to reset your password`, token: data.passwordReset.token});
            }
        })                    

    }else{

        return res.status(200).json({status: true, msg: "On development mode! Please check below to reset your password", token: data.passwordReset.token});
    }
}