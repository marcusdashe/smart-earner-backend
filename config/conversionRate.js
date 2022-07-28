const mongoose = require('mongoose')
const Config = mongoose.model("Config");
require("dotenv").config();



const conversionRate = {
    SEC_TO_USD: async(amount)=>{
        try{
            // get config data if exist otherwise get from env

            const config = await Config.find({});
            let configData;

            if( config && config.length >= 1){
                configData = {
                    conversionRate: parseInt(config[0].conversionRate)
                }

            }else{
                configData = {
                    conversionRate: parseInt(process.env.CONVERSION_RATE),
                }
            } 

            return amount * 1 / configData.conversionRate
        }
        catch(err){
            throw err
        }
    },

    USD_TO_SEC: async(amount)=>{
        try{
             // get config data if exist otherwise get from env

            const config = await Config.find({});
            let configData;

            if( config && config.length >= 1){
                configData = {
                    conversionRate: parseInt(config[0].conversionRate)
                }

            }else{
                configData = {
                    conversionRate: parseInt(process.env.CONVERSION_RATE),
                }
            } 

            return amount * configData.conversionRate
        }
        catch(err){
            throw err
        }
    },
}

module.exports = conversionRate