const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        senderId: {
            type: ObjectId,
            ref: 'User'
        },
        receiverId: {
            type: ObjectId,
            ref: 'User'
        },
        status: {
            type: Boolean,
            default: false
        },
        accountNumber: {
            type: String
        },
        amount: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'SEC'
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("InternalTransfer", schema);