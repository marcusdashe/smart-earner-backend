const express = require("express")
const investment = require('../controls/investment')
const { adminAuth, verifiedUserAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/get-all-plans", investment.getAllPlans);
route.get("/get-plan/:id", verifiedUserAuth, investment.getPlan);
route.post("/set-plan", adminAuth, investment.setPlan);
route.put("/update-plan/:id", adminAuth, investment.updatePlan);
route.delete("/delete-plan/:id", adminAuth, investment.deletePlan);
route.delete("/delete-all-Plans", adminAuth, investment.deleteAllPlans);

route.get("/get-all-investments", verifiedUserAuth, investment.getAllInvestments);
route.get("/get-investment/:id", verifiedUserAuth, investment.getInvestment);
route.post("/invest/:id", verifiedUserAuth, investment.invest);
route.get("/resolve", investment.resolve);




module.exports = route