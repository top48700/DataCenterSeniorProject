const express = require("express");
const ocrController = require("../controllers/ocrcontroller");
const upload = require("../multer/multer");

const router = express.Router();

router.post('/upload', upload.single('image'), ocrController.uploadImage);
router.get('/showdata', ocrController.showdata);
router.get('/ocr', (req, res) => 
    res.render('ocr')
);

module.exports = router;
