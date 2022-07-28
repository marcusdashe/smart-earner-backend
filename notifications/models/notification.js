const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        senderId: {
            type: ObjectId,
            ref: 'User'
        },
    },
    {
        timestamps: true
    }
)
mongoose.model("Notification", schema);