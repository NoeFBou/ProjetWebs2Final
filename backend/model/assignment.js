let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const assignmentSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    stock_industry: String,
    stock_sector: String,
    stock_market_cap: String,
    department: String,
    address: String
});

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
module.exports = mongoose.model('Assignment', assignmentSchema);