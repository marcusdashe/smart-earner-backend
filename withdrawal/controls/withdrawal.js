const mongoose = require('mongoose')
const Withdrawal = mongoose.model("Withdrawal");
const Transactions = mongoose.model("Transactions");
const User = mongoose.model("User");
const Config = mongoose.model("Config");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const { SEC_TO_USD } = require('../../config/conversionRate');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

module.exports ={

    request: async (req, res)=> {
        try{
            const userId = req.user;
            const data = {
                amount:  Number(DOMPurify.sanitize(req.body.amount)),
                coin:  DOMPurify.sanitize(req.body.coin),
                walletAddress: DOMPurify.sanitize(req.body.walletAddress)
            };
            const convertedAmount = await SEC_TO_USD(Number(data.amount))

            // resolve withdrawal factors incase it's not in the database
            const resolveWithdrawalFactors =()=>{
                let factors=[]
                const maxWithdrawalLimit = process.env.MAX_WITHDRAWAL_LIMIT ? Number(process.env.MAX_WITHDRAWAL_LIMIT) : 100000;
                const minWithdrawalLimit = process.env.MIN_WITHDRAWAL_LIMIT ? Number(process.env.MIN_WITHDRAWAL_LIMIT) : 5000;
                const withdrawalCommomDiff = process.env.WITHDRAWAL_COMMON_DIFF ? Number(process.env.WITHDRAWAL_COMMON_DIFF) : 5000;

                for(let i=minWithdrawalLimit; i<=maxWithdrawalLimit; i=i+withdrawalCommomDiff){
                    factors.push(i)
                }
                return factors
            }

            const resolveArr =(string)=>{
                const data = string.split(',')
                const dataArr = data.slice(0, data.length-1)
                return dataArr
            }

            // get currency, withdrawalCoins, maxWithdrawalLimit, minWithdrawalLimit and withdrawalCommomDifference from config data if exist otherwise set to the one in env

            // get all config
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : (process.env.NATIVE_CURRENCY).toUpperCase();

            const tradeCurrency = config && config.length >= 1 && config[0].tradeCurrency ? config[0].tradeCurrency : (process.env.TRADE_CURRENCY).toUpperCase();
            
            const withdrawalCoins = config && config.length >= 1 && config[0].withdrawalCoins ? config[0].withdrawalCoins : resolveWithdrawalFactors()

            const withdrawalFactors = config && config.length >= 1 && config[0].withdrawalFactors ? config[0].withdrawalFactors : resolveArr(process.env.WITHDRAWAL_COINS);
            
            const pendingWithdrawalDuration = config && config.length >= 1 && config[0].pendingWithdrawalDuration ? config[0].pendingWithdrawalDuration : resolveArr(process.env.PENDING_WITHDRAWAL_DURATION);

            if(!data.amount || !data.walletAddress){
                return res.status(400).json({ status: false, msg: "All fields are required"});
            }

            // validate
            if(!data.coin){
                return res.status(400).json({ status: false, msg: "Please select a coin"});
            }

            // check if coin selected is valid
            if(!withdrawalCoins.includes(data.coin)){
                return res.status(400).json({ status: false, msg: "Unsupported coin"});
            }
            
            if(!withdrawalFactors.includes(data.amount)){
                return res.status(400).json({ status: false, msg: "Invalid amount"});
            }

            // get all Withdrawal hx, and check if the user has a pending transaction
            let hasPendingTxn = false
            const withdrawals = await Withdrawal.find({})
            for(let withdrawal of withdrawals){
                if(withdrawal.userId.toString() === userId.toString()){
                    if(withdrawal.status === 'pending'){
                        hasPendingTxn = true
                    }
                }
            }

            // amount requested for should not be more than their account total balance
            const user = await User.findOne({_id: userId});

            if(data.amount > user.amount){
                return res.status(400).json({ status: false, msg: "Insulficient balance"});
            }

            else if(hasPendingTxn){
                return res.status(400).json({ status: false, msg: "You have a pending transaction"});
            }

            else{
                // save this data in Withdrawal database
                const newData_ = new Withdrawal({
                    userId,              
                    amount: (data.amount).toFixed(8),
                    walletAddress: data.walletAddress,
                    coin: data.coin,
                    status: 'pending',
                    currency,
                    convertedAmount,
                    tradeCurrency
                })

                // remove the amount from the user's account balace
                await User.findByIdAndUpdate({_id: userId}, {$set: {
                    amount: (user.amount - data.amount).toFixed(8)
                }});

                const newData = await newData_.save();

                // save to Transactions hx
                const NewTransactionHx = new Transactions({
                    type: 'withdrawal',
                    amount: data.amount.toFixed(8),
                    status: 'pending',
                    currency,
                    userId,
                    transactionId: newData._id
                })
                await NewTransactionHx.save()
                
                const withdrawalData = await Withdrawal.findOne({_id: newData.id}).populate({path: 'userId', select: ['_id', 'username', 'email']})
                return res.status(200).json({ status: true, msg: `Pending transaction, will be confirmed within ${pendingWithdrawalDuration} hours`, data: withdrawalData})
            }
        }

        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    rejected: async (req, res)=> {
        try{
            const {id} = req.params

            // validate
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Transaction not found"})
            }
            
            // get this withdrawal hx from the database
            const withdrawalHx = await Withdrawal.findOne({_id: id})

            if(!withdrawalHx){
                return res.status(400).json({status: false, msg: "Transaction not found"})
            }

            if(withdrawalHx.status === 'rejected'){
                return res.status(400).json({ status: false, msg: "Transaction already rejected"});
            }

            else if(withdrawalHx.status === 'confirmed'){
                return res.status(400).json({ status: false, msg: "Transaction already confirmed"});
            }
            
            else{
                // save this data in Withdrawal database and change the status to rejected and refund the money

                // find the user
                const user = await User.findOne({_id: withdrawalHx.userId})

                // add the removed amount to the user's account balance
                const newData = await User.findByIdAndUpdate({_id: withdrawalHx.userId}, {$set: {amount: user.amount + withdrawalHx.amount}}, {new: true})

               // update the Withdrawal database and change the status to rejected
                await Withdrawal.findByIdAndUpdate({_id: id}, {$set: {
                    status: 'rejected',
                }}, {new: true})
    
                // find and update transaction hx using the transactionId
                await Transactions.findOneAndUpdate({transactionId: id}, {$set: {
                    status: 'rejected'
                }});

                withdrawalData = await Withdrawal.findOne({_id: withdrawalHx.id}).populate({path: 'userId', select: ['_id', 'username', 'email']})

                return res.status(200).json({ status: true, msg: `withdrawal to this wallet ${withdrawalData.walletAddress} was rejected`, data: withdrawalData})
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    confirm: async (req, res)=> {
        try{
            
            // get withdrawal id
            const {id} = req.params

            const data = {
                amount:  Number(DOMPurify.sanitize(req.body.amount))
            };

            if(!data.amount){
                return res.status(400).json({ status: false, msg: "All fields are required"});
            }

              // validate
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Transaction not found"})
            }
            
            // get this withdrawal hx from the database
            const withdrawalHx = await Withdrawal.findOne({_id: id})

            if(!withdrawalHx){
                return res.status(400).json({status: false, msg: "Transaction not found"})
            }

            if(withdrawalHx.status === 'rejected'){
                return res.status(400).json({ status: false, msg: "Transaction was rejected, reach the client to resend request"});
            }

            else if(withdrawalHx.status === 'confirmed'){
                return res.status(400).json({ status: false, msg: "Transaction already confirmed"});
            }
            
            else{

                // check and compare the amounts (amountRequested and amountPaid)
                if(data.amount > withdrawalHx.amount){
                    return res.status(400).json({status: false, msg: 'Amount is more than the requested '})
                }

                else if(data.amount < withdrawalHx.amount){
                    return res.status(400).json({status: false, msg: 'Amount is less than the requested'})
                }

                else{
                    // update the Withdrawal database and change the status to confirmed
                    const data_ = await Withdrawal.findByIdAndUpdate({_id: id}, {$set: {
                        status: 'confirmed',
                    }}, {new: true})

                    // find and update transaction hx the transactionId
                    await Transactions.findOneAndUpdate({transactionId: id}, {$set: {
                        status: 'successful'
                    }});

                    return res.status(200).json({ status: true, msg: `Transaction confirmed`, data: data_})
                }
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg:"Server error, please contact customer support"})
        }
    },

    getAllTransactions: async (req, res)=> {
        try{
            const userId = req.user
            // get all withdrawal hx from the database
            const withdrawalHxs = await Withdrawal.find({})
            const loggedUser = await User.findOne({_id: userId})

            // if loggedUser is admin, send all withdrawalHx
            if(loggedUser.isAdmin){
                return res.status(200).json({status: true, msg: "success", data: withdrawalHxs})
            }

            // if loggedUser is not the admin, only send his/her own transaction
            let userTxns = [];
            for(let withdrawalHx of withdrawalHxs){
                if(withdrawalHx.userId.toString() === userId.toString()){
                    userTxns.push(withdrawalHx)
                }
            }

            return res.status(200).json({status: true, msg: "success", data: userTxns})
        }
        catch(err){
            return res.status(500).json({ status: false, msg:"Server error, please contact customer support"})
        }
    },

    getTransaction: async (req, res)=> {
        try{
            
            const {id} = req.params
            const userId = req.user

            // validate
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Transaction not found"})
            }
            
            // get this withdrawal hx from the database
            const withdrawalHx = await Withdrawal.findOne({_id: id})

            if(!withdrawalHx){
                return res.status(400).json({status: false, msg: "Transaction not found"})
            }

            // get the loggedUser
            const loggedUser = await User.findOne({_id: userId})

            // if loggedUser is the admin, he can get any transactions
            // for the other verified users, they can only get their own transactions

            if(withdrawalHx.userId.toString() === userId.toString() || loggedUser.isAdmin){
                return res.status(200).json({status: true, msg: "success", data: withdrawalHx})
            }

            else{
                return res.status(400).json({status: false, msg: "Access denied!"})
            }
            
        }
        catch(err){
            return res.status(500).json({ status: false, msg:"Server error, please contact customer support"})
        }
    },
}