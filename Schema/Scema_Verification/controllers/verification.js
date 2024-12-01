// verification.js
const crypto = require("crypto");
const User = require('../../Schema_Setting_user/models/userModel');
const { VerificationCode } = require('../../Schema_Setting_Verification/models/Verification_Setting.models');

// Define verifyStep function
async function verifyStep(userId, stepName) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const step = user.verificationSteps.find(step => step.stepName === stepName);
  if (!step) {
    throw new Error('Verification step not found');
  }
  step.isVerified = true;
  await user.save();
  return user;
}

// Generate a random verification code
function generateRandomCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Handle OTP verification
exports.verifyCode = async (req, res) => {
  try {
    const { method, value, code } = req.body;

    // Validate input
    if (!['email', 'phone'].includes(method) || !value || !code) {
      return res.status(400).json({ success: false, message: "Invalid input provided." });
    }

    // Find the user by phone or email
    const user = await User.findOne({ [method === 'email' ? 'email' : 'phoneNum']: value });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Find valid verification code
    const validCode = await VerificationCode.findOne({
      "type.value": value,
      "code": code,
      "type.type_verify": method,
      "status": false,
    });

    if (validCode) {
      // Mark code as used
      validCode.status = true;
      await validCode.save();

      // Mark step as verified and get updated user
      const updatedUser = await verifyStep(user._id, method);

      // Check if both email and phone are verified
      const isFullyVerified = updatedUser.verificationSteps.every(step => step.isVerified);

      if (isFullyVerified) {
        // Update user's login status
        updatedUser.isLoggedIn = true;
        await updatedUser.save();

        // Create session
        req.session.userID = updatedUser._id.toString();
        req.session.username = updatedUser.username;
        req.session.user = updatedUser;

        return res.status(200).json({ success: true, message: "Verification successful. Redirecting to dashboard.", redirect: "/dashboard" });
      } else {
        const nextStep = updatedUser.verificationSteps.find(step => !step.isVerified);
        // return res.status(200).json({ success: true, message: `${method} verified. Please complete ${nextStep.stepName} verification.`, redirect: `/verify/${nextStep.stepName}` });
        return res.redirect(`/verify/${nextStep.stepName}`);
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code." });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ success: false, message: "An error occurred during verification.", error: error.message });
  }
};

exports.GenarateCode = async (req, res) => {
  try {
    const { method, value } = req.body;

    // Validate input
    if (!['email', 'phone'].includes(method) || !value) {
      return res.status(400).json({ success: false, message: 'Invalid input provided' });
    }

    // Delete the latest verification code for the user (if exists)
    await VerificationCode.deleteMany({ 
      'type.type_verify': method, 
      'type.value': value 
    });

    // Generate a new verification code
    const verificationCode = new VerificationCode({
      type: {
        type_verify: method,
        value: value
      },
      code: generateRandomCode(),
      status: false,
      create: {
        datetime: Date.now(),
      }
    });

    await verificationCode.save();

    res.status(200).json({ success: true, message: 'Verification code generated' });
  } catch (error) {
    console.error("Error generating code:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Handle Resend OTP
exports.resendCode = async (req, res) => {
  try {
    const { method, value } = req.body;

    // Validate input
    if (!['email', 'phone'].includes(method) || !value) {
      return res.status(400).json({ success: false, message: 'Invalid input provided' });
    }

    // Find the user
    const user = await User.findOne({ [method === 'email' ? 'email' : 'phoneNum']: value });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Delete the existing verification code for the phone
    await VerificationCode.deleteOne({
      "type.value": value,
      "type.type_verify": method,
      "status": false,
    });

    // Generate new verification code
    const newVerificationCode = generateRandomCode();

    // Create a new verification code document
    const verificationCode = new VerificationCode({
      type: { type_verify: method, value },
      code: newVerificationCode,
      status: false,
      create: { datetime: Date.now() }
    });

    await verificationCode.save();

    // Log the new verification code
    console.log("New Verification Code:", verificationCode);

    res.status(200).json({ success: true, message: `New ${method} verification code sent.` });

    // Optionally, trigger email or SMS notification here
    if (method === 'email') {
      // Send email logic
    } else if (method === 'phone') {
      // Send SMS logic
    }
  } catch (error) {
    console.error("Resend Code Error:", error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
