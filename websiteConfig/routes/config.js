const express = require("express")
const config = require('../controls/config')
const { adminAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/get", config.getConfig);
route.put("/update", config.updateConfig);
route.put("/update-logo", config.updateLogo);
route.delete("/remove-logo", config.removeLogo);

module.exports = route