const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

// Set up nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "projectce123456@gmail.com",
    pass: "gwmrvodxqlwlslbs",
  },
});

function sendVerificationEmail(email, code) {
  const templatePath = path.join(__dirname,"sentcode.ejs");

  ejs.renderFile(templatePath, { code: code }, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    const mailOptions = {
      from: "projectCR <projectce123456@gmail.com>",
      to: email,
      subject: "Account Verification",
      html: data,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  });
}

module.exports = { sendVerificationEmail };
