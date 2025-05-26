let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Define the schema for the assignments
const assignmentSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: String,
    date: String,
    nombre: Number,
    department: String,
    termine: Boolean
});


module.exports = mongoose.model('Assignment', assignmentSchema);