const crypto = require("crypto");
const User = require("../../Schema_Setting_user/models/userModel");
const { VerificationCode } = require("../models/Verification_Setting.models");
const { sendVerificationEmail } = require("../service/emailService");

const addVerificationStep = async (userId, stepName, value) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  user.verificationSteps.push({ stepName, value, isVerified: false });
  await user.save();
};

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
}

exports.verify = async (req, res) => {
  try {
    const { email, code, method } = req.body;

    if (!method) {
      return res.render("verify", { email, status: "Verification method is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("verify", { email, status: "User not found." });
    }

    const validCode = await VerificationCode.findOne({
      "type.value": email,
      "code": code,
      "type.type_verify": method,
      "status": false
    });

    if (validCode) {
      validCode.status = true;
      await validCode.save();

      // Verify the corresponding method (email or phone)
      await verifyStep(user._id, method);

      req.session.userID = user._id.toString();
      req.session.username = user.username;
      req.session.isVerified = method === 'email';  // Update based on the method
      req.session.status = true;

      req.session.regenerate(err => {
        if (err) {
          console.error("Session regenerate error:", err);
          return res.render("verify", { email, status: "An error occurred." });
        }

        req.session.userID = user._id.toString();
        req.session.username = user.username;
        req.session.isVerified = method === 'email';  // Update based on the method
        req.session.status = true;

        if (method === 'email') {
          // Redirect to phone verification after email is verified
          req.session.phoneNumber = user.phoneNum;
          return res.redirect("/verify/phone");
        } else if (method === 'phone') {
          // Redirect to the next step after phone verification
          return res.redirect("/dashboard"); // Replace with actual next step
        }
      });
    } else {
      return res.render("verify", { email: user.email, status: "Invalid or expired code." });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.render("verify", { email: "", status: "An error occurred during verification." });
  }
};


exports.Getverify = async (req, res) => {
  const email = req.session.email || "";
  if (!email) {
    return res.redirect("/login");
  }
  res.render("verify", { email: email, status: "OTP has been sent to your email." });
};

exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    await VerificationCode.deleteMany({ "type.value": email });

    const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const newVerificationCode = new VerificationCode({
      type: {
        type_verify: 'email',
        value: email
      },
      code: verificationCode,
      status: false,
      create: {
        by: null
      }
    });

    const savedVerificationCode = await newVerificationCode.save();

    const emailStep = user.verificationSteps.find(step => step.stepName === 'email');
    if (!emailStep) {
      user.verificationSteps.push({
        stepName: 'email',
        value: email,
        isVerified: false
      });
    } else {
      emailStep.value = email;
      emailStep.isVerified = false;
    }
    await user.save();

    await sendVerificationEmail(user.email, verificationCode);

    await addVerificationStep(user._id, 'email', email);

    res.json({ success: true });
  } catch (err) {
    console.log("Resend OTP error:", err);
    res.json({ success: false, message: "Error resending OTP." });
  }
};
