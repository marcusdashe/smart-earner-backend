const mongoose = require('mongoose')
const User = mongoose.model("User");
const ReferralBonus = mongoose.model("ReferralBonus");
const Transactions = mongoose.model("Transactions");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

module.exports ={

    getAllBounuses: async (req, res)=> {
        try{
            
            const userId = req.user;

            // get all referralBonus hx
            const txns = await ReferralBonus.find({});

            // get the loggeduser to check if he is the admin, then send all referralBonus hx
            const loggeduser = await User.findOne({_id: userId})
            
            if(loggeduser.isAdmin){
                const txnData = await ReferralBonus.find({}).populate({path: 'referrerId', select: ['_id', 'email', 'username']}).populate({path: 'referreeId', select: ['_id', 'email', 'username', 'hasReturnedReferralBonus', 'hasInvested', 'firstInvestmentPlanValue']}).sort({createdAt: -1});

                return res.status(200).send({status: true, msg: 'Successful', data: txnData})
            }

            else{
                // get the referrerId if he is the logged user
                let ids = []
                for(let txn of txns){
                    if(txn.referrerId.toString() === userId.toString()){
                        ids.push(txn.id)
                    }
                }

                const txnData = await ReferralBonus.find({_id: ids}).populate({path: 'referrerId', select: ['_id', 'email', 'username']}).populate({path: 'referreeId', select: ['_id', 'email', 'username', 'hasReturnedReferralBonus', 'hasInvested', 'firstInvestmentPlanValue']}).sort({createdAt: -1});

                return res.status(200).send({status: true, msg: 'Successful', data: txnData})
            }
                    
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getBounus: async (req, res)=> {
        try{
            const {id} = req.params;
            const userId = req.user;

            // check item if exist
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(404).json({status: false, msg: "Not found"})
            }

            // get the referralBonus
            const txn = await ReferralBonus.findOne({_id: id})

            if(!txn){
                return res.status(404).json({ status: false, msg: "Not found"})

            }
            else{
                // check if the loggeduser is the admin
                const loggeduser = await User.findOne({_id: userId})
                

                // check if the loggeduser was the one that owns the referralBonus hx or the admin
                if(txn.referrerId.toString() === userId.toString() || loggeduser.isAdmin){

                    const txnData = await ReferralBonus.findOne({_id: id}).populate({path: 'referrerId', select: ['_id', 'email', 'username']}).populate({path: 'referreeId', select: ['_id', 'email', 'username', 'hasReturnedReferralBonus', 'hasInvested', 'firstInvestmentPlanValue']});

                    return res.status(200).send({status: true, msg: 'Success', data: txnData})
                }
                else{
                    return res.status(400).send({status: false, msg: 'Access denied!'})
                }
            }       
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    addReferralCode: async (req, res)=> {
        try{
            const userId = req.user

            // sanitize all elements from the client, incase of fodgery
            const data = {
                refcode:  DOMPurify.sanitize(req.body.refcode),
            }

            // get the logged user
            const loggedUser = await User.findOne({_id: userId});

            // get the referrer user using the refcode
            const referrerUser = await User.findOne({referralCode: data.refcode});

            if(!referrerUser){
                return res.status(404).json({status: false, msg: "User not found"})
            }

            // check to be sure user has not already been refferred by
            if(loggedUser.referrerId){
                // get the user that referred him prior
                const priorReferrerUser = await User.findOne({_id: loggedUser.referrerId});

                return res.status(400).json({status: false, msg: `You have already been referred by ${priorReferrerUser.username}`})
            }
            else{
                // push the loggedUser to the referrerUser's referree list
                await User.findOneAndUpdate({referralCode: data.refcode}, {$push: {
                    referree: userId
                }})

                // add the referrerUser to the referrerIdof the loggedUser
                await User.findOneAndUpdate({_id: userId}, {$set: {
                    referrerId: referrerUser.id
                }})

                return res.status(200).json({status: true, msg: `You have been successfully added to the referree list of ${referrerUser.username}`})

            }

            
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },
}
