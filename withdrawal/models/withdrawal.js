const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User'
        },
        walletAddress: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            trim: true
        },
        currency: {
            type: String,
            default: 'SEC'
        },
        convertedAmount: {
            type: Number,
            trim: true
        },
        tradeCurrency: {
            type: String,
            default: 'USD'
        },
        coin: {
            type: String
        },
        status: {
            type: String,
            default: 'Pending'
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("Withdrawal", schema);