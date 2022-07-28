const express = require("express")
const internalTransfer = require('../controls/internalTransfer')
const { adminAuth, verifiedUserAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/get-all-transactions", verifiedUserAuth, internalTransfer.getAllTransactions);
route.get("/get-transaction/:id", verifiedUserAuth, internalTransfer.getTransaction);
route.post("/check-user", verifiedUserAuth, internalTransfer.checkUser);
route.post("/pay-user", verifiedUserAuth, internalTransfer.payUser);


module.exports = route