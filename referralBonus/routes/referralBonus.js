const express = require("express")
const referralBonus = require('../controls/referralBonus')
const { userAuth, verifiedUserAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/get-all-bonuses", verifiedUserAuth, referralBonus.getAllBounuses);

route.get("/get-bonus/:id", verifiedUserAuth, referralBonus.getBounus);

route.put("/add-referral-code", userAuth, referralBonus.addReferralCode);

module.exports = route