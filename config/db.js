const mongoose = require('mongoose')
require('dotenv').config()
// const MOGOURL = process.env.MONGO_URL || `mongodb://localhost:27017/smartEarners`
const MOGOURL = `mongodb://localhost:27017/smartEarners`

module.exports = async() =>{
    try{
        mongoose.connect(MOGOURL);
        console.log("Database connected")
    }
    catch(err){
        console.log("Database connection error");
    }
}