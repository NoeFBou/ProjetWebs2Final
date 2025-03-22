let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const assignmentSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: String,
    date: String,
    nombre: Number,
    department: String,
    termine: Boolean
});

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
module.exports = mongoose.model('Assignment', assignmentSchema);