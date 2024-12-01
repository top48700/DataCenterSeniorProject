const User = require('../../Schema_Setting_user/models/userModel');
const Admin = require('../models/adminmodels');

exports.adminDashboard = async (req, res) => {
    console.log('Admin Dashboard Access');
    console.log('Session:', req.session);
    try {
        const users = await User.find().sort({ createdAt: -1 }).limit(10);
        const totalUsers = await User.countDocuments();
        
        const verificationCounts = await User.aggregate([
            {
                $project: {
                    isFullyVerified: {
                        $eq: [{ $size: { $filter: { input: "$verificationSteps", as: "step", cond: { $eq: ["$$step.isVerified", false] } } } }, 0]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    verifiedCount: { $sum: { $cond: ["$isFullyVerified", 1, 0] } },
                    unverifiedCount: { $sum: { $cond: ["$isFullyVerified", 0, 1] } }
                }
            }
        ]);

        const { verifiedCount, unverifiedCount } = verificationCounts[0] || { verifiedCount: 0, unverifiedCount: 0 };

        const verificationStepCounts = await User.aggregate([
            { $unwind: "$verificationSteps" },
            { $group: {
                _id: "$verificationSteps.stepName",
                count: { $sum: { $cond: ["$verificationSteps.isVerified", 1, 0] } }
            }}
        ]);

        console.log('Verification Counts:', { verifiedCount, unverifiedCount });
        console.log('Verification Step Counts:', verificationStepCounts);

        res.render('admin_dashboard', { 
            users,
            verifiedCount,
            unverifiedCount,
            totalUsers,
            verificationStepCounts
        });
    } catch (error) {
        console.error('Server Error during dashboard render:', error);
        res.status(500).send('Server Error');
    }
};

exports.adminNew = async (req, res) => {
    console.log('Admin New verification type Page: Access');
    console.log('Session:', req.session);
    try {
        res.render('newVerificationType');
    } catch (error) {
        console.error('Server Error during dashboard render:', error);
        res.status(500).send('Server Error');
    }
};