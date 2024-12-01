const { User } = require("../../Schema_Setting_Verification/models/Verification_Setting.models");


exports.Dashboard = async (req, res) => {
  try {
    if (!req.session || !req.session.isVerified) {
      console.log("User is not authenticated, redirecting to login");
      return res.redirect('/login');
    }

    const user = await User.findOne({ _id: req.session.userID });
    if (!user) {
      console.log("User not found in database");
      return res.redirect("/verify");
    }

    res.render("dashboard", { username: req.session.username, email: user.email });
  } catch (err) {
    console.error("Error accessing dashboard:", err);
    res.redirect("/login");
  }
};
