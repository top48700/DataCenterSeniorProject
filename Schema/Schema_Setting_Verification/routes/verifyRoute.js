const express = require("express");
const router = express.Router();

router.get("/verify/:method", (req, res) => {
    const method = req.params.method;
    const email = req.session.email;
    const phoneNumber = req.session.phoneNumber;
    const username = req.session.username;
    let statusMessage = "";
    let template = "";

    switch (method) {
        case 'email':
            statusMessage = "Verification code sent to your email.";
            template = "verify";
            break;
        case 'phone':
            statusMessage = "Verification code sent to your phone.";
            template = "otpphone";
            break;
        default:
            return res.redirect("/");
    }

    console.log(`Rendering ${template} page for method: ${method}`);
    console.log(`Session Data: Email - ${email}, Phone - ${phoneNumber}, Username - ${username}`);

    res.render(template, { 
        method, 
        status: statusMessage, 
        user: {
            email, 
            phoneNumber, 
            username 
        }
    });
});

module.exports = router;
