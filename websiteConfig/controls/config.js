const mongoose = require('mongoose')
const Config = mongoose.model("Config");
const path = require("path")
const fs = require("fs")
const appRoot = require("app-root-path")
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)


module.exports ={

    getConfig: async (req, res)=> {
        try{
            // get all config
            const config = await Config.find({});

            // check if document is empty,
            if(config.length < 1){

                // create the default
                const benefits_ = 'benefit1,benefit2,benefit3,'
                const contacts_ = 'contact1,contact2,contact3,';
                const withdrawalCoins_ = 'LITECOIN,DOGECOIN,TRON,USDT(bep20),BUSD(bep20),';

                const benefits = process.env.BENEFITS ? process.env.BENEFITS : benefits_;
                const contacts = process.env.CONTACTS ? process.env.CONTACTS : contacts_;
                const withdrawalCoins = process.env.WITHDRAWAL_COINS ? process.env.WITHDRAWAL_COINS : withdrawalCoins_;

                // convert benefits and contacts into array
                const resolveArr =(string)=>{
                    const data = string.split(',')
                    const dataArr = data.slice(0, data.length-1)
                    return dataArr
                }

                // resolve withdrawal factors into arrar
                const resolveWithdrawalFactors =()=>{
                    let factors=[]
                    const minWithdrawalLimit = 5000;
                    const maxWithdrawalLimit = 100000;
                    const withdrawalCommonDiff = 5000;

                    for(let i=minWithdrawalLimit; i<=maxWithdrawalLimit; i=i+withdrawalCommonDiff){
                        factors.push(i)
                    }
                    return factors
                }

                // resolve Transfer factors into arrar
                const resolveTransferFactors =()=>{
                    let factors=[]
                    const minTransferLimit = 5000;
                    const maxTransferLimit = 100000;
                    const transferCommonDiff = 1000;

                    for(let i=minTransferLimit; i<=maxTransferLimit; i=i+transferCommonDiff){
                        factors.push(i)
                    }
                    return factors
                }
                
                // create the default
                const newConfig = new Config({})
                newConfig.withdrawalFactors = resolveWithdrawalFactors()
                newConfig.transferFactors = resolveTransferFactors()
                newConfig.benefits = resolveArr(benefits)
                newConfig.contacts = resolveArr(contacts)
                newConfig.withdrawalCoins = resolveArr(withdrawalCoins)

                const configs = await newConfig.save()
                return res.status(200).json({ status: true, msg: "successful", data: configs})
            }
            
            // otherwise, get the existing ones
            return res.status(200).json({ status: true, msg: "successful", data: config[0]})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
        
    },

    updateConfig: async (req, res)=> {
        try{

            const name = 'SmartEarners';
            const bio = 'We Trade it, You Learn & Earn it';
            const benefits = 'benefit1,benefit2,benefit3,'
            const contacts = 'contact1,contact2,contact3,';
            const withdrawalCoins = 'LITECOIN,DOGECOIN,TRON,USDT(bep20),BUSD(bep20),';
            const customerSupport = 'yes';
            const nativeCurrency = 'SEC'
            const tradeCurrency = 'USD';
            const brandColorA = 'rgb(0, 65, 93)';
            const brandColorB = 'rgb(241 173 0)';
            const brandColorC = 'rgb(241 173 0)';
            const aboutUs = 'SmartEarners is a trustworthy platform that has been in existence for years serving several financial institutions across the world. We have had major rights and praises of good reputation amongst the section of investment platforms for trading and circular form of rewards.';
            const verifyEmail = 'no';
            const allowTransfer = 'yes';
            const unverifyUserLifeSpan = 0;
            const totalMembers = 0;
            const totalInvestors = 0;
            const totalSecPaid = 0;
            const conversionRate = 500;
            const investmentLimits = 2;
            const maxWithdrawalLimit = 100000;
            const minWithdrawalLimit = 5000
            const withdrawalCommonDiff = 5000
            const pendingWithdrawalDuration = 24;
            const maxTransferLimit = 100000;
            const minTransferLimit = 5000
            const transferCommonDiff = 1000
            const masterPlanAmountLimit = 200000
            const referralBonusPercentage = 10;
            const referralBonusMaxCountForMasterPlan = 30
            const referralBonusPercentageForMasterPlan = 0.3
            
            const data = {
                name: req.body.name ? DOMPurify.sanitize(req.body.name) : process.env.COMPANY_NAME ? process.env.COMPANY_NAME : name,

                bio: req.body.bio ? DOMPurify.sanitize(req.body.bio) : process.env.BIO ? process.env.BIO : bio,
                
                benefits: req.body.benefits ? DOMPurify.sanitize(req.body.benefits) : process.env.BENEFITS ? process.env.BENEFITS : benefits,

                contacts: req.body.contacts ? DOMPurify.sanitize(req.body.contacts) : process.env.CONTACTS ? process.env.CONTACTS : contacts,

                withdrawalCoins: req.body.withdrawalCoins ? DOMPurify.sanitize(req.body.withdrawalCoins) : process.env.WITHDRAWAL_COINS ? process.env.WITHDRAWAL_COINS : withdrawalCoins,

                nativeCurrency: req.body.nativeCurrency ? (DOMPurify.sanitize(req.body.nativeCurrency)).toUpperCase() : process.env.NATIVE_CURRENCY ? (process.env.NATIVE_CURRENCY).toUpperCase() : (nativeCurrency).toUpperCase(),

                tradeCurrency: req.body.tradeCurrency ? (DOMPurify.sanitize(req.body.tradeCurrency)).toUpperCase() : process.env.TRADE_CURRENCY ?  (process.env.TRADE_CURRENCY).toUpperCase() : (tradeCurrency).toUpperCase(),

                brandColorA: req.body.brandColorA ? DOMPurify.sanitize(req.body.brandColorA) : process.env.BRAND_COLOR_A ? process.env.BRAND_COLOR_A : brandColorA,

                brandColorB: req.body.brandColorB ? DOMPurify.sanitize(req.body.brandColorB) : process.env.BRAND_COLOR_B ? process.env.BRAND_COLOR_B : brandColorB,

                brandColorC: req.body.brandColorB ? DOMPurify.sanitize(req.body.brandColorC) : process.env.BRAND_COLOR_C ? process.env.BRAND_COLOR_C : brandColorC,

                aboutUs: req.body.aboutUs ? DOMPurify.sanitize(req.body.aboutUs) : process.env.ABOUT_US ? process.env.ABOUT_US : aboutUs,

                verifyEmail: req.body.verifyEmail ? (DOMPurify.sanitize(req.body.verifyEmail).toLowerCase() === 'yes' ? 'yes' : 'no' )  :  (process.env.VERIFY_EMAIL ? process.env.VERIFY_EMAIL.toLowerCase() === 'yes' ? 'yes' : 'no' : verifyEmail.toLowerCase()),
                
                allowTransfer: req.body.allowTransfer ? (DOMPurify.sanitize(req.body.allowTransfer).toLowerCase() === 'yes' ? 'yes' : 'no' )  :  (process.env.ALLOW_TRANSFER ? process.env.ALLOW_TRANSFER.toLowerCase() === 'yes' ? 'yes' : 'no' : allowTransfer.toLowerCase()),

                customerSupport: req.body.customerSupport ? (DOMPurify.sanitize(req.body.customerSupport).toLowerCase() === 'yes' ? 'yes' : 'no' )  :  (process.env.CUSTOMER_SUPPORT ? process.env.CUSTOMER_SUPPORT.toLowerCase() === 'yes' ? 'yes' : 'no' : customerSupport.toLowerCase()),

                unverifyUserLifeSpan: req.body.unverifyUserLifeSpan ? Number(DOMPurify.sanitize(req.body.unverifyUserLifeSpan)) : process.env.UNVERIFIED_USER_LIFESPAN ? Number(process.env.UNVERIFIED_USER_LIFESPAN) : Number(unverifyUserLifeSpan),

                totalMembers: req.body.totalMembers ? Number(DOMPurify.sanitize(req.body.totalMembers)) : process.env.TOTAL_MEMBERS ? Number(process.env.TOTAL_MEMBERS) : Number(totalMembers),

                totalInvestors: req.body.totalInvestors ? Number(DOMPurify.sanitize(req.body.totalInvestors)) : process.env.TOTAL_INVESTORS ? Number(process.env.TOTAL_INVESTORS) : Number(totalInvestors),

                totalSecPaid: req.body.totalSecPaid ? Number(DOMPurify.sanitize(req.body.totalSecPaid)) : process.env.TOTAL_SEC_PAID ? Number(process.env.TOTAL_SEC_PAID) : Number(totalSecPaid),

                conversionRate: req.body.conversionRate ? Number(DOMPurify.sanitize(req.body.conversionRate)) : process.env.CONVERSION_RATE ? Number(process.env.CONVERSION_RATE) : Number(conversionRate),

                investmentLimits: req.body.investmentLimits ? Number(DOMPurify.sanitize(req.body.investmentLimits)) : process.env.INVESTMENT_LIMITS ? Number(process.env.INVESTMENT_LIMITS) : investmentLimits,

                masterPlanAmountLimit: req.body.masterPlanAmountLimit ? Number(DOMPurify.sanitize(req.body.masterPlanAmountLimit)) : process.env.MASTER_PLAN_AMOUNT_LIMIT ? Number(process.env.MASTER_PLAN_AMOUNT_LIMIT) : masterPlanAmountLimit,

                referralBonusPercentage: req.body.referralBonusPercentage ? Number(DOMPurify.sanitize(req.body.referralBonusPercentage)) : process.env.REFERRAL_BONUS_PERCENTAGE ? Number(process.env.REFERRAL_BONUS_PERCENTAGE) : Number(referralBonusPercentage),
                
                referralBonusPercentageForMasterPlan: req.body.referralBonusPercentageForMasterPlan ? Number(DOMPurify.sanitize(req.body.referralBonusPercentageForMasterPlan)) : process.env.REFERRAL_BONUS_PERCENTAGE_FOR_MASTER ? Number(process.env.REFERRAL_BONUS_PERCENTAGE_FOR_MASTER) : Number(referralBonusPercentageForMasterPlan),

                referralBonusMaxCountForMasterPlan: req.body.referralBonusMaxCountForMasterPlan ? Number(DOMPurify.sanitize(req.body.referralBonusMaxCountForMasterPlan)) : process.env.REFERRAL_BONUS_MAX_COUNT_FOR_MASTER_PLAN ? Number(process.env.REFERRAL_BONUS_MAX_COUNT_FOR_MASTER_PLAN) : Number(referralBonusMaxCountForMasterPlan),

                maxWithdrawalLimit: req.body.maxWithdrawalLimit ? Number(DOMPurify.sanitize(req.body.maxWithdrawalLimit)) : process.env.MAX_WITHDRAWAL_LIMIT ? Number(process.env.MAX_WITHDRAWAL_LIMIT) : Number(maxWithdrawalLimit),

                minWithdrawalLimit: req.body.minWithdrawalLimit ? Number(DOMPurify.sanitize(req.body.minWithdrawalLimit)) : process.env.MIN_WITHDRAWAL_LIMIT ? Number(process.env.MIN_WITHDRAWAL_LIMIT) : Number(minWithdrawalLimit),

                withdrawalCommonDiff: req.body.withdrawalCommonDiff ? Number(DOMPurify.sanitize(req.body.withdrawalCommonDiff)) : process.env.WITHDRAWAL_COMMON_DIFF ? Number(process.env.WITHDRAWAL_COMMON_DIFF) : Number(withdrawalCommonDiff),

                pendingWithdrawalDuration: req.body.pendingWithdrawalDuration ? Number(DOMPurify.sanitize(req.body.pendingWithdrawalDuration)) : process.env.WITHDRAWAL_PENDING_DURATION ? Number(process.env.WITHDRAWAL_PENDING_DURATION) : Number(pendingWithdrawalDuration),

                maxTransferLimit: req.body.maxTransferLimit ? Number(DOMPurify.sanitize(req.body.maxTransferLimit)) : process.env.MAX_TRANSFER_LIMIT ? Number(process.env.MAX_TRANSFER_LIMIT) : Number(maxTransferLimit),

                minTransferLimit: req.body.minTransferLimit ? Number(DOMPurify.sanitize(req.body.minTransferLimit)) : process.env.MIN_TRANSFER_LIMIT ? Number(process.env.MIN_TRANSFER_LIMIT) : Number(minTransferLimit),

                transferCommonDiff: req.body.transferCommonDiff ? Number(DOMPurify.sanitize(req.body.transferCommonDiff)) : process.env.TRANSFER_COMMON_DIFF ? Number(process.env.TRANSFER_COMMON_DIFF) : Number(transferCommonDiff),
            }

            const resolveArr =(string)=>{
                const data = string.split(',')
                const dataArr = data.slice(0, data.length-1)
                return dataArr
            }

            const resolveWithdrawalFactors =()=>{
                let factors=[]
                const minWithdrawalLimit = data.minWithdrawalLimit
                const maxWithdrawalLimit = data.maxWithdrawalLimit
                const withdrawalCommonDiff = data.withdrawalCommonDiff

                for(let i=minWithdrawalLimit; i<=maxWithdrawalLimit; i=i+withdrawalCommonDiff){
                    factors.push(i)
                }
                return factors
            }

            const resolveTransferFactors =()=>{
                let factors=[]
                const minTransferLimit = data.minTransferLimit
                const maxTransferLimit = data.maxTransferLimit
                const transferCommonDiff = data.transferCommonDiff

                for(let i=minTransferLimit; i<=maxTransferLimit; i=i+transferCommonDiff){
                    factors.push(i)
                }
                return factors
            }

            const modifiedData = {
                name: data.name,
                bio: data.bio,
                benefits: resolveArr(data.benefits),
                contacts: resolveArr(data.contacts),
                withdrawalCoins: resolveArr(data.withdrawalCoins),
                customerSupport: data.customerSupport,
                nativeCurrency: data.nativeCurrency,
                tradeCurrency: data.tradeCurrency,
                brandColorA: data.brandColorA,
                brandColorB: data.brandColorB,
                brandColorC: data.brandColorC,
                aboutUs: data.aboutUs,
                verifyEmail: data.verifyEmail,
                allowTransfer: data.allowTransfer,
                unverifyUserLifeSpan: data.unverifyUserLifeSpan,
                pendingWithdrawalDuration: data.pendingWithdrawalDuration,
                totalMembers: data.totalMembers,
                totalInvestors: data.totalInvestors,
                totalSecPaid: data.totalSecPaid,
                conversionRate: data.conversionRate,
                investmentLimits: data.investmentLimits,
                referralBonusPercentageForMasterPlan: data.referralBonusPercentageForMasterPlan,
                referralBonusPercentage: data.referralBonusPercentage,
                masterPlanAmountLimit: data.masterPlanAmountLimit,
                minWithdrawalLimit: data.minWithdrawalLimit,
                maxWithdrawalLimit: data.maxWithdrawalLimit,
                withdrawalCommonDiff: data.withdrawalCommonDiff,
                minTransferLimit: data.minTransferLimit,
                maxTransferLimit: data.maxTransferLimit,
                transferCommonDiff: data.transferCommonDiff,
                referralBonusMaxCountForMasterPlan: data.referralBonusMaxCountForMasterPlan,
                withdrawalFactors: resolveWithdrawalFactors(),
                transferFactors: resolveTransferFactors()
            }

            // get all config
            const config = await Config.find({});

            // check if document  is empty
            if(config.length < 1){

                // create the default
                const benefits_ = 'benefit1,benefit2,benefit3,'
                const contacts_ = 'contact1,contact2,contact3,';
                const withdrawalCoins_ = 'LITECOIN,DOGECOIN,TRON,USDT(bep20),BUSD(bep20),';

                const benefits = process.env.BENEFITS ? process.env.BENEFITS : benefits_;
                const contacts = process.env.CONTACTS ? process.env.CONTACTS : contacts_;
                const withdrawalCoins = process.env.WITHDRAWAL_COINS ? process.env.WITHDRAWAL_COINS : withdrawalCoins_;

                // convert benefits and contacts into array
                const resolveArr =(string)=>{
                    const data = string.split(',')
                    const dataArr = data.slice(0, data.length-1)
                    return dataArr
                }

                // resolve withdrawal factors into arrar
                const resolveWithdrawalFactors =()=>{
                    let factors=[]
                    const minWithdrawalLimit = 5000;
                    const maxWithdrawalLimit = 100000;
                    const withdrawalCommonDiff = 5000;

                    for(let i=minWithdrawalLimit; i<=maxWithdrawalLimit; i=i+withdrawalCommonDiff){
                        factors.push(i)
                    }
                    return factors
                }

                // resolve Transfer factors into arrar
                const resolveTransferFactors =()=>{
                    let factors=[]
                    const minTransferLimit = 5000;
                    const maxTransferLimit = 100000;
                    const transferCommonDiff = 5000;

                    for(let i=minTransferLimit; i<=maxTransferLimit; i=i+transferCommonDiff){
                        factors.push(i)
                    }
                    return factors
                }
                
                // create the default
                const newConfig = new Config({})
                newConfig.withdrawalFactors = resolveWithdrawalFactors()
                newConfig.transferFactors = resolveTransferFactors()
                newConfig.benefits = resolveArr(benefits)
                newConfig.contacts = resolveArr(contacts)
                newConfig.withdrawalCoins = resolveArr(withdrawalCoins)

                const configs = await newConfig.save()
                return res.status(200).json({ status: true, msg: "successful", data: configs})
            }

            //get the first and only id
            const id = config[0].id

            //update config
            const configs = await Config.findByIdAndUpdate({_id: id}, {$set: modifiedData }, {new: true});

            return res.status(200).json({ status: true, msg: "successful", data: configs})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    // will be implemented by Marcus
    updateLogo: async (req, res)=> {
        try{
            // get all config
            const config = await Config.find({});

            let file
            let filePath
            let allowedExtension = [ ".png", ".jpg", ".jpeg"]
            let allwedSize = 3072            

            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({status: false, msg:'No files were uploaded.'});
            }
          
            file = req.files.file

            const extensionName = path.extname(file.name)
            
            if(!allowedExtension.includes(extensionName)){
                return res.status(400).json({status: false, msg: "Invalid Image" })
            }

            if(file.size / 1024 > allwedSize){
                return res.status(400).json({status: false, msg: `Image to large, accepted size is ${allwedSize / 1024}MBs and below` })
            }    

            filePath = `${appRoot}/uploads/${Date.now() + "_" + file.name}`;
            

            // check if document is empty,
            if(config.length < 1){

                // create the default
                const benefits_ = 'benefit1,benefit2,benefit3,'
                const contacts_ = 'contact1,contact2,contact3,';
                const withdrawalCoins_ = 'LITECOIN,DOGECOIN,TRON,USDT(bep20),BUSD(bep20),';

                const benefits = process.env.BENEFITS ? process.env.BENEFITS : benefits_;
                const contacts = process.env.CONTACTS ? process.env.CONTACTS : contacts_;
                const withdrawalCoins = process.env.WITHDRAWAL_COINS ? process.env.WITHDRAWAL_COINS : withdrawalCoins_;

                // convert benefits and contacts into array
                const resolveArr =(string)=>{
                    const data = string.split(',')
                    const dataArr = data.slice(0, data.length-1)
                    return dataArr
                }

                // resolve withdrawal factors into arrar
                const resolveWithdrawalFactors =()=>{
                    let factors=[]
                    const minWithdrawalLimit = 5000;
                    const maxWithdrawalLimit = 100000;
                    const withdrawalCommomDiff = 5000;

                    for(let i=minWithdrawalLimit; i<=maxWithdrawalLimit; i=i+withdrawalCommomDiff){
                        factors.push(i)
                    }
                    return factors
                }
                
                // create the default
                const newConfig = new Config({})
                newConfig.withdrawalFactors = resolveWithdrawalFactors()
                newConfig.benefits = resolveArr(benefits)
                newConfig.contacts = resolveArr(contacts)
                newConfig.withdrawalCoins = resolveArr(withdrawalCoins)

                const configs = await newConfig.save()
                
                // update the logo
                file.mv(filePath, async (err) => {
                    if(err){
                        return res.status(500).json({ status: false, msg: err.message })
                    }
                    
                    // save the image in logo field of config
                    const logo = await Config.findByIdAndUpdate({_id: configs[0].id}, {$set: {logo: filePath}}, {new: true});
                    
                    // remove the image from uploads dir
                    // const fileExist = fs.existsSync(filePath)
                    // if(fileExist){
                    //     fs.unlinkSync(filePath)
                    // }

                    return res.status(200).json({status: true, msg: 'successfull', data: logo})
                })
            }

            // if config already exist, update the logo
            // update the logo
            file.mv(filePath, async (err) => {
                if(err){
                    return res.status(500).json({ status: false, msg: err.message })
                }
                
                // save the image in logo field of config
                const logo = await Config.findByIdAndUpdate({_id: config[0].id}, {$set: {logo: filePath}}, {new: true});
                
                // remove the image from uploads dir
                // const fileExist = fs.existsSync(filePath)
                // if(fileExist){
                //     fs.unlinkSync(filePath)
                // }

                return res.status(200).json({status: true, msg: 'successfull', data: logo})
            })
        }
        catch(err){
            return res.status(500).json({status: false, msg: err.message})
        }
    },

    // will be implemented by Marcus
    removeLogo: async (req, res)=> {
        try{

           // get all config
           const config = await Config.find({});

           // save the image in logo field of config
           const logo = await Config.findByIdAndUpdate({_id: config[0].id}, {$set: {logo: null}}, {new: true});

           return res.status(200).json({status: true, msg: 'successfull', data: logo})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },
}