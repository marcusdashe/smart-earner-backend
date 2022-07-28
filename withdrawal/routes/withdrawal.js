const express = require("express")
const withdrawal = require('../controls/withdrawal')
const { adminAuth, verifiedUserAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/get-all-transactions", verifiedUserAuth, withdrawal.getAllTransactions);
route.get("/get-transaction/:id", verifiedUserAuth, withdrawal.getTransaction);
route.post("/request", verifiedUserAuth, withdrawal.request);
route.get("/rejected/:id", adminAuth, withdrawal.rejected);
route.put("/confirm/:id", adminAuth, withdrawal.confirm);


module.exports = route