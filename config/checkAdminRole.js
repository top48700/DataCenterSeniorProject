// config/checkAdminRole.js
module.exports = (req, res, next) => {
    if (req.session.role === 'admin') {
        next();
    } else {
        res.status(403).send('Access denied. Admin role required.');
    }
};