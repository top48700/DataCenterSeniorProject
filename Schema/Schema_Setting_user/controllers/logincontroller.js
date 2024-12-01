const User = require("../models/userModel");
const Admin = require("../../Schema_setting_admin/models/adminmodels"); // Adjust path according to your project structure

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Login attempt for username:", username);

        let user = await User.findOne({ username });
        let isAdmin = false;

        if (!user) {
            console.log("User not found in regular users, checking admin...");
            // If no user is found, search in Admin
            user = await Admin.findOne({ username });
            if (user) {
                isAdmin = true;
                console.log("Admin found:", user);
            }
        } else {
            console.log("User found:", user);
        }

        if (!user || user.password !== password) {  // Comparing plain text passwords (consider bcrypt for security)
            console.log("Invalid username or password.");
            return res.render("login", { error: "Invalid username or password." });
        }

        if (user.currentSessionID) {
            console.log("Destroying previous session for user:", user.currentSessionID);
            req.sessionStore.destroy(user.currentSessionID, (err) => {
                if (err) {
                    console.error("Error destroying previous session:", err);
                } else {
                    console.log("Previous session destroyed successfully.");
                }
            });
            req.app.locals.io.to(user.currentSessionID).emit('forcedLogout', 'You have been logged out due to another login.');
        }

        req.session.regenerate(async (err) => {
            if (err) {
                console.error("Error regenerating session:", err);
                return res.render("login", { error: "Error logging in user." });
            }

            console.log("Session regenerated successfully. Setting session variables...");
            req.session.username = username;
            req.session.phoneNumber = user.phoneNum;
            req.session.userID = user._id.toString();
            req.session.email = user.email;
            req.session.role = isAdmin ? 'admin' : 'user';
            console.log("Session data:", req.session);

            if (isAdmin) {
                // Set admin-specific session variables
                req.session.adminId = user._id.toString();
                req.session.isAdmin = true;
            }
            if (!isAdmin) {
                // Define the order of verification steps for regular users
                const verificationOrder = ['email', 'phone'];

                // Find the first unverified step in the defined order
                const pendingVerification = verificationOrder.find(stepName => {
                    const step = user.verificationSteps.find(s => s.stepName === stepName);
                    console.log(`Checking verification for step: ${stepName}`, step);
                    return step && !step.isVerified;
                });

                if (pendingVerification) {
                    console.log("Pending verification found:", pendingVerification);
                    req.session.isVerified = false;
                    req.session.verificationMethod = pendingVerification;
                    return res.redirect(`/verify/${pendingVerification}`);
                }
            }

            user.currentSessionID = req.sessionID;
            user.isLoggedIn = true;
            await user.save();
            console.log("User session updated in database:", user);

            req.session.isVerified = true;

            // Role-based redirection
            if (isAdmin) {
                console.log("Redirecting to admin dashboard...");
                return res.redirect("/admin/admin_dashboard");
            } else {
                console.log("Redirecting to user dashboard...");
                return res.redirect("/dashboard");
            }
        });
    } catch (err) {
        console.error("Error logging in user:", err);
        res.render("login", { error: "Error logging in user." });
    }
};
