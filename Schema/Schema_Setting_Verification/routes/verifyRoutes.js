const express = require("express");
const router = express.Router();
const verificationTypeController = require("../../Schema_Setting_Verification/controllers/Verification_type_controller");
const verificationAll = require('../../Scema_Verification/controllers/verification')
const checkAuth = (req, res, next) => {
    if (!req.session.userID) {
        return res.status(401).json({ error: "User not authenticated. Please log in." });
    }
    next();
};

router.get("/verify", (req, res) => {
    const user = req.session.user;
    if (user){
        res.render('verify', {user})
    }else{
        res.redirect('/login');
    }
});

router.get("/otpphone", (req, res) => {
    const user = req.session.user;
    if (user){
        res.render('otpphone', {user})
    }else{
        res.redirect('/login');
    }
});

router.post("/request-otp-phone", checkAuth, (req, res, next) => {
    console.log("Received POST request at /request-otp-phone");
    next();
}, verificationAll.GenarateCode);

// router.post('/verify/phone/verify', verificationAll.verifyCode);
router.post("/verify",checkAuth, verificationAll.verifyCode);
router.post("/resend-otp",checkAuth, verificationAll.resendCode);
// router.post("/resend-phone", checkAuth, verificationAll.resendCode);
// router.post('/verify-phone', checkAuth, verificationAll.verifyCode);

router.post("/addVerificationStep", checkAuth, verificationTypeController.newVerificationType);

module.exports = router;