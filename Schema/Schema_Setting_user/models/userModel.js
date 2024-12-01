const mongoose = require("mongoose");

const verificationSettingStepSchema = new mongoose.Schema({
  stepName: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  value: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: [/.+@.+..+/, "Please enter a valid email address"] },
  phoneNum: { type: String, unique: true, sparse: true },
  role: {type: String, default: 'user'},
  personalInfo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PersonalInfo'
  }],
  ocrResults: [{
    filename: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  verificationSteps: [verificationSettingStepSchema],
  currentSessionID: { type: String, default: null },
  isLoggedIn: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.index({ phoneNum: 1 });

module.exports = mongoose.model("User", userSchema);