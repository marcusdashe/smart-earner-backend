const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        planId: {
            type: ObjectId,
            ref: 'InvestmentPlan',
            required: true,
        },
        userId: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number
        },
        rewarded: {
            type: Boolean,
            default: false
        },
        rewards: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'SEC',
            required: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true
    }
)
mongoose.model("Investment", schema);