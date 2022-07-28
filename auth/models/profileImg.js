const mongoose = require("mongoose")

const { Schema } = mongoose

const profileImgSchema = new Schema({
    imageName: { type: String, default: null },
    imageSize: { type: Number, default: null },
    imagePath: { type: String, default: null },

}, {timestamp: true})

mongoose.model("ProfileImg", profileImgSchema);