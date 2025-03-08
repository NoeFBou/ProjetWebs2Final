var mongoose = require('mongoose');

var AssignmentSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    stock_industry: String,
    stock_sector: String,
    stock_market_cap: String,
    department: String,
    address: String
});


mongoose.model('Assignment', AssignmentSchema);

module.exports = mongoose.model('Assignment');