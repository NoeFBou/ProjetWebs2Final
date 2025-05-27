// Définition des routes relatives aux assignments

const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// Récupérer la liste des assignments avec pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const assignments = await Assignment.find()
            // .populate('professeur.idProf', 'nom prenom email') // Optionally populate more user details
            // .populate('eleve.idEleve', 'nom prenom email')
            .skip(skip)
            .limit(limit);
        res.json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des assignments" });
    }
});

// Récupérer un assignment par son ID
router.get('/:id', async (req, res) => {
    try {
        // Ensure req.params.id is a valid MongoDB ObjectId if needed, or Mongoose handles it
        const assignment = await Assignment.findById(req.params.id);
        // .populate('professeur.idProf') // Optionally populate
        // .populate('eleve.idEleve');
        if (!assignment) {
            return res.status(404).json({ message: "Assignment non trouvé" });
        }
        res.json(assignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Ajouter un nouvel assignment
router.post('/', async (req, res) => {
    try {
        // Destructure all new fields from req.body
        const { nom, matiere, exercice, note, tags, statut, dateDeRendu, visible, locked, professeur, eleve } = req.body;

        // Basic validation (add more as needed)
        if (!nom || !matiere || !statut || !dateDeRendu || !professeur || !eleve ) {
            return res.status(400).json({ error: "Champs requis manquants." });
        }
        if (!professeur.idProf || !professeur.nomProf || !eleve.idEleve || !eleve.nomEleve) {
            return res.status(400).json({ error: "Informations professeur ou élève manquantes." });
        }

        const newAssignment = new Assignment({
            nom, matiere, exercice, note, tags, statut,
            dateDeRendu: new Date(dateDeRendu), // Ensure it's a Date object
            visible, locked,
            professeur: {
                idProf: professeur.idProf,
                nomProf: professeur.nomProf
            },
            eleve: {
                idEleve: eleve.idEleve,
                nomEleve: eleve.nomEleve
            }
        });
        await newAssignment.save();
        res.status(201).json(newAssignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'ajout de l'assignment" });
    }
});

// Modifier un assignment existant
router.put('/:id', async (req, res) => {
    try {
        const assignmentId = req.params.id;
        // Ensure req.body only contains fields that can be updated
        // For example, you might not want to update professeur/eleve details this way
        // or handle it specifically.
        if (req.body.dateDeRendu) {
            req.body.dateDeRendu = new Date(req.body.dateDeRendu);
        }

        const updatedAssignment = await Assignment.findByIdAndUpdate(
            assignmentId,
            req.body,
            { new: true, runValidators: true } // new: true returns the updated doc, runValidators ensures schema rules are checked
        );
        if (!updatedAssignment) {
            return res.status(404).json({ message: "Assignment non trouvé" });
        }
        res.json(updatedAssignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la modification de l'assignment" });
    }
});

// Supprimer un assignment
router.delete('/:id', async (req, res) => {
    try {
        const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
        if (!deletedAssignment) {
            return res.status(404).json({ message: "Assignment non trouvé" });
        }
        res.json({ message: "Assignment supprimé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;