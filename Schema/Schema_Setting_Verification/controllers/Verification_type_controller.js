const express = require('express');
const router = express.Router();
const User = require('../../Schema_Setting_user/models/userModel');

exports.newVerificationType = async (req, res) => {
    try {
        const { stepName } = req.body;
        const newStep = {
            stepName,
            isVerified: false,
            value: ""
        };

        // Update all users by pushing the new verification step
        await User.updateMany(
            {}, //{ role: 'user' }, select only role = user
            { $push: { verificationSteps: newStep } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.Getverify = async (req, res) => {
    const username = req.session.username;
    if (!username) {
        return res.redirect("/login");
    }
    console.log(`Rendering otpphone template. Username: ${username}`);
    res.render("newVerificationType");
};