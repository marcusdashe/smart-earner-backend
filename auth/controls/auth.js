const mongoose = require('mongoose')
const path = require("path")
// const fs = require("fs")
const appRoot = require("app-root-path")
const User = mongoose.model("User");
const Config = mongoose.model("Config");
const ProfileImg = mongoose.model("ProfileImg")
const PasswordReset = mongoose.model('PasswordReset');
require("dotenv").config();

const bcrypt = require("bcrypt");
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const jwt = require("jsonwebtoken");

const verificationLink = require('../utils/verificationLink');
const passResetLink = require('../utils/passResetLink');
const ran = require('../utils/randomString')
const { generateAccesstoken, generateRefreshtoken } = require('../utils/generateTokens')
const setCookie = require('../utils/setCookie');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

module.exports = {
 
    authorize: async(req, res)=>{
        try{
            //refresh token passed in req.body from client is used to refresh access token which will then be saved in client token
            const authToken = req.headers["authorization"];   
            
            const setCookie =(status, type, msg)=>{
                res.cookie("status", status, {httpOnly: false, secure: false});
                res.cookie("type", type, {httpOnly: false, secure: false});
            }
                       
            if(!authToken){
                setCookie(false, 'none')
                return res.status(200).json({status: false, type: 'none', msg: "You are not authorized, please login or register"})
            }

            // Verify token
            const token =authToken.split(" ")[1]
            
            if(!token){
                setCookie(false, 'none')
                return res.status(200).json({status: true, type: 'none', msg: "You not authorized! Please login or register"});
            }

            //validate token
            const data = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
                
            if(!data){
                setCookie(false, 'none');
                return res.status(200).json({status: true, type: 'none', msg: "Invalid token! Please login or register"});
            }
           
            // find the user
            const user = await User.findOne({_id: data.id});

            if(!user){
                setCookie(false, 'none')
                return res.status(200).json({status: true,  type: 'none', msg:  "You not authorized! Please login or register"})
            }

            //check if user is blocked
            if(user.isBlocked){
                setCookie(true, 'blocked')
                return res.status(200).json({status: true, type: 'blocked', msg: "You account is blocked, please contact customer suuport"})
            }

            //check if user is unverified and not blocked
            if(!user.isVerified && !user.isBlocked){
                setCookie(true, 'unverirified')
                return res.status(200).json({status: true, type: 'unverirified', msg: "You account is not verified"})
            }

            //check if user is verified and not blocked
            if(user.isVerified && !user.isAdmin && !user.isBlocked){
                setCookie(true, 'verirified')
                return res.status(200).json({status: true, type: 'verirified', msg: "Access granted"})
            }

            //check if user is an admin and not blocked
            if(user.isVerified && user.isAdmin && !user.isBlocked){
                setCookie(true, 'admin')
                return res.status(200).json({status: true, type: 'admin', msg: ""})
            }
            //otherwise
            else{
                setCookie(false, 'none')
                return res.status(200).json({status: true, type: 'none', msg: "User not authenticated! Please login or register"})
            }
        }

        catch(err){
            if(err.message == 'invalid signature' || err.message == 'invalid token' || err.message === 'jwt malformed' || err.message === "jwt expired"){
                return res.status(402).json({status: false, type: 'none', msg: "You are not authorized! Please login or register"})
            }
            setCookie(false, 'none');

            return res.status(500).json({status: false, msg: "Server error, please contact customer support"});
        }
    },

    getUsers: async (req, res)=> {
        try{
           const users = await User.find({}).populate({path: 'referrerId', select: ['_id', 'email', 'username']}).populate({path: 'referree', select: ['_id', 'email', 'username', 'hasInvested']}).sort({createdAt: -1}).select("-password")

           return res.status(200).json({ status: true, msg: "successfull", data: users})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getUser: async (req, res)=> {
        try{
         const {id } = req.params;
 
         //find user by id, or email or username
         const paramUser = await User.findOne({$or: [{_id: id}, {id}, {username: id}]}).populate({path: 'referrerId', select: ['_id', 'email', 'username']}).populate({path: 'referree', select: ['_id', 'email', 'username', 'hasInvested']}).select("-password");
 
         if(!paramUser) res.status(404).json({status: false, msg: `User not found!`});
 
         // send the user      
         return res.status(200).json({status: true, msg: 'successfull', data: paramUser});
        }
 
        catch(err){
             res.status(500).send({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getProfile: async (req, res)=> {
        try{
            const userId = req.user;

            //find user by id, or email or username
            const paramUser = await User.findOne({_id: userId}).populate({path: 'referrerId', select: ['_id', 'email', 'username']}).populate({path: 'referree', select: ['_id', 'email', 'username', 'hasInvested']}).select("-password");

            if(!paramUser) res.status(404).json({status: false, msg: `User not found!`});

            // send the user      
            return res.status(200).json({status: true, msg: 'successfull', data: paramUser});
        }

        catch(err){
                res.status(500).send({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    signup: async(req, res)=>{
        try{

            // sanitize all elements from the client, incase of fodgery
            const refcode = DOMPurify.sanitize(req.query.refcode);
            const data = {
                password:  DOMPurify.sanitize(req.body.password),
                cpassword: DOMPurify.sanitize(req.body.cpassword),
                username: DOMPurify.sanitize(req.body.username),
                email: DOMPurify.sanitize(req.body.email),
            }

            const { email, username, password, cpassword } = data;
            
            if(!email || !password || !username){
                return res.status(400).json({status: false, msg: "All fields are required!"});

            }
            else if(password !== cpassword){
                return res.status(405).json({status: false, msg: "Passwords do not match!"});
                
            }
            //check for already existing email and username
            const oldUser = await User.findOne({email});
            const oldUsername = await User.findOne({username});
            
            if(oldUser){
                return res.status(409).json({status: false, msg: "Email already exist!"});
            }

            if(oldUsername){
                return res.status(409).json({status: false, msg: "Username already taken!"});
            }

            //hash the password
            const hashedPass = await bcrypt.hash(password, 10);
            
            // get currency and verifyEmail from config data if exist otherwise set to the one in env
            // get all config
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;


            const resolveEnvVerifyEmail =()=>{
                return process.env.VERIFY_EMAIL === 'yes' ? 'yes' : 'no'
            };

            const verifyEmail = config && config.length >= 1 ? config[0].verifyEmail : resolveEnvVerifyEmail()
            
            //save data to database
            const user = new User({
                email,
                username,
                token: verifyEmail==='yes' ? ran.token() : "",
                isVerified: verifyEmail==='yes' ? false : true,
                accountNumber: ran.acc(),
                referralCode: ran.referralCode(),
                password: hashedPass,
                currency,
                hasInvested: false,
            })
        
            //send account activation link to the user
            if(verifyEmail==='yes'){
                verificationLink(user, res, refcode);
            }
            else{
                const accesstoken = generateAccesstoken(user._id);
                const refreshtoken = generateRefreshtoken(user._id);

                setCookie(accesstoken, refreshtoken, res, user);
                const newUser = await user.save();

                // referral
                if(refcode){
                    const referringUser = await User.findOne({referralCode: refcode})
                    if(referringUser){

                        // add user as referree to the referring user
                        await User.findByIdAndUpdate({_id: referringUser._id}, {$push: {
                            referree: newUser._id,
                        }})

                        // add the referring user as referrer to this current user
                        await User.findByIdAndUpdate({_id: newUser.id}, {$set: {
                            referrerId: referringUser.id
                        }})
                    }
                }
                
                return res.status(200).json({status: true, msg: "Registration successful"})
            }
        }
        catch(err){
            return res.status(500).json({status: false, msg: err.message});
        }
    },

    resendVerificationLink: async(req, res)=>{
        try{
            const userId = req.user;
           
            if(!userId){
                return res.status(402).json({status: false, msg: "User not found"})
            }

            // fetch user
            const user = await User.findOne({_id: userId})

            if(user.isBlocked){
                return res.status(402).json({status: false, msg: "This account is blocked, please contact customer service"})
            }

            if(user.isVerified){
                return res.status(402).json({status: false, msg: "Your account has already been verified"})
            }
            
            // send verification link
            verificationLink(user, res)
        }
        catch(err){
            return res.status(505).json({status: false, msg: "Internal Server error, please contact customer service"});
        }
    },

    verifyAccount: async(req, res)=>{
        try{
            const {token} = req.query

            if(!token){
                return res.status(400).json({status: false, msg: "Token is missing!"})
            }else{
                //search token in the database
                const user = await User.findOne({token})
                if(!user){
                    return res.status(400).json({status: false, msg: "Invalid token"})
                            
                }
                if(user.isBlocked){
                    return res.status(402).json({status: false, msg: "This account is blocked and cannot be verified, please contact customer support"})
                }
                
                if(user.isVerified){
                    return res.status(200).json({status: true, msg: "Your account has already been verified", isVerified: user.isVerified})
                }

                user.isVerified = true;
                user.token = "";
                setTimeout(async()=> await user.save(), 1000);

                return res.status(200).json({status: true, msg: "Your account is verified", isVerified: user.isVerified})
            }
        }
        catch(err){
            res.status(500).json({ status: false, message: "Internal Server error, please contact customer support"})
        }
    },
    
    signin: async(req, res)=>{
        try{
            const {email, password} = req.body;

            if(!email || !password){
                return res.status(400).json({status: false, msg: "All fields are required!"});

            }
            else{
                // find user with username or email
                const user = await User.findOne({$or: [{email}, {username: email}]});

                if(!user){
                    return res.status(400).json({status: false, msg: "User not found"});
                }

                // match provided password with the one in database
                const match = await bcrypt.compare(password.toString(), user.password)
            
                if(!match){
                    return res.status(400).json({status: false, msg: "Invalid login credentials"});
                }

                // log the user in
                const accesstoken = generateAccesstoken(user._id);
                const refreshtoken = generateRefreshtoken(user._id);

                setCookie(accesstoken, refreshtoken, res, user);

                return res.status(200).json({status: true, msg: "You are logged in"})
            }
        }
        catch(err){
            return res.status(500).json({status: false, msg: err.message});
        }
    },

    generateAccesstoken: async(req, res)=>{
        try{
            //refresh token passed in req.body from client is used to refresh access token which will then be saved in client token
            const authToken = req.headers["authorization"];    
           
          
            if(!authToken){
                return res.status(400).json({status: false, message: "You are not authorize, please login or register"})
            }

            // Verify token
            const token =authToken.split(" ")[1]
            
            if(!token){
                return res.status(400).json({status: false, msg: "User not authenticated! Please login or register"});
            }

            //validate token
            const data = await jwt.verify(token, process.env.JWT_REFRESH_SECRET);
                
            if(!data){
                return res.status(400).json({status: false, msg: "Invalid token! Please login or register"});
            }
           
            // find the user
            const user = await User.findOne({_id: data.id});

            if(!user){
                return res.status(404).json({status: false, msg: "User not found"})
            }

            // generate new accesstoken and refreshtoken and send to the client cookie
            const accesstoken = generateAccesstoken(user._id);
            const refreshtoken = generateRefreshtoken(user._id);

            setCookie(accesstoken, refreshtoken, res, user);

            return res.status(200).json({status: true, msg: "Access token refreshed"})
        }
        catch(err){
            if(err.message == 'invalid signature' || err.message == 'invalid token' || err.message === 'jwt malformed' || err.message === "jwt expired"){
                return res.status(402).json({status: false, msg: "You are not authorized! Please login or register"})
            }
            return res.status(500).json({status: false, msg: err.message});
        }
    },

    resetPassRequest: async(req, res)=>{
        try{
            const {email} = req.body;

            if(!email){
                return res.status(400).json({status: false, msg: "The field is required!"});
            }

            // get the user
            const user = await User.findOne({$or: [{email}, {username: email}]});

            if(!user){
                return res.status(400).json({status: false, msg: "User not found! Please register"});
            }

            // get verifyEmail from config data if exist otherwise set to the one in env

            // get all config
            const config = await Config.find({});

            const resolveEnvVerifyEmail =()=>{
                return process.env.VERIFY_EMAIL === 'yes' ? 'yes' : 'no'
            };
            
            const verifyEmail = config && config.length >= 1 && config[0].verifyEmail ? config[0].verifyEmail : resolveEnvVerifyEmail()


            // check if verifyEmail is et to yes, send link to email, otherwise bypass email verification

            if(verifyEmail === 'yes'){
                // check passwordReset collection if user already exist, then update the token
                const oldUser = await PasswordReset.findOne({userId: user._id})
                    
                if(oldUser){
                    const passwordReset = await PasswordReset.findOneAndUpdate({userId: user._id}, {$set: {token: ran.resetToken()}}, {new: true});
                    const data = {email: user.email, passwordReset}
                    
                    passResetLink(data, res);
                }

                else{
                    // otherwise generate and save token and also save the user             
                    const passwordReset = new PasswordReset({
                        token: ran.resetToken(),
                        userId: user._id
                    })

                    await passwordReset.save()
                    const data = {email: user.email, passwordReset}
                   
                    passResetLink(data, res);
                }
            }
            else{

                // bypass email verification and sending token to PasswordReset databse, send the token to client so that it can be passed to as query string
                const oldUser = await PasswordReset.findOne({userId: user._id})
                    
                if(oldUser){
                    const passwordReset = await PasswordReset.findOneAndUpdate({userId: user._id}, {$set: {token: ran.resetToken()}}, {new: true});
                }

                // otherwise generate and save token and also save the user             
                const passwordReset = new PasswordReset({
                    token: ran.resetToken(),
                    userId: user._id
                })

                await passwordReset.save()

                return res.status(200).json({status: true, msg: "You will be redirected to reset your password", token: passwordReset.token});
            }
                        
        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer service"});
        }
    },

    resetPass: async(req, res)=>{
        try{
            const {token} = req.query;
            
            const data = {
                password:  DOMPurify.sanitize(req.body.password),
                cpassword: DOMPurify.sanitize(req.body.cpassword)
            }

            if(!data.password || !data.cpassword){
                return res.status(400).json({status: false, msg: "Fill all required fields!"});

            }
            if(data.password != data.cpassword){
                return res.status(405).json({status: false, msg: "Passwords do not match!"});
                
            }
            if(!token){
                return res.status(400).json({status: false, msg: "Token is missing!"})
            }

            //search token in the database 
            const token_ = await PasswordReset.findOne({token});

            if(!token_){
                return res.status(400).json({status: false, msg: "Invalid token"})
            }
                    
            
            //use the token to find the user
            const user = await User.findOne({_id: token_.userId})

            if(!user){
                return res.status(400).json({status: false, msg: "User not found"});
            }
            
            // 1. remove the token from PasswordReset model
            await PasswordReset.findOneAndUpdate({user: token_.user}, {$set: {token: ""}})
            
            // 2. update user model with password
            const hashedPass = await bcrypt.hash(data.password, 10);

            await User.findOneAndUpdate({_id: user.id}, {$set: {password: hashedPass}}, {new: true});

            // login the user
            const accesstoken = generateAccesstoken(user._id);
            const refreshtoken = generateRefreshtoken(user._id);

            setCookie(accesstoken, refreshtoken, res, user);
            
            return res.status(200).json({status: true, msg: "Password Changed and you logged in"})
        }   
        catch(err){
            return res.status(500).json({status: false, msg: err.message});
        }
    },

    logout: async (req, res)=> {
        try{
        
            // clear refreshtoken from cookie
            res.clearCookie("accesstoken");
            res.clearCookie("refreshtoken");
            
            return res.status(200).json({ status: true, msg: "You have been Logged out"})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    updatePhone: async (req, res)=> {
        try{
            const loggedUserId = req.user
            const phone = DOMPurify.sanitize(req.body.phone);

            // update the user with the phone number
            await User.findByIdAndUpdate({_id: loggedUserId}, {$set: {
                phone
            }}, {new: true})

            const data =  await User.findOne({_id: loggedUserId}).populate({path: 'referrerId', select: ['_id', 'email', 'username']}).populate({path: 'referree', select: ['_id', 'email', 'username', 'hasReturnedReferralRewards', 'hasInvested', 'firstInvestmentPlanValue']}).select("-password");
            return res.status(200).json({status: true, msg: "Profile has been updated", data});
        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer support"})
        }
    }, 

    makeAdmin: async (req, res)=> {
        try{
            const {id} = req.params;

            const user = await User.findOne({_id: id})

            if(user.isBlocked){
                return res.status(401).json({status: true, msg: "User is blocked"});
            }

            if(!user.isVerified){
                return res.status(401).json({status: true, msg: "User's account is not verifeid"});
            }

            // update the user with the phone number
            const data = await User.findByIdAndUpdate({_id: id}, {$set: {
                isAdmin: true
            }}, {new: true})

            return res.status(200).json({status: true, msg: "User is now an Admin", data});
        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer support"})
        }
    }, 

    removeAdmin: async (req, res)=> {
        try{
            const {id} = req.params;
            const loggedId = req.user

            const loggedUser = await User.findOne({_id: loggedId})

            if(loggedUser.isPrimaryAdmin && id==loggedId){
                return res.status(401).json({status: false, msg: "Primary Admin cannot be remove from the role "});
            }
            // update the user with the phone number
            const data = await User.findByIdAndUpdate({_id: id}, {$set: {
                isAdmin: false
            }}, {new: true})

            return res.status(200).json({status: true, msg: "User is no more an Admin", data});
        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer support"})
        }
    }, 

    // uploadProfileImg: async(req, res) => {
    //     try{
    //         const loggedUserId = req.user

    //         const {id} = req.query; //profile image id
    //         let file
    //         let filePath
    //         let allowedExtension = [ ".png", ".jpg", ".jpeg"]

    //         if (!req.files || Object.keys(req.files).length === 0) {
    //             return res.status(400).json({status: false, msg:'No files were uploaded.'});
    //         }
        
    //         file = req.files.image

    //         const extensionName = path.extname(file.name)
    //         const allwedSize = 100. //kbs

    //         if(!allowedExtension.includes(extensionName)){
    //             return res.status(400).json({status: false, msg: "Invalid Image" })
    //         }

    //         if(file.size / 1024 > allwedSize){
    //             return res.status(400).json({status: false, msg: "Image to large, accepted size is 100kbs and below" })
    //         }

    //         filePath = `${appRoot}/uploads/${Date.now() + "_" + file.name}`;

    //         file.mv(filePath, async (err) => {
    //             if(err){
    //                 return res.status(500).json({ status: false, msg: err.message })
    //             }
                
    //             // check if id (profile image id) exist
    //             if(id){

    //                 //check if id is mongoose valid id
    //                 if(!mongoose.Types.ObjectId.isValid(id)){
    //                     return res.status(404).json({status: false, msg: "Not found!"})
    //                 }
                
    //                 // update the ProfileImg collection if the id exist
    //                 const img = await ProfileImg.findOne({_id: id})

    //                 if(!img){
    //                     return res.status(404).json({status: false, msg: "Not found!"})
    //                 }

    //                 const imgData = await ProfileImg.findByIdAndUpdate({_id: id}, {$set: {
    //                     imageName: file.name,
    //                     imageSize: file.size,
    //                     imagePath: filePath,
    //                 }}, {new: true});

    //                 // remove the image from uploads dir
    //                 const fileExist = fs.existsSync(filePath)
    //                 if(fileExist){
    //                     fs.unlinkSync(filePath)
    //                 }

    //                 return res.status(200).send({status: true, msg: "Profile has been updated", data: imgData})
    //             }

    //             // otherwise, Save new profile image to ProfileImg Database
    //             const newImg = new ProfileImg({
    //                 imageName: file.name,
    //                 imageSize: file.size,
    //                 imagePath: filePath,
    //             })
        
    //             let savedImg = await newImg.save()

    //             // remove the image from uploads dir
    //             const fileExist = fs.existsSync(filePath)
    //             if(fileExist){
    //                 fs.unlinkSync(filePath)
    //             }

    //             await User.findOneAndUpdate({_id: loggedUserId}, {$set: {profileImg: savedImg._id}});

    //             return res.status(200).send({status: true, msg: "Profile has been uploaded", data: savedImg})
                
    //         })
    //     }
    //     catch(err){
    //         return res.status(500).json({status: false, msg: err.message})
    //     }
    // },

    // removeProfileImg: async(req, res) => {
    //     try{

    //         const {id} = req.params; //profile image id
        
    //         //check if id is mongoose valid id
    //         if(!mongoose.Types.ObjectId.isValid(id)){
    //             return res.status(404).json({status: false, msg: "Not found!"})
    //         }
        
    //         // update the ProfileImg collection having that id
    //         const img = await ProfileImg.findOne({_id: id})

    //         if(!img){
    //             return res.status(404).json({status: false, msg: "Not found!"})
    //         }

    //         const imgData = await ProfileImg.findByIdAndUpdate({_id: id}, {$set: {
    //             imageName: null,
    //             imageSize: null,
    //             imagePath: null,
    //         }}, {new: true});

    //         return res.status(200).send({status: true, msg: "Profile image removed", data: imgData})
    //     }
    //     catch(err){
    //         return res.status(500).json({status: false, msg: "Server error, please contact customer support"})
    //     }
    // },

    blockUser: async (req, res)=> {
        try{
            let {id} = req.params

            //check if id is mongoose valid id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(404).json({status: false, msg: "User not found"})
            }
            
            // Find and block user, user most not be the admin
            const user_ = await User.findOne({_id: id})
            if(!user_){
                return res.status(404).json({status: false, msg: "User not found"})
            }
            if(user_.isAdmin){
                return res.status(400).json({status: false, msg: "Admin's account cannot be blocked"})

            }else{
                const newd = await User.findOneAndUpdate({_id: id}, {$set: {isBlocked: true}}, {new: true});

                return res.status(200).json({status: true, msg: "User has been blocked", data: newd})
            }
        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer support"})
        }
        
    },

    unblockUser: async (req, res)=> {
        try{
            let {id} = req.params

            //check if id is mongoose valid id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(404).json({status: false, msg: "User not found"})
            }
            
            // Find and unblock user
            const user_ = await User.findOne({_id: id})
            if(!user_){
                return res.status(404).json({status: false, msg: "User not found"})
            }
            const newD = await User.findOneAndUpdate({_id: id}, {$set: {isBlocked: false}}, {new: true});

            return res.status(200).json({status: true, msg: "User has been unblocked", data: newD});

        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer support"})
        }
        
    },
    
    removeUnverifiedUsers: async (req, res)=> {
        try{
            // get expiresIn from config data if exist otherwise set to 0

            // get all config
            const config = await Config.find({});
            UNVERIFIED_USER_EXPIRED_IN
            const time = config && config.length >= 1 && config[0].unverifyUserLifeSpan ? config[0].unverifyUserLifeSpan : 0
    
            const expiresIn = parseInt(time); // time is in seconds
  
            if(!time || time <= 0){
                return res.status(200).json({status: true, msg: "Unverified users allowed to stay"})
            }

            const currentTime = new Date().getTime() / 1000 // seconds

            //get all users
            const users = await User.find({})

            //loop through them and get the ids of unverified users that have stayed beyound welcome, none of these should be admin
            let ids = []
            for(let user of users){
                const createdTime = new Date(user.createdAt).getTime() / 1000 // seconds

                if(!user.isVerified && !user.isAdmin && currentTime - createdTime >= expiresIn){
                    ids.push(user._id.toString())
                }
            }

            // delete the users
            await User.deleteMany({isVerified: false})

            // delete all their deposit hx
            //...await User.deleteMany({userId_: ids})

            // delete all their withdrawal hx
            //...await User.deleteMany({userId_: ids})

            // delete all their internal transfer hx
            //...await User.deleteMany({userId_: ids})

            // delete all their investment hx
            //...await User.deleteMany({userId_: ids})


            return res.status(200).json({status: true, msg: "Unverified Users removed successfully"})
            
        }
        catch(err){
            return res.status(500).json({status: false, msg: err.message})
        }
    },

    deleteAccount: async (req, res)=> {
        try{
            const {id } = req.params;
            const loggedUserId = req.user

            //check if id is mongoose valid id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(404).json({status: false, msg: `User not found!`})
            }

            //find paramsUser
            const paramUser = await User.findOne({_id: id});
            if(!paramUser) res.status(404).json({status: false, msg: `User not found!`});

            //find loggeduser
            const loggedUser = await User.findOne({_id: loggedUserId})

            // if loggedUser is not the owner of the paramsId or not the admin, send error
            if(!loggedUser.isAdmin && (id !=loggedUserId)){
                return res.status(400).send({ status: false, msg: "Access denied"})
            }

            if(paramUser.isAdmin){
                return res.status(400).send({ status: false, msg: "Admin cannot be deleted"})
            }
                
            // Find and delete the account 
            const user = await User.findByIdAndDelete({_id: id})

            // delete his deposit hx
            //...await User.findByIdAndDelete({userId_: id})

            // delete his withdrawal hx
            //...await User.findByIdAndDelete({userId_: id})

            // delete his internal transfer hx
            //...await User.findByIdAndDelete({userId_: id})

            // delete his investment hx
            //...await User.findByIdAndDelete({userId_: id})

            return res.status(200).json({status: true, msg: "User has been deleted", data: user});

        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer service"})
        }
        
    },

    deleteAllUsers: async (req, res)=> {
        try{
            // get all users
            const users = await User.find({})
            
            let ids = []
            for(let user of users){
                if(!user.isAdmin){
                    ids.push(user.id)
                }
            }

            // delete all users
            await User.deleteMany({_id: ids})

             // delete all their deposit hx
            //...await User.deleteMany({userId_: ids})

            // delete all their withdrawal hx
            //...await User.deleteMany({userId_: ids})

            // delete all their internal transfer hx
            //...await User.deleteMany({userId_: ids})

            // delete all their investment hx
            //...await User.deleteMany({userId_: ids})


            return res.status(200).json({status: true, msg: "All users have been deleted"})

        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer service"})
        } 
    },
    
}