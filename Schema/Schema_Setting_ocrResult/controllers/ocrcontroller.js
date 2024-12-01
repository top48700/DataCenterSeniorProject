// ocrcontroller.js

const { processImage } = require("../service/ocrService");
const OCRResult = require("../models/ocrResultModel");
const User = require("../../Schema_Setting_user/models/userModel");
const fs = require("fs");
const path = require("path");

exports.uploadImage = async (req, res) => {
  try {
    console.log("Entering uploadImage controller");

    if (!req.file) {
      console.log("No image file uploaded.");
      return res.status(400).render("error", { message: "No image file uploaded." });
    }

    console.log("Image file uploaded:", req.file.originalname);

    if (!req.session || !req.session.username) {
      console.log("Invalid session or username:", req.session);
      return res.status(400).render("error", { message: "Invalid session or username." });
    }

    const user = await User.findOne({ username: req.session.username });

    if (!user) {
      console.log("User not found:", req.session.username);
      return res.status(404).render("error", { message: "User not found." });
    }

    console.log("User found:", user.username);

    const imagePath = path.resolve(__dirname, '../../../uploads', req.file.filename);    console.log(`Processing image at path: ${imagePath}`);
    console.log(`Processing image at path: ${imagePath}`);

    const text = await processImage(imagePath, req.file.filename);
    console.log("OCR text extracted:", text);

    const result = await OCRResult.create({
      filename: req.file.originalname,
      text,
      user: user._id // Set the user field to the ID of the user who uploaded the image
    });
    console.log("OCR result saved:", result);

    // Update the user document to reference the OCR result
    await User.findByIdAndUpdate(user._id, { $push: { ocrResults: result._id } });

    fs.unlinkSync(imagePath);
    console.log("Image file removed:", imagePath);

    res.redirect("/showdata");
  } catch (error) {
    console.error("OCR Processing Error:", error);
    res.status(500).render("error", { message: "Error processing image." });
  }
};


exports.showdata = async (req, res) => {
  try {
    const results = await OCRResult.find()
      .populate("user", "username")
      .sort({ timestamp: -1 });

    res.render("showdata", { results }); // Ensure this view exists
  } catch (error) {
    res.status(500).render("error", { message: "Error fetching data." });
  }
};
