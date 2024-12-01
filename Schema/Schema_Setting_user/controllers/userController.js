// Schema/Schema_Setting_user/controllers/userController.js
const User = require('../models/userModel');

exports.getAllUsers = async (req, res) => {
    try {
        if (req.session.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const users = await User.find({}, 'username email role createdAt').lean();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};