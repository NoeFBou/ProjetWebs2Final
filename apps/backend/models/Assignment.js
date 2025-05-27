let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Define the schema for the assignments
const assignmentSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    matiere: { type: String, required: true },
    exercice: { type: String },
    note: { type: Number, min: 0, max: 20 },
    tags: [{ type: String }],
    statut: {
        type: String,
        required: true,
        enum: ['en cours', 'terminé', 'en attente']
    },
    dateDeRendu: { type: Date, required: true },
    visible: { type: Boolean, default: true },
    locked: { type: Boolean, default: false },
    professeur: {
        idProf: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        nomProf: { type: String, required: true }
    },
    eleve: {
        idEleve: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        nomEleve: { type: String, required: true }
    }
});



module.exports = mongoose.model('Assignment', assignmentSchema);