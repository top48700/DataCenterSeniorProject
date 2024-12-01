const crypto = require("crypto");
const User = require("../models/userModel");
const { VerificationCode } = require("../../Schema_Setting_Verification/models/Verification_Setting.models");
const { sendVerificationEmail } = require("../../Schema_Setting_Verification/service/emailService");

exports.register = async (req, res) => {
  const { user, email, password, phoneNum } = req.body;

  if (!email) {
    return res.render("register", { error: "Email is required." });
  }

  try {
    // Check if the email or username already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.render("register", { error: "This email is already registered." });
    }

    const existingUserByUsername = await User.findOne({ username: user.toLowerCase() });
    if (existingUserByUsername) {
      return res.render("register", { error: "This username is already taken." });
    }

    // Generate email verification code
    const emailVerificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const newEmailVerificationCode = new VerificationCode({
      type: { type_verify: 'email', value: email },
      code: emailVerificationCode,
      status: false,
    });

    await newEmailVerificationCode.save();

    // Create a new user and add initial verification steps
    const newUser = new User({
      username: user,
      password: password,
      email: email,
      phoneNum: phoneNum,
      role: 'user',
      verificationSteps: [
        { stepName: 'email', value: email, isVerified: false },
        { stepName: 'phone', value: phoneNum, isVerified: false }
      ], 
      currentSessionID: req.sessionID,
      isLoggedIn: true 
    });

    await newUser.save();
    await sendVerificationEmail(newUser.email, emailVerificationCode);

    // Set session variables
    req.session.email = newUser.email;
    req.session.phoneNumber = newUser.phoneNum;
    req.session.userID = newUser._id.toString();
    req.session.isVerified = false;
    req.session.verificationMethod = 'email';
    req.session.user = newUser;

    console.log("User ID set in session after registration:", req.session.userID);

    res.render("verify", { user: newUser, status: "Verification code sent to your email." });
  } catch (err) {
    console.error("Error registering user:", err);
    res.render("register", { error: "Error registering user." });
  }
};

