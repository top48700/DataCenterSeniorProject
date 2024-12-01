
const express = require("express");
const router = express.Router();
const personalInfoController = require('../controllers/personalInfoController');
const checkAuthentication = require('../../../config/checkAuthentication');
const multer = require('multer');

router.get('/form',checkAuthentication, personalInfoController.showForm);
router.post('/submit-form',checkAuthentication, personalInfoController.submitForm);
router.get('/profile/:id',checkAuthentication, personalInfoController.showProfile);
router.get('/profile/:id/edit',checkAuthentication, personalInfoController.showEditForm);
router.post('/profile/:id/edit',checkAuthentication, personalInfoController.submitEditForm);
module.exports = router;
