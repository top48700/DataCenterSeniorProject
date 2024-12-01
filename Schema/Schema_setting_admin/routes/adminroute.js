const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const authAdmin = require('../middleware/authAdmin');

router.get('/admin_dashboard', authAdmin, adminController.adminDashboard);
router.get('/newVerificationType', authAdmin, adminController.adminNew);

module.exports = router;