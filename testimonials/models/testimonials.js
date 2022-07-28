const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'Anonymous'
        },
        body: {
            type: String,
            required: true,
        },
        removed: {
            type: Boolean,
            default: false
        },
        avatar: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("Testimonials", schema);