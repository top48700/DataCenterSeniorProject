// ocrService.js

const Tesseract = require('tesseract.js');
const OCRResult = require('../models/ocrResultModel');
const path = require('path'); // Ensure path module is imported
const fs = require('fs');

exports.processImage = async (imagePath, filename) => {
  try {
    const fullPath = path.resolve(__dirname, '../../../uploads', filename);
    console.log("Full image path in service:", fullPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }

    const { data: { text } } = await Tesseract.recognize(fullPath, 'eng+tha');
    console.log(`OCR text for ${filename}:`, text);
    return text;
  } catch (error) {
    console.error("Error processing image with Tesseract.", error);
    throw new Error("Error processing image with Tesseract.");
  }
};
