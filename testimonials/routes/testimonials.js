const express = require("express")
const testimonials = require('../controls/testimonials')
const { adminAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.post("/post", testimonials.post);
route.get("/get-selected", testimonials.getSelected);
route.get("/get-all", adminAuth, testimonials.getAll);
route.get("/get/:id", adminAuth, testimonials.get);

route.put("/remove/:id", adminAuth, testimonials.restrict);
route.delete("/delete/:id", adminAuth, testimonials.delete);
route.delete("/delete-all", adminAuth, testimonials.deleteAll);



module.exports = route