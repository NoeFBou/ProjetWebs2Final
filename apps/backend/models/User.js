const mongoose = require('mongoose');

// Define the schema for the users
const userSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, unique: true, required: true }, //
    password: { type: String, required: true }, //
    isAdmin: { type: Boolean, default: false } // true for teacher, false for student
});

module.exports = mongoose.model('User', userSchema);
