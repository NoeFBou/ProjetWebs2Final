const mongoose = require('mongoose');

// Define the schema for the users
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
