const User = require("../models/userModel");

exports.logout = (req, res) => {
  const userId = req.session.userID;
  req.session.destroy(async (err) => {
    if (err) {
      console.log("Error logging out : ", err);
      return res.status(500).json({ success: false, message: "Error logging out." });
    }

    if (userId) {
      try {
        // Update the user's isLoggedIn status
        await User.findByIdAndUpdate(userId, { isLoggedIn: false });
      } catch (updateErr) {
        console.error("Error updating user logout status:", updateErr);
      }
    }

    res.redirect("/");
  });
};
