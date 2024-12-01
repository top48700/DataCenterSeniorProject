const mongoose = require("mongoose");

const ocrResultSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
});
module.exports = mongoose.model("OCRResult", ocrResultSchema);
