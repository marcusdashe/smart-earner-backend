const express = require("express")
const authCrtl = require('../controls/auth')
const { userAuth, adminAuth, priAdminAuth } = require("../middlewares/auth")

const route = express.Router()

route.get("/authorize", authCrtl.authorize);
route.get("/get-all-users", adminAuth, authCrtl.getUsers);

route.get("/get-profile", userAuth, authCrtl.getProfile);

route.get("/get-user/:id", userAuth, authCrtl.getUser);

route.post("/signup", authCrtl.signup);

route.get("/resend-verification-link", userAuth, authCrtl.resendVerificationLink);

route.get("/verify-account", authCrtl.verifyAccount);

route.post("/signin", authCrtl.signin);

route.get("/logout", authCrtl.logout);

route.get("/generate-accesstoken", authCrtl.generateAccesstoken);

route.post("/reset-pass-request", authCrtl.resetPassRequest);

route.post('/reset-pass', authCrtl.resetPass);

route.put('/update-phone', userAuth, authCrtl.updatePhone);

// route.put('/upload-user-image', userAuth, authCrtl.uploadProfileImg);

// route.delete('/remove-user-image/:id', userAuth, authCrtl.removeProfileImg);

route.delete('/remove-unverified-users', authCrtl.removeUnverifiedUsers)

route.put('/make-admin/:id', priAdminAuth, authCrtl.makeAdmin)

route.put('/remove-admin/:id', priAdminAuth, authCrtl.removeAdmin)

route.put('/block-user/:id', adminAuth, authCrtl.blockUser)

route.put('/unblock-user/:id', adminAuth, authCrtl.unblockUser)

route.delete('/delete-account/:id', adminAuth, authCrtl.deleteAccount)

// delete all users except the admin
// only the admin will have access to this
route.delete('/delete-all-accounts', priAdminAuth, authCrtl.deleteAllUsers)

module.exports = route