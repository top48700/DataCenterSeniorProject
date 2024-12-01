const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: [/.+@.+\..+/, "Please enter a valid email address"] },
    role: {type: String, default: 'admin'},
});
module.exports = mongoose.model("Admin", adminSchema);