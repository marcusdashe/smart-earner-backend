"use strict"

const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const nodemailer = require("nodemailer")
const fileupload = require("express-fileupload")
const http = require("http")
const cookieParser = require('cookie-parser')
require('dotenv').config()

const winston = require("./config/winstonConfig")
const db = require('./config/db');
const errorResponder = require('./error/catchAll')

const app = express();
const server = http.createServer(app)

// parse requests of json type
app.use(express.json({
    verify: (req, res, buf)=>{
        req.rawBody = buf
    }
}))

// parse requests of content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false}));

// Parse cookie in app
app.use(cookieParser())

// logger
app.use(morgan('combined', { stream: winston.stream }));

// cross-origin request
var corsOptions = {
    origin: process.env.FRONTEND_BASE_URL,
    credentials: true
};
app.use(cors(corsOptions))

app.use(fileupload())

// register database model
require('./auth/models/auth')
require('./auth/models/passwordReset')
require('./auth/models/profileImg')
require('./websiteConfig/models/config')
require('./internalTransfer/models/internalTransfer')
require('./investment/models/investmentPlan')
require('./investment/models/investment')
require('./referralBonus/models/referralBonus')
require('./deposit/models/deposit')
require('./withdrawal/models/withdrawal')
require('./notifications/models/notification')
require('./testimonials/models/testimonials')
require('./transactions/models/transactions')

// routes
app.use('/auth',  require("./auth/routes/auth")); 
app.use('/config',  require('./websiteConfig/routes/config')); 
app.use('/transfer',  require('./internalTransfer/routes/internalTransfer')); 
app.use('/investment',  require('./investment/routes/investment')); 
app.use('/referral-bonus',  require('./referralBonus/routes/referralBonus')); 
app.use(require('./deposit/routes/deposit')); 
app.use('/withdrawal',  require('./withdrawal/routes/withdrawal')); 
app.use('/notification',  require('./notifications/routes/notification')); 
app.use('/testimonials',  require('./testimonials/routes/testimonials')); 
app.use('/transactions',  require('./transactions/routes/transactions')); 

// Catch all Error Handler
app.use(errorResponder);

// normalize port
const normalizePort = (val) => {
    let port = parseInt(val, 10)

    if(isNaN(port)) return val
    
    if(port >= 0) return port
    
    return false
}

//database
db()

// connect server
const PORT = normalizePort(process.env.PORT || "5000")
server.listen(PORT, (err)=>{
    if(err){
        console.log(err.message)
    }
    else{
        console.log(`Server connected in port ${PORT}`)
    }
})

// connect websocket using

