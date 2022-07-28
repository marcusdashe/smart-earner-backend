const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
        },
        currency: {
            type: String,
            default: 'SEC'
        },
        userId: {
            type: ObjectId,
            ref: 'User'
        },
        receiver: {
            type: ObjectId,
            ref: 'User'
        },
        referreeId: {
            type: ObjectId,
            ref: 'User'
        },
        transactionId: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("Transactions", schema);