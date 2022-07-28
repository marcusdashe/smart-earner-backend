const mongoose = require('mongoose')
const InvestmentPlan = mongoose.model("InvestmentPlan");
const Investment = mongoose.model("Investment");
const Transactions = mongoose.model("Transactions");
const ReferralBonus = mongoose.model("ReferralBonus");
const User = mongoose.model("User");
const Config = mongoose.model("Config");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)
const PRODUCTION = Boolean(process.env.PRODUCTION);

module.exports ={
        
    getAllPlans: async (req, res)=> {
        try{
               const plans = await InvestmentPlan.find({}).sort({amount: 1});
               return res.status(200).json({ status: true, msg: "suucessful", data: plans})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getPlan: async (req, res)=> {
        try{
            const {id} = req.params;

            // check id if exist
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Not found"})
            }

            // chekc if the Plan exist
            const data = await InvestmentPlan.findOne({_id: id})
            if(!data){
                return res.status(400).json({status: false, msg: "Not found"})
            }

            return res.status(200).json({ status: false, msg: "successful", data})
                    
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    setPlan: async (req, res)=> {
        try{
            const data = {
                type:  DOMPurify.sanitize(req.body.type),
                amount:  Number(DOMPurify.sanitize(req.body.amount)),
                lifespan:  Number(DOMPurify.sanitize(req.body.lifespan)),
                returnPercentage:  Number(DOMPurify.sanitize(req.body.returnPercentage)),
            }

            // get currency from config data if exist otherwise set to the one in env
            // get all config.
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;

            const masterPlanAmountLimit = config && config.length >= 1 && config[0].masterPlanAmountLimit ? Number(config[0].masterPlanAmountLimit) : Number(process.env.MASTER_PLAN_AMOUNT_LIMIT);

            // validate form input
            if(!data.type || !data.amount || !data.lifespan || !data.returnPercentage){
                return res.status(500).json({ status: false, msg: "All fields are required"});
            }

             // check if the plan type is MASTER, then makesure the amount is same as the one in the config
             if(data.type.toLowerCase() === process.env.MASTER_PLAN_TYPE.toLowerCase() || data.type.toLowerCase() === 'master'){

                // check to makesure the masterPlanAmountLimit is equal to data.amount
                if(masterPlanAmountLimit !== data.amount){
                    return res.status(400).json({ status: false, msg: `MASTER PLAN minimun amount is set to be ${masterPlanAmountLimit}, You can change this from config`})
                }
            }

            // check if the amount is equal to or more than masterPlanAmountLimit, then the name must be master plan
            if(data.amount >= masterPlanAmountLimit){
                if(data.type.toLowerCase() !== process.env.MASTER_PLAN_TYPE.toLowerCase() || data.type.toLowerCase() !== 'master' ){
                    return res.status(400).json({ status: false, msg: `Since this amount is for MASTER PLAN, the type must be Master `})
                }
            }

            // check to makesure plan types is not already in existance
            const investmentPlans = await InvestmentPlan.findOne({type: data.type.toLowerCase()});

            if(investmentPlans){
                return res.status(400).json({ status: false, msg: "Plan already exist"})
            }
            // save the data to the database
            const newInvestmentPlan = new InvestmentPlan({
                type:  data.type.toLowerCase(),
                amount: data.amount.toFixed(8),
                currency,
                lifespan: data.lifespan,
                returnPercentage: data.returnPercentage,
            })

            await newInvestmentPlan.save();

            return res.status(200).json({ status: true, msg: "successful", data: newInvestmentPlan})
                    
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    updatePlan: async (req, res)=> {
        try{
            const {id} = req.params;
            const data = {
                type: DOMPurify.sanitize(req.body.type),
                amount: Number(DOMPurify.sanitize(req.body.amount)),
                lifespan: Number(DOMPurify.sanitize(req.body.lifespan)),
                returnPercentage: Number(DOMPurify.sanitize(req.body.returnPercentage)),
            }

            // get currency from config data if exist otherwise set to the one in env
            // get all config.
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;

            const masterPlanAmountLimit = config && config.length >= 1 && config[0].masterPlanAmountLimit ? Number(config[0].masterPlanAmountLimit) : Number(process.env.MASTER_PLAN_AMOUNT_LIMIT);

            // validate form input
            if(!data.type || !data.amount || !data.lifespan || !data.returnPercentage){
                return res.status(400).json({ status: false, msg: "All fields are required"});
            }

            // check id if exist
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            // chekc if the id exist
            const data_ = await InvestmentPlan.findOne({_id: id})
            if(!data_){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            // check if the plan type is MASTER, then makesure the amount is same as the one in the config
            if(data.type.toLowerCase() === process.env.MASTER_PLAN_TYPE.toLowerCase() || data.type.toLowerCase() === 'master'){

                // check to makesure the masterPlanAmountLimit is equal to data.amount
                if(masterPlanAmountLimit !== data.amount){
                    return res.status(400).json({ status: false, msg: `MASTER PLAN minimun amount is set to be ${masterPlanAmountLimit}, You can change this from config`})
                }
            }

            // check if the amount is equal to or more than masterPlanAmountLimit, then the name must be master plan
            if(data.amount >= masterPlanAmountLimit){
                if(data.type.toLowerCase() !== process.env.MASTER_PLAN_TYPE.toLowerCase() || data.type.toLowerCase() !== 'master' ){
                    return res.status(400).json({ status: false, msg: `Since this amount is for MASTER PLAN, the type must be 'Master' `})
                }
            }

            // check to makesure plan types is not already in existance
            
            const updatingPlan = await InvestmentPlan.findOne({_id: id});

            if(updatingPlan.type.toLowerCase() !== data.type.toLowerCase()){
                const oldDiffPlan = await InvestmentPlan.findOne({type: data.type.toLowerCase()})

                if(oldDiffPlan){
                    return res.status(400).json({ status: false, msg: "Plan already exist"})
                }
            }


            // // save the data to the database
            const planData = {
                type: data.type,
                amount: data.amount.toFixed(8),
                currency,
                lifespan: data.lifespan,
                returnPercentage: data.returnPercentage,
            }
            const updatedData = await InvestmentPlan.findByIdAndUpdate({_id: id}, {$set: planData}, {new: true});

            return res.status(200).json({ status: true, msg: "plan updated", data: updatedData})  
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    deletePlan: async (req, res)=> {
        try{
            const {id} = req.params;

            // check id if exist
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            const deletedData = await InvestmentPlan.findByIdAndDelete({_id: id});

            if(!deletedData){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            return res.status(200).json({ status: true, msg: "Plan deleted", data: deletedData})  
                    
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    deleteAllPlans: async (req, res)=> {
        try{

            await InvestmentPlan.deleteMany({});

            const data = await InvestmentPlan.find({});

            return res.status(200).json({ status: true, msg: "All plans deleted", data})     
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    invest: async (req, res)=> {
        try{
            const {id} = req.params // planId past in params
            const userId = req.user;

            const data = {
                amount:  Number(DOMPurify.sanitize(req.body.amount)),
            }

            // 3. get the user from user database
            const user = await User.findOne({_id: userId})

            // check item if exist
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            // check if the plan exist
            const plan = await InvestmentPlan.findOne({_id: id})

            if(!plan){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            // get currency from config data if exist otherwise set to the one in env
            // get all config.
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;

            const masterPlanAmountLimit = config && config.length >= 1 && config[0].masterPlanAmountLimit ? Number(config[0].masterPlanAmountLimit) : Number(process.env.MASTER_PLAN_AMOUNT_LIMIT);

            const referralBonusPercentage = config && config.length >= 1 && config[0].referralBonusPercentage? Number(config[0].referralBonusPercentage) : Number(process.env.REFERRAL_BONUS_PERCENTAGE);

            const referralBonusPercentageForMasterPlan = config && config.length >= 1 && config[0].referralBonusPercentageForMasterPlan? Number(config[0].referralBonusPercentageForMasterPlan) : Number(process.env.REFERRAL_BONUS_PERCENTAGE_FOR_MASTER);

            const referralBonusMaxCountForMasterPlan = PRODUCTION ? (config && config.length >= 1 && config[0].referralBonusMaxCountForMasterPlan? Number(config[0].referralBonusMaxCountForMasterPlan) : Number(process.env.REFERRAL_BONUS_MAX_COUNT_FOR_MASTER_PLAN)) : 3;

            // get all plans the user has
            const userPlans = await Investment.find({userId}).populate({path: 'planId'}); // array

            let count = 0;
            let samePlan = 0;

            // loop through all the investment the logged user has
            for(let userPlan of userPlans){

                // increament the count base on how many active investment he has running
                if(userPlan.isActive){
                    ++count
                }

                // check for active investment plans, if same with the plan he is requesting for currently, increament samePlan
                if(userPlan.isActive && userPlan.planId.type === plan.type){
                    ++samePlan
                }
            }

            const investmentLimits = config && config.length >= 1 && config[0].investmentLimits? config[0].investmentLimits : process.env.INVESTMENT_LIMITS;

            // if count is more than, refuse him of further investment
            if(count >= investmentLimits){
                return res.status(400).json({ status: false, msg: `You cannot have more than ${investmentLimits} active investments`})
            }
            else{

                // no user should have same active plan for more than once
                if(samePlan >= 1){
                    return res.status(400).json({ status: false, msg: "You have this plan running already"})
                }

                else{

                    // master plan investment, check if selected plan amount is equal to or more than the master plan amount limit from config database
                    if(plan.amount >= masterPlanAmountLimit){

                        // validate data.amount
                        if(!data.amount){
                            return res.status(400).json({ status: false, msg: "All field is required"})
                        }

                        if(data.amount < masterPlanAmountLimit){
                            return res.status(400).json({ status: false, msg: `Minimun amount for MASTER plan is ${masterPlanAmountLimit}`})
                        }

                        // check to makesure he does not invest more than his total account balance
                        if(data.amount > user.amount){
                            return res.status(400).json({ status: false, msg: "Insufficient balance"})
                        }

                        const newData = {
                            planId: id,
                            userId,
                            amount: data.amount.toFixed(8), // amount from form input, not the plan amount since the user can invest with any amount of money equal to or more than the master plan if he chooses master plan
                            currency,
                        }
    
                        const newInvestment = new Investment(newData);
                        await newInvestment.save();

                        // save to Transactions 
                        const NewTransactionHx = new Transactions({
                            type: 'invsetment',
                            amount: data.amount.toFixed(8),
                            currency,
                            userId,
                            status: 'active',
                            transactionId: newInvestment._id
                        })
                        await NewTransactionHx.save()

                        // Update the user database by removing this investment plan amount from their total account balance
                        await User.findByIdAndUpdate({_id: userId}, {$set: {
                            amount: (user.amount - data.amount).toFixed(8)
                        }})
    
                        // check user if masterInvestmentCount is between 0 and referralBonusMaxCountForMasterPlan, if true, he can returns the referral bonus to his referrer, then increment the masterInvestmentCount (This is to make sure he only returns the referral bonus to his referrer gfor only referralBonusMaxCountForMasterPlan times of investment)
                        if(user.masterInvestmentCount >= 0 && user.masterInvestmentCount <= referralBonusMaxCountForMasterPlan){

                            // check if user was referred by another user, then return their referral bonus to this referrer using their first investment (this is only for the first investment)
                            if(user.referrerId){

                                // get the referrerUser
                                const referrerUser = await User.findOne({_id: user.referrerId})
                                
                                // calculate the referalBonus
                                const referralBonus = referralBonusPercentageForMasterPlan / 100 * data.amount;

                                // update the referrer account balance with this referralBonus
                                await User.findByIdAndUpdate({_id: user.referrerId}, {
                                    $set: {amount: (referrerUser.amount + referralBonus).toFixed(8)}
                                })

                                // save new collection in the referralBonus database
                                const newReferralBonus = new ReferralBonus({
                                    referrerId: user.referrerId,
                                    referreeId: userId,
                                    amount: referralBonus.toFixed(8),
                                    currency
                                })

                                await newReferralBonus.save();

                                // save to Transactions 
                                const NewTransactionHx = new Transactions({
                                    type: 'referral-bonus',
                                    amount: referralBonus.toFixed(8),
                                    currency,
                                    userId: user.referrerId,
                                    referreeId: userId,
                                    status: 'successful',
                                    transactionId: newReferralBonus._id
                                })
                                await NewTransactionHx.save()
                            }
                        }

                        // update referree user and change hasInvested to true and increment masterInvestmentCount by 1
                        await User.findByIdAndUpdate({_id: userId}, {
                            $set: {
                                hasInvested: true,
                                masterInvestmentCount: user.masterInvestmentCount + 1
                            }
                        })
                              
                        const investmentData =  await Investment.findOne({_id: newInvestment.id}).populate({path: 'planId'});

                        return res.status(200).json({ status: true, msg: `You have started investment for ${plan.type}`, data: investmentData})
                    }

                    else{

                        // check to makesure he does not invest more than his total account balance
                        if(plan.amount > user.amount){
                            return res.status(400).json({ status: false, msg: "Insufficient balance"})
                        }

                        const newData = {
                            planId: id,
                            userId,
                            amount: plan.amount.toFixed(8),
                            currency,
                        }
    
                        const newInvestment = new Investment(newData);
                        await newInvestment.save();
                        
                        // save to Transactions 
                        const NewTransactionHx = new Transactions({
                            type: 'invsetment',
                            amount: plan.amount.toFixed(8),
                            currency,
                            userId,
                            status: 'active',
                            transactionId: newData._id
                        })
                        await NewTransactionHx.save()
                                                
                        // Update the user database by removing this investment plan amount from their total account balance
                        await User.findByIdAndUpdate({_id: userId}, {$set: {
                            amount: (user.amount - plan.amount).toFixed(8),
                        }});

                         // Check ths user collection in User adatabse to see if this is his/her first investment (hasInvested: false). This will make sure referral bonus is returned to referrer only once (first investment) for those that are someone else's referree
                        if(!user.hasInvested){

                            // check if user was referred by another user, then return their referral bonus to this referrer using their first investment (this is only for the first investment)
                            if(user.referrerId){

                                // get the referrerUser
                                const referrerUser = await User.findOne({_id: user.referrerId})
                                
                                // calculate the referalBonus
                                const referralBonus = referralBonusPercentage / 100 * plan.amount;

                                // update the referrer account balance with this referralBonus
                                await User.findByIdAndUpdate({_id: user.referrerId}, {
                                    $set: {amount: (referrerUser.amount + referralBonus).toFixed(8)}
                                })

                                // save new collection in the referralBonus database
                                const newReferralBonus = new ReferralBonus({
                                    referrerId: user.referrerId,
                                    referreeId: userId,
                                    amount: referralBonus.toFixed(8)
                                })

                                await newReferralBonus.save()

                                // save to Transactions 
                                const NewTransactionHx = new Transactions({
                                    type: 'referral-bonus',
                                    amount: referralBonus.toFixed(8),
                                    currency,
                                    userId: user.referrerId,
                                    referreeId: userId,
                                    status: 'successful',
                                    transactionId: newReferralBonus._id
                                })
                                await NewTransactionHx.save()
                            }

                            // update referree user and change hasInvested to true
                            await User.findByIdAndUpdate({_id: userId}, {
                                $set: {hasInvested: true}
                            })
                        }
                        
                        const investmentData = await Investment.findOne({_id: newInvestment.id}).populate({path: 'planId'});

                        return res.status(200).json({ status: true, msg: `You have started investment for ${plan.type}`, data: investmentData})
                    }
                }
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    resolve: async (req, res)=> {
        try{
          
            // get all investments
            const investments = await Investment.find({}).populate({path: 'planId'});

            // check if there are investment
            let maturedInvestments = []
            let activeInvestment = []
            if(!investments){
                return res.status(200).json({ status: true, msg: "No any investment made"})
            }
            

            // loop through investments
            for(let investment of investments){
                const currentTime = new Date().getTime() / 1000 // seconds

                const createTime = new Date(investment.createdAt).getTime() / 1000 // seconds
                
                const investmentLifespan = Number(investment.planId.lifespan)

                // check for all active investment that have matured
                if( currentTime - createTime >= investmentLifespan && investment.isActive){
                    maturedInvestments.push(investment)

                }
                else{
                    activeInvestment.push(investment)
                }
            }
            
            // fetch the users with these maturedInvestments and update their account balance
            if(maturedInvestments.length > 0){
                for(let maturedInvestment of maturedInvestments){

                    // get the users with these investments
                    const userId = maturedInvestment.userId.toString();
                    const users = await User.findOne({_id: userId})
    
                    // get the amount
                    const amount = Number(maturedInvestment.amount);
                    // console.log(maturedInvestment.amount)
    
                    // get the investment returnPercentage
                    const returnPercentage = Number(maturedInvestment.planId.returnPercentage)
    
                    // calculate the reward
                    const reward = ( returnPercentage / 100) * amount;

                    // update the users account with the amount he invested with and the rewards
                    await User.updateMany({_id: userId}, {$set: {
                        amount: (users.amount + amount + reward).toFixed(8)
                    }}, {new: true})

                    // update the investment database, 
                    await Investment.updateMany({_id: maturedInvestment.id}, {$set: {
                        rewards: reward,
                        rewarded: true,
                        isActive: false
                    }}, {new: true})
                    
                    
                    // find and update transaction hx the transactionId
                    await Transactions.updateMany({transactionId: maturedInvestment.id}, {$set: {
                        status: 'matured'
                    }});
                }

                return res.status(200).json({ status: true, msg: "successful"})  

            }else{
                return res.status(200).json({ status: true, msg: "successful"})  
            }

        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getAllInvestments: async (req, res)=> {
        try{
            
            const userId = req.user;

            // get all investment hx
            const txns = await Investment.find({});

            // get the loggeduser to check if he is the admin
            const loggeduser = await User.findOne({_id: userId})
            
            if(loggeduser.isAdmin){
                const txnData = await Investment.find({}).populate({path: 'planId'}).populate({path: 'userId', select: ['_id', 'email', 'username']}).sort({createdAt: -1});
                return res.status(200).send({status: true, msg: 'Successful', data: txnData})
            }

            else{
                let ids = []
                for(let txn of txns){
                    if(txn.userId.toString() === userId.toString()){
                        ids.push(txn.id)
                    }
                }

                const txnData = await Investment.find({_id: ids}).populate({path: 'planId'}).populate({path: 'userId', select: ['_id', 'email', 'username']}).sort({createdAt: -1});

                return res.status(200).send({status: true, msg: 'Successful', data: txnData})
            }
                    
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getInvestment: async (req, res)=> {
        try{
            const {id} = req.params;
            const userId = req.user;

            // check item if exist
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            // get the txn
            const txn = await Investment.findOne({_id: id}).populate({path: 'planId'});

            if(!txn){
                return res.status(400).json({ status: false, msg: "Investment not found found"})

            }
            else{

                // check if the loggeduser was the one that owns the investment hx or the admin
                if(txn.userId.toString() === userId.toString() || loggeduser.isAdmin){
                    const txnData = await Investment.findOne({_id: id}).populate({path: 'planId'}).populate({path: 'userId', select: ['_id', 'email', 'username']});
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
    
}