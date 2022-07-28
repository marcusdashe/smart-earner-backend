const express = require("express")
const notification = require('../controls/notification')
const { adminAuth, verifiedUserAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/set", verifiedUserAuth, notification.set);


module.exports = route