const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'SmartEarners'
        },
        logo: {
            type: String,
        },
        bio: {
            type: String,
            default: 'We Trade it, You Learn & Earn it'
        },
        aboutUs: {
            type: String,
            default: 'SmartEarners is a trustworthy platform that has been in existence for years serving several financial institutions across the world. We have had major rights and praises of good reputation amongst the section of investment platforms for trading and circular form of rewards.'
        },
        benefits: [],
        customerSupport:{
            type: String,
            default: 'yes'
        },
        unverifyUserLifeSpan:{
            type: Number,
            default: 0 // in seconds, stays forever 
        },
        totalMembers: {
            type: Number,
            default: 0 
        },
        totalInvestors: {
            type: Number,
            default: 0 
        },
        totalSecPaid: {
            type: Number,
            default: 0,
        },
        conversionRate: {
            type: Number,
            default: 500 // 500 SEC === 1 USD
        },
        nativeCurrency: {
            type: String,
            default: "SEC"
        },
        tradeCurrency: {
            type: String,
            default: "USD"
        },
        brandColorA: {
            type: String,
            default: "rgb(0, 65, 93)"
        },
        brandColorB: {
            type: String,
            default: "rgb(241, 173, 0)"
        },
        brandColorC: {
            type: String,
            default: "rgb(241, 173, 0)" // change this color later
        },
        allowTransfer: {
            type: String,
            default: 'yes'
        },
        verifyEmail: {
            type: String,
            default: 'no'
        },
        contacts: [],
        investmentLimits: {
            type: Number,
            default: 2
        },
        referralBonusPercentage: {
            type: Number,
            default: 10
        },
        referralBonusPercentageForMasterPlan: {
            type: Number,
            default: 0.3
        },
        referralBonusMaxCountForMasterPlan: {
            type: Number,
            default: 30
        },
        minWithdrawalLimit: {
            type: Number,
            default: 5000
        },
        maxWithdrawalLimit: {
            type: Number,
            default: 100000
        },
        withdrawalCommonDiff: {
            type: Number,
            default: 5000
        },
        masterPlanAmountLimit: { // masterPlanMinAmount
            type: Number,
            default: 200000
        },
        withdrawalFactors: [],
        withdrawalCoins: [],
        minTransferLimit: {
            type: Number,
            default: 5000
        },
        maxTransferLimit: {
            type: Number,
            default: 100000
        },
        transferCommonDiff: {
            type: Number,
            default: 1000
        },
        transferFactors: [],
        pendingWithdrawalDuration: {
            type: Number,
            default: 24
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("Config", schema);