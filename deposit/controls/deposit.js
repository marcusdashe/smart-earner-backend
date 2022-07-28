const mongoose = require('mongoose')
const axios = require('axios')
const Deposit = mongoose.model("Deposit");
const User = mongoose.model("User");
const Config = mongoose.model("Config");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const conversionRate = require('../../config/conversionRate');
const { Client, resources, Webhook } = require('coinbase-commerce-node');

const PRODUCTION = Boolean(process.env.PRODUCTION);

const API_KEY = "326db613-b084-4c42-86b1-05ff3828353b";
const WEBHOOK_SECRET = "6367d535-8dce-4eea-993f-20bfd23cbfbd"

Client.init(API_KEY);
const {Charge} = resources;

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

const DOMAIN = process.env.BACKEND_BASE_URL

module.exports ={
    
    deposit: async (req, res)=> {
        try{
            
            const userId = req.user
            const user = await User.findOne({_id: userId})

            // sanitize all elements from the client, incase of fodgery
            // amount is in dollars
            const data = {
                amount: Number(DOMPurify.sanitize(req.body.amount)),
            }

            // get all config
            const config = await Config.find({});

            const tradeCurrency = config && config.length >= 1 && config[0].tradeCurrency ? (config[0].tradeCurrency).toUpperCase() : (process.env.TRADE_CURRENCY).toUpperCase();

            const nativeCurrency = config && config.length >= 1 && config[0].nativeCurrency ? (config[0].nativeCurrency).toUpperCase() : (process.env.NATIVE_CURRENCY).toUpperCase();

            const name = config && config.length >= 1 && config[0].name ? config[0].name : process.env.COMPANY_NAME

            const bio = config && config.length >= 1 && config[0].bio ? config[0].bio : process.env.BIO

            const minDepositLimit = PRODUCTION ? (config && config.length >= 1 && config[0].minDepositLimit ? config[0].minDepositLimit : process.env.MIN_DEPOSIT_LIMIT) : 5

            const amount_usd = await conversionRate.SEC_TO_USD(minDepositLimit)

            if(!data.amount){
                return res.status(400).json({ status: false, msg: "All fields are required"})
            }

            // amount must not be less than the minDepositLimit
            if(data.amount < amount_usd){
                return res.status(400).json({ status: true, msg: `Minimum deposit is ${amount_usd}${tradeCurrency} (${minDepositLimit}${nativeCurrency})`})
            }

            // convert this amount from SEC to USD
        
            const chargeData = {
                name: name,
                description: bio,
                local_price: {
                    amount: data.amount,
                    currency: 'USD'
                },
                pricing_type: "fixed_price",
                metadata: {
                    customer_id: userId,
                    customer_name: user.username
                },

                redirect_url: `${DOMAIN}/chargeCompleted`,
                cancel_url: `${DOMAIN}/chargeCanceled`
            }

            const charge = await Charge.create(chargeData)
           
            // save info to the databse
            const newDepositData = new Deposit({
                userId: charge.metadata.customer_id,
                code: charge.code,
                amountExpected: charge.pricing.local.amount,
                amountReceived: 0,
                overPaymentThreshold: charge.payment_threshold.overpayment_relative_threshold,
                underPaymentThreshold: charge.payment_threshold.underpayment_relative_threshold,
                currency: charge.pricing.local.currency,
                status: "charge-created",
                amountResolved: null,
                link: charge.hosted_url
            })

            await newDepositData.save()

            // ave to Transactions 
            const NewTransactionHx = new Transactions({
                type: 'deposit',
                amount: 0,
                currency,
                userId: charge.metadata.customer_id,
                status: 'created',
                transactionId: newDepositData._id
            })
            await NewTransactionHx.save()

            const data_ = {
                hostedUrl: newDepositData.link,
                redirecturl: chargeData.redirect_url,
                cancelUrl: chargeData.cancel_url,
            }

            // send the redirect to the client
            return res.status(200).json({ status: true, msg: 'charge created', data: data_})

        }
        catch(err){
            if(err.response){
                return res.status(500).json({ status: false, msg: err.response.data})
                 
            }else{
                if(err.message.includes('ENOTFOUND') || err.message.includes('ETIMEDOUT') || err.message.includes('ESOCKETTIMEDOUT')){
                    return res.status(500).json({ status: false, msg: 'Poor network connection'})
                }
                else{
                    return res.status(500).json({ status: false, msg: err.message})
                }
            }
        }
    },

    depositWebhook: async (req, res)=> {
        try{
            
            // get the deposit database
            const depositHxs = await Deposit.find({})
            const rawBody = req.rawBody;
            const signature = req.headers['x-cc-webhook-signature'];
            const webhookSecret = WEBHOOK_SECRET
            const event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);
            
            // loop through the depositHxs
            for(let depositHx of depositHxs){

                // charge canceled
                if(event.type === 'charge:failed' && !event.data.payments[0] && depositHx.status === 'charge-created'){
                    await Deposit.findOneAndUpdate({code: event.data.code}, {$set: {
                        comment: 'canceled',
                        status: 'charge-failed',
                    }})

                    // find and update transaction hx the transactionId
                    // 1. find the particular deposit using the code
                    const depositH = await Deposit.findOne({code: event.data.code})
                    await Transactions.findOneAndUpdate({transactionId: depositH._id}, {$set: {
                        status: 'canceled'
                    }});
                }

                // charge pending
                else if(event.type === 'charge:pending' && depositHx.status === 'charge-created'){
                    await Deposit.findOneAndUpdate({code: event.data.code}, {$set: {
                        comment: 'pending',
                        status: 'charge-pending',
                    }});

                    // find and update transaction hx the transactionId
                    // 1. find the particular deposit using the code
                    const depositH = await Deposit.findOne({code: event.data.code})
                    await Transactions.findOneAndUpdate({transactionId: depositH._id}, {$set: {
                        status: 'pending'
                    }});

                }

                // charge conmfirmed
                else if(event.type === 'charge:confirmed' && depositHx.status === 'charge-pending'){
                    const amountReceived_ = event.data.payments[0].value.crypto.amount;
                    const cryptocurrency = event.data.payments[0].value.crypto.currency;

                    // convert amount received from whatever the currency paid with to USD
                    const res = await axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=${cryptocurrency}`);
                    const amountReceived = Number(res.data.data.rates.USD) * Number(amountReceived_);

                    const amountReceive = amountReceived.toFixed(8);

                    // updated deposit
                    await Deposit.findOneAndUpdate({code: event.data.code}, {$set: {
                        comment: 'successfull',
                        amountReceived: amountReceive,
                        status: 'charge-confirmed',
                    }})

                    // find and update transaction hx the transactionId
                    // 1. find the particular deposit using the code
                    const depositH = await Deposit.findOne({code: event.data.code});
                    await Transactions.findOneAndUpdate({transactionId: depositH._id}, {$set: {
                        amount: amountReceive,
                        status: 'successful',
                    }});

                }

                // charge incorrect payment (overpayment/underpayment)
                else if(event.type === 'charge:failed' && event.data.payments[0] && depositHx.status === 'charge-pending'){
                    const amountExpected = Number(depositHx.amountExpected)
                    const amountReceived_ = Number(event.data.payments[0].value.crypto.amount);
                    const cryptocurrency = event.data.payments[0].value.crypto.currency;
                    const overpayment_threshold = Number(event.data.payment_threshold.overpayment_relative_threshold);
                    const underpayment_threshold = Number(event.data.payment_threshold.underpayment_relative_threshold);

                    // convert amount received from whatever the currency paid with to USD
                    const res = await axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=${cryptocurrency}`);
                    const amountReceived = Number(res.data.data.rates.USD) * Number(amountReceived_);

                    const isUnderpaid = (amountReceived < amountExpected) && (amountExpected - amountReceived < underpayment_threshold);

                    const isOverpaid = (amountReceived > amountExpected) && ( amountReceived - amountExpected > (overpayment_threshold - 0.004));

                    const resolveComent =()=>{
                        
                        if(isOverpaid){
                            return "overpayment"
                        }

                        else if(isUnderpaid){
                            return "underpayment"
                        }
                    }

                    const resolveOverPayment =()=>{
                        if(isOverpaid){
                            const amountDiff = amountReceived - amountExpected
                            return amountDiff.toFixed(8)
                        }

                        else if(isUnderpaid){
                            return 0
                        }
                    }

                    const resolveUnderPayment =()=>{
                        if(isUnderpaid){
                            const amountDiff = amountExpected - amountReceived
                            return amountDiff.toFixed(8)
                        }

                        else if(isOverpaid){
                            return 0
                        }
                    }
                    const amountReceive = amountReceived.toFixed(8);
                    
                    await Deposit.findOneAndUpdate({code: event.data.code}, {$set: {
                        amountReceived: amountReceive,
                        comment: resolveComent(),
                        status: 'charge-confirmed',
                        overPaidBy: resolveOverPayment(),
                        underPaidBy: resolveUnderPayment()
                    }}) 
                     
                    // find and update transaction hx the transactionId
                    // 1. find the particular deposit using the code
                    const depositH = await Deposit.findOne({code: event.data.code});
                    await Transactions.findOneAndUpdate({transactionId: depositH._id}, {$set: {
                        amount: amountReceive,
                        status: 'successful',
                    }});

                }
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    resolve: async (req, res)=> {
        try{
            
            const userId = req.user
            const user = await User.findOne({_id: userId});
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

}
