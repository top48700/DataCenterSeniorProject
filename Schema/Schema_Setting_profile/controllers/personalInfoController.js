const User = require('../../Schema_Setting_user/models/userModel')
const PersonalInfo = require('../models/Profile_Setting_models');

exports.showForm = async (req, res) => {
    try {
        // Assume `req.user._id` contains the user ID (adapt based on your authentication setup)
        const userId = req.user ? req.user._id : null;
        console.log('User ID:', userId);

        // Check if there is already an existing profile for the user
        const existingProfile = await PersonalInfo.findOne({ create_by: userId });
        console.log('Existing profile:', existingProfile);

        if (existingProfile) {
            console.log('Existing profile found, redirecting to profile page');
            return res.redirect(`/profile/${existingProfile._id}`);
        }

        console.log("Rendering form view");
        res.render('form');
    } catch (error) {
        console.error('Error checking for existing profile:', error);
        res.status(500).send(error);
    }
};

exports.submitForm = async (req, res) => {
    try {
        console.log('Form data received:', req.body);

        // Assume `req.user._id` contains the user ID (adapt based on your authentication setup)
        const userId = req.user ? req.user._id : null;
        console.log('User ID:', userId);

        // Create and save the new profile with the user ID
        const personalInfo = new PersonalInfo({
            ...req.body,
            create_by: userId
        });
        console.log('Creating new PersonalInfo with data:', personalInfo);

        await personalInfo.save();
        console.log('New personalInfo saved:', personalInfo);
        console.log('New personalInfo ID:', personalInfo._id);

        // Now, find the user and push the personalInfo ID to the user's personalInfo array
        const user = await User.findById(userId);
        if (user) {
            user.personalInfo.push(personalInfo._id);
            await user.save();
            console.log('PersonalInfo ID added to user:', user);
        } else {
            console.error('User not found:', userId);
        }

        res.redirect(`/profile/${personalInfo._id}`);
    } catch (error) {
        console.error('Error saving personalInfo:', error);
        res.status(500).send(error);
    }
};

exports.showProfile = async (req, res) => {
    try {
        console.log('Profile ID:', req.params.id);
        const personalInfo = await PersonalInfo.findById(req.params.id);
        console.log('Retrieved personalInfo:', personalInfo);

        if (!personalInfo) {
            console.error('Profile not found for ID:', req.params.id);
            return res.status(404).send('Profile not found');
        }

        console.log('Rendering profile view');
        res.render('profile', { personalInfo });
    } catch (error) {
        console.error('Error retrieving personalInfo:', error);
        res.status(500).send(error);
    }
};

exports.showEditForm = async (req, res) => {
    try {
        console.log('Edit Profile ID:', req.params.id);
        const personalInfo = await PersonalInfo.findById(req.params.id);
        console.log('Retrieved personalInfo for edit:', personalInfo);

        if (!personalInfo) {
            console.error('Profile not found for ID:', req.params.id);
            return res.status(404).send('Profile not found');
        }

        console.log('Rendering editProfile view');
        res.render('editProfile', { personalInfo });
    } catch (error) {
        console.error('Error retrieving personalInfo for edit:', error);
        res.status(500).send(error);
    }
};

exports.submitEditForm = async (req, res) => {
    try {
        console.log('Edit form data received:', req.body);
        const updatedPersonalInfo = await PersonalInfo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        console.log('Updated personalInfo:', updatedPersonalInfo);

        if (!updatedPersonalInfo) {
            console.error('Profile not found for ID:', req.params.id);
            return res.status(404).send('Profile not found');
        }

        console.log('Updated personalInfo ID:', updatedPersonalInfo._id);
        res.redirect(`/profile/${updatedPersonalInfo._id}`);
    } catch (error) {
        console.error('Error updating personalInfo:', error);
        res.status(500).send(error);
    }
};
