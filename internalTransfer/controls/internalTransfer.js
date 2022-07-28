const mongoose = require('mongoose')
const InternalTransfer = mongoose.model("InternalTransfer");
const Transactions = mongoose.model("Transactions");
const User = mongoose.model("User");
const Config = mongoose.model("Config");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)


module.exports ={
        
    checkUser: async (req, res)=> {
        try{
            const userId = req.user

            // sanitize all elements from the client, incase of fodgery
            const data = {
                amount:  Number(DOMPurify.sanitize(req.body.amount)),
                accountNumber:  DOMPurify.sanitize(req.body.accountNumber),
            }

            // get currency, maxWithdrawalLimit, minWithdrawalLimit, withdrawalCommomDifference and allowTransfer from config data if exist otherwise set to the one in env

            // get all config
            const config = await Config.find({});

            const allowTransfer = config && config.length >= 1 && config[0].nativeCurrency ? config[0].allowTransfer : (process.env.ALLOW_TRANSFER).toLowerCase();

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : (process.env.NATIVE_CURRENCY).toUpperCase();

            const transferFactors = config && config.length >= 1 && config[0].transferFactors ? config[0].transferFactors : resolveTransferFactors();

            if(allowTransfer !== 'yes'){
                return res.status(402).json({ status: false, msg: "Transfer is not currenctly available, please check later"})
            }

            if(!data.amount || !data.accountNumber){
                return res.status(400).json({ status: false, msg: "All fields are required"})
            }

             // resolve transfer factors incase it's not in the database
             const resolveTransferFactors =()=>{
                let factors=[]
                const maxTransferLimit = process.env.MAX_TRANSFER_LIMIT ? Number(process.env.MAX_TRANSFER_LIMIT) : 100000;
                const minTransferLimit = process.env.MIN_TRANSFER_LIMIT ? Number(process.env.MIN_TRANSFER_LIMIT) : 5000;
                const transferCommonDiff = process.env.TRANSFER_COMMON_DIFF ? Number(process.env.TRANSFER_COMMON_DIFF) : 5000;

                for(let i=minTransferLimit; i<=maxTransferLimit; i=i+transferCommonDiff){
                    factors.push(i)
                }
                return factors
            }

            if(!transferFactors.includes(data.amount)){
                return res.status(400).json({ status: false, msg: "Invalid amount"});
            }

            // get sender's total amount
            const user = await User.findOne({_id: userId})
            if(!user){
                return res.status(500).json({ status: false, msg: "User not found!"})
            }

            // check sender's amount, if less than what he is transfering, send error
            if(Number(data.amount) > Number(user.amount)){
                return res.status(400).json({ status: false, msg: "Insufficient balance"})
            }

            // get the receiver using the account number
            const rUser = await User.findOne({accountNumber: data.accountNumber});

            // validate the account number
            if(!rUser){
                return res.status(400).json({ status: false, msg: "Invalid account number"})
            };

            // check to be sure account number does not belongs to the sender
            if(rUser.accountNumber === user.accountNumber){
                return res.status(400).json({ status: false, msg: "Owner's account number"})
            }

            const info = {
                username: rUser.username,
                email: rUser.email,
                accountNumber: rUser.accountNumber,
                amount: data.amount,
                currency: currency
            }

            // send confirmation msg to the sender
            return res.status(200).json({ status: true, msg: "check info", data: info})        
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    payUser: async (req, res)=> {
        try{
            const userId = req.user

            // sanitize all elements from the client, incase of fodgery
            const data = {
                amount: Number(DOMPurify.sanitize(req.body.amount)),
                accountNumber: DOMPurify.sanitize(req.body.accountNumber),
            }

            if(!data.amount || !data.accountNumber){
                return res.status(400).json({ status: false, msg: "All fields are required"})
            }

            // check transfer factors

            // resolve transfer factors incase it's not in the database
            const resolveTransferFactors =()=>{
                let factors=[]
                const maxTransferLimit = process.env.MAX_TRANSFER_LIMIT ? Number(process.env.MAX_TRANSFER_LIMIT) : 100000;
                const minTransferLimit = process.env.MIN_TRANSFER_LIMIT ? Number(process.env.MIN_TRANSFER_LIMIT) : 5000;
                const transferCommonDiff = process.env.TRANSFER_COMMON_DIFF ? Number(process.env.TRANSFER_COMMON_DIFF) : 5000;

                for(let i=minTransferLimit; i<=maxTransferLimit; i=i+transferCommonDiff){
                    factors.push(i)
                }
                return factors
            }

            // get currency, maxTransferLimit, minTransferLimit and transferCommonDifference from config data if exist otherwise set to the one in env
            // get all config
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;

            const transferFactors = config && config.length >= 1 && config[0].transferFactors ? config[0].transferFactors : resolveTransferFactors();

            // check for transfer factors
            if(!transferFactors.includes(data.amount)){
                return res.status(400).json({ status: false, msg: "Invalid amount"});
            }

             // get sender's total amount
            const user = await User.findOne({_id: userId})
            if(!user){
                return res.status(400).json({ status: false, msg: "User not found!"})
            }

            // check sender's amount, if less than what he is transfering, send error
            if(Number(data.amount) >Number(user.amount)){
                return res.status(400).json({ status: false, msg: "Insufficient balance"})
            }

            const rUser = await User.findOne({accountNumber: data.accountNumber});

            // validate the account number
            if(!rUser){
                return res.status(400).json({ status: false, msg: "Invalid account number"})
            };

            // check to be sure account number does not belongs to the sender
            if(rUser.accountNumber === user.accountNumber){
                return res.status(400).json({ status: false, msg: "Owner's account number"})
            }
 
            //.........................................................

            // handle transactions
            // 1. add the amount to the receiver's account
            await User.findByIdAndUpdate({_id: rUser.id}, {$set: {
                amount: (rUser.amount + data.amount).toFixed(8)
            }}, {new: true})

            // 2. remove the amount from sender's account
            await User.findByIdAndUpdate({_id: userId}, {$set: {
                amount: (user.amount - data.amount).toFixed(8)
            }}, {new: true})

            // 3 save data into internal transfer database (transaction) of the sender            

            const newInternalTransfer = new InternalTransfer({
                senderId: userId,
                receiverId: rUser.id,
                accountNumber: data.accountNumber,
                amount: data.amount.toFixed(8),
                currency,
                status: true
            })

            const newInternalTransfer_ = await newInternalTransfer.save();
        
            // 4 save to Transactions 
            const NewTransactionHx = new Transactions({
                type: 'transfer',
                amount: data.amount.toFixed(8),
                currency,
                userId: userId,
                status: 'successful',
                receiver: rUser.id,
                transactionId: newInternalTransfer_._id
            })
            await NewTransactionHx.save()
            

            const data_ = await InternalTransfer.findOne({_id: newInternalTransfer_.id}).populate({path: 'senderId', select: ['_id', 'username', 'email']}).populate({path: 'receiverId', select: ['_id', 'username', 'email']});

            return res.status(200).json({ status: true, msg: `Transaction successful`, data: data_}) 
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getAllTransactions: async (req, res)=> {
        try{
            const userId = req.user;

            // get the transaction hx
            const txns = await InternalTransfer.find({});

            // get the loggeduser to check if he is the admin
            const loggeduser = await User.findOne({_id: userId})
            
            // if admin, send all the txns
            if(loggeduser.isAdmin){
                const txnsData = await InternalTransfer.find({}).populate({path: 'senderId', select: ['_id', 'username', 'email']}).populate({path: 'receiverId', select: ['_id', 'username', 'email']}).sort({createdAt: -1});

                return res.status(200).send({status: true, msg: 'Successful', data: txnsData})
            }

            else{

                // check if non admin loggedUser is the sender or receiver, then send only his tnxs
                let ids = []
                for(let txn of txns){
                    if(txn.senderId.toString() === userId.toString() || txn.receiverId.toString() === userId.toString()){
                        ids.push(txn._id)
                    }
                }

                const txnsData = await InternalTransfer.find({_id: ids}).populate({path: 'senderId', select: ['_id', 'username', 'email']}).populate({path: 'receiverId', select: ['_id', 'username', 'email']}).sort({createdAt: -1});

                return res.status(200).send({status: true, msg: 'Successful', data: txnsData})
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getTransaction: async (req, res)=> {
        try{
            const userId = req.user;
            const {id} = req.params;

            // check the id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Transaction not found"})
            }

            // get the transaction hx
            const txn = await InternalTransfer.findOne({_id: id});
            if(!txn){
                return res.status(400).json({status: false, msg: "Transaction not found"})
            }

            // check if the loggeduser is the admin
            const loggeduser = await User.findOne({_id: userId})
            
            // check if loggeduser was the one that did the transfer he requets for or the admin
            if(txn.senderId.toString() === userId.toString() || txn.receiverId.toString() === userId.toString() || loggeduser.isAdmin){
                const txnData = await InternalTransfer.findOne({_id: id}).populate({path: 'senderId', select: ['_id', 'username', 'email']}).populate({path: 'receiverId', select: ['_id', 'username', 'email']})

                return res.status(200).send({status: true, msg: 'Successful', data: txnData})
            }

            // if none of the above, send error
            else{
                return res.status(400).send({status: false, msg: 'Access denied'})
            }

        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    }
}