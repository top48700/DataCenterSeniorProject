const User = require('../Schema/Schema_Setting_user/models/userModel');

const checkAuthentication = async (req, res, next) => {
    if (req.session.userID) {
        const user = await User.findById(req.session.userID);
        if (user) {
            req.user = user;
            return next();
        }
    }
    res.status(401).render('error', { message: 'Unauthorized' });
};

module.exports = checkAuthentication;
