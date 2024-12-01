const mongoose = require("mongoose");

const verificationCodeSchema = new mongoose.Schema({
  type: {
    type_verify: { type: String, required: true },
    value: { type: String, required: true, unique: true } 
  },
  code: { type: String, required: true },
  status: { type: Boolean, default: false },
  create: {
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status' },
    datetime: { type: Date, default: Date.now },
  },
});

verificationCodeSchema.index({ "type.value": 1 }, { unique: true }); 

const VerificationCode = mongoose.model("VerificationCode", verificationCodeSchema);

module.exports = { VerificationCode };
