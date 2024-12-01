const User = require('../../Schema_Setting_user/models/userModel');

const addVerificationStep = async (userId, stepName, value) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  user.verificationSteps.push({ stepName, value });
  await user.save();
};

const verifyStep = async (userId, stepName) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const step = user.verificationSteps.find(step => step.stepName === stepName);
  if (step) {
    step.isVerified = true;
    await user.save();
  } else {
    throw new Error('Verification step not found');
  }
};

module.exports = { addVerificationStep, verifyStep };
