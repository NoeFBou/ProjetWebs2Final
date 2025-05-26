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

        const assignments = await Assignment.find().skip(skip).limit(limit);
        res.json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des assignments" });
    }
});

// Récupérer un assignment par son ID
router.get('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ id: req.params.id });
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
        // Génération d'un identifiant unique via Date.now()
        req.body.id = Date.now();
        const newAssignment = new Assignment(req.body);
        await newAssignment.save();
        res.status(201).json(newAssignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'ajout de l'assignment" });
    }
});

// Modifier un assignment existant
router.put('/:id', async (req, res) => {
  //  console.log(req.body);
    try {
        const assignmentId = parseInt(req.params.id, 10);

        const updatedAssignment = await Assignment.findOneAndUpdate(
            { id: assignmentId },
            req.body,
            { new: true }
        );
       // console.log(updatedAssignment);
        if (!updatedAssignment) {
            return res.status(404).json({ message: "Assignment non trouvé" });
        }


       // console.log("test");
       // console.log(updatedAssignment);
        res.json(updatedAssignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Supprimer un assignment
router.delete('/:id', async (req, res) => {
    try {
        const deletedAssignment = await Assignment.findOneAndDelete({ id: req.params.id });
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