const crypto = require("crypto");
const User = require("../../Schema_Setting_user/models/userModel");
console.log("User model:", User);
const { VerificationCode } = require("../../Schema_Setting_Verification/models/Verification_Setting.models");
const { sendSMS } = require("../service/otpService");

const addVerificationStep = async (userId, stepName, value) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.verificationSteps.push({ stepName, value });
    await user.save();
};

const verifyStep = async (userId, stepName) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const step = user.verificationSteps.find(step => step.stepName === stepName);
    if (step) {
        step.isVerified = true;
        await user.save();
    } else {
        throw new Error('Verification step not found');
    }
};

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

exports.requestOTPPhone = async (req, res) => {
    console.log("requestOTPPhone function called");

    // Pull the phone number from session, set during registration
    const phoneNumber = req.session.phoneNumber;

    if (!req.session.userID) {
        return res.status(401).json({ error: "User not authenticated. Please log in." });
    }

    try {
        console.log("Searching for user with ID:", req.session.userID);
        const user = await User.findById(req.session.userID);
        console.log("Found user:", user);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const existingUser = await User.findOne({ phoneNum: phoneNumber });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            return res.status(400).json({ error: "Phone number already in use by another user." });
        }

        const otp = generateOTP();

        await VerificationCode.deleteMany({ 'type.value': phoneNumber, 'type.type_verify': 'phone' });

        const newVerificationCode = new VerificationCode({
            type: {
                type_verify: 'phone',
                value: phoneNumber
            },
            code: otp,
            status: false,
            create: {
                by: user._id
            }
        });

        await newVerificationCode.save();

        user.phoneNum = phoneNumber;

        if (Array.isArray(user.isverify)) {
            user.isverify = user.isverify.filter(vc => vc.type.type_verify !== 'phone');
        } else {
            user.isverify = [];
        }

        user.isverify.push({ type: newVerificationCode._id, type_Status: false, value: phoneNumber });

        await user.save();

        // await addVerificationStep(user._id, 'phone', phoneNumber);

        console.log(`OTP ${otp} would be sent to ${phoneNumber}`);

        res.status(200).json({ message: "OTP has been sent to your phone number." });
    } catch (err) {
        console.error("Error sending OTP:", err);
        res.status(500).json({ error: "Failed to send OTP" });
    }
};

exports.resendOTPPhone = async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        const user = await User.findOne({ phoneNum: phoneNumber });
        if (!user) {
            return res.status(404).json({ error: "Phone number not found" });
        }

        const existingUser = await User.findOne({ phoneNum: phoneNumber });
        if (existingUser && existingUser._id.toString() !== req.session.userID.toString()) {
            return res.status(400).json({ error: "Phone number already in use by another user." });
        }

        const latestVerificationCode = await VerificationCode.findOne({ "type.value": phoneNumber }).sort({ createdAt: -1 });

        if (latestVerificationCode) {
            const timeDiff = Date.now() - latestVerificationCode.createdAt;
            const resendThreshold = 30000;
            if (timeDiff < resendThreshold) {
                return res.status(429).json({ error: `Too many resend attempts. Please wait ${Math.ceil((resendThreshold - timeDiff) / 1000)} seconds.` });
            }

            await VerificationCode.findByIdAndDelete(latestVerificationCode._id);
        }

        const otp = generateOTP();

        const newVerificationCode = new VerificationCode({
            type: { type_verify: 'phone', value: phoneNumber },
            code: otp,
            status: false,
            expires: new Date(Date.now() + 3600000),
        });
        await newVerificationCode.save();
        if (!Array.isArray(user.isverify)) {
            user.isverify = [];
        } else {
            user.isverify = user.isverify.filter(vc => vc.type.toString() !== newVerificationCode._id.toString());
        }

        // Add the new verification entry
        user.isverify.push({ type: newVerificationCode._id, type_Status: false, value: phoneNumber });

        await user.save();

        res.status(200).json({ message: "OTP resent successfully" });
    } catch (err) {
        console.error("Error resending OTP:", err);
        res.status(500).json({ error: "Failed to resend OTP" });
    }
};

exports.verifyOTPPhone = async (req, res) => {
    const { phoneNumber, otpCode } = req.body;

    try {
        console.log(`Verifying OTP for phone number: ${phoneNumber}`);
        
        const latestOtp = await VerificationCode.findOne({ 'type.value': phoneNumber, 'type.type_verify': 'phone' }).sort({ createdAt: -1 });
        console.log('Latest OTP found:', latestOtp);
        
        if (!latestOtp || latestOtp.code !== otpCode) {
            console.log('Invalid OTP');
            return res.status(401).json({ error: "Invalid OTP" });
        }

        const user = await User.findOne({ phoneNum: phoneNumber });
        console.log('User found:', user);
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        if (!Array.isArray(user.verificationSteps)) {
            user.verificationSteps = [];
        }

        const verificationEntry = user.verificationSteps.find(step => step.stepName === 'phone');
        if (verificationEntry) {
            verificationEntry.isVerified = true;
            console.log('Verification step updated:', verificationEntry);
        } else {
            return res.status(404).json({ error: 'Phone verification step not found' });
        }

        // Update status in VerificationCode document to true after successful verification
        latestOtp.status = true;
        console.log('VerificationCode status before save:', latestOtp.status);
        
        await latestOtp.save();
        console.log('VerificationCode saved');
        
        // Save updated user document
        await user.save();
        console.log('User saved');

        req.session.isVerify = true;
        
        res.status(200).json({ message: "Verification successful" });
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
};


exports.Getverify = async (req, res) => {
    const username = req.session.username;
    const phoneNumber = req.session.phoneNumber;
    if (!username) {
        return res.redirect("/login");
    }
    console.log(`Rendering otpphone template. Username: ${username}, Phone: ${phoneNumber}`);
    res.render("otpphone", { 
        username: username, 
        phoneNumber: phoneNumber, 
        status: "Please enter the OTP sent to your phone." 
    });
};
