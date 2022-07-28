const express = require("express")
// const transactions = require('../controls/transactions')
const { userAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

// route.get("/add", transactions.add);
// route.post("/getAll", userAuth, transactions.getAll);
// route.get("/get/:id", userAuth, adminAuth, testimonials.get);


module.exports = route
