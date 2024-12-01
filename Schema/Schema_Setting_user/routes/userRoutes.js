// Schema/Schema_Setting_user/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const loginController = require('../controllers/logincontroller');
const registerController = require('../controllers/registercontrollers');
const logoutController = require('../controllers/logoutcontroller');
const checkAuthentication = require('../../../config/checkAuthentication');
const checkAdminRole = require('../../../config/checkAdminRole');  // เพิ่ม middleware ใหม่
const authAdmin = require('../../../Schema/Schema_setting_admin/middleware/authAdmin');
const adminController = require('../../Schema_setting_admin/Controllers/adminController')

router.get("/dashboard", checkAuthentication, (req, res) => {
    console.log("Rendering dashboard for:", req.session.username);
    res.render("dashboard", { username: req.session.username, email: req.session.email });
});
// -------------------------------------------------------------------------------------------------
router.get("/admin/dashboard",authAdmin,checkAdminRole, (req, res) => {
    console.log("Rendering admin dashboard for:", req.session.username);
    res.render("admin_dashboard",adminController.adminDashboard );
});

router.get("/newtype", checkAuthentication, (req, res) => {
    console.log("Rendering New Verification type page for: ", req.session.username)
    res.render("newVerificationType")
})

router.get('/register', (req, res) => { res.render("register"); });
router.post('/register', registerController.register);

router.get('/login', (req, res) => { res.render("login"); });
router.post('/login', loginController.login);
router.get('/logout', logoutController.logout);

module.exports = router;
