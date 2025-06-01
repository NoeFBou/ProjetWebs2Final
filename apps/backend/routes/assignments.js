// Définition des routes relatives aux assignments

const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const authMiddleware = require('../secu/auth');
const mongoose = require('mongoose');

router.get('/my-assignments', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleware
        const isAdmin = req.user.isAdmin;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let sortCriteria = {};
        if (req.query.sortField && req.query.sortOrder) {
            sortCriteria[req.query.sortField] = parseInt(req.query.sortOrder);
        } else {
            sortCriteria = { dateDeRendu: -1 }; // Default sort
        }

        let queryCriteria = {};
        if (isAdmin) { // Professor sees assignments they created
            queryCriteria = { 'professeur.idProf': new mongoose.Types.ObjectId(userId) };
        } else { // Student sees assignments they are assigned to
            queryCriteria = { 'eleve.idEleve': new mongoose.Types.ObjectId(userId) };
        }

        const assignmentsQuery = Assignment.find(queryCriteria)
            .populate('professeur.idProf', 'nom prenom email profilePicture') // Populate for full prof object
            .populate('eleve.idEleve', 'nom prenom email profilePicture')     // Populate for full eleve object
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit);

        const assignments = await assignmentsQuery.lean(); // Use lean for plain JS objects

        // Manual population if using lean and populate doesn't give nested profilePicture directly
        // This step is often needed if the populate path is tricky or you want more control
        const populatedAssignments = assignments.map(assign => {
            return {
                ...assign,
                professeur: {
                    idProf: assign.professeur.idProf._id, // or assign.professeur.idProf if already an ID string
                    nomProf: assign.professeur.idProf.nom ? `${assign.professeur.idProf.prenom} ${assign.professeur.idProf.nom}` : assign.professeur.nomProf,
                    profilePicture: assign.professeur.idProf.profilePicture
                },
                eleve: {
                    idEleve: assign.eleve.idEleve._id,
                    nomEleve: assign.eleve.idEleve.nom ? `${assign.eleve.idEleve.prenom} ${assign.eleve.idEleve.nom}` : assign.eleve.nomEleve,
                    profilePicture: assign.eleve.idEleve.profilePicture
                }
            };
        });


        const totalAssignments = await Assignment.countDocuments(queryCriteria);

        res.json({
            assignments: populatedAssignments,
            totalPages: Math.ceil(totalAssignments / limit),
            currentPage: page,
            totalItems: totalAssignments
        });

    } catch (error) {
        console.error("Error fetching 'my assignments':", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération de vos assignments." });
    }
});

router.get('/distinct/tags', async (req, res) => {
    try {
        const tags = await Assignment.distinct('tags');
        res.json(tags.filter(tag => tag !== null && tag !== ''));
    } catch (error) { res.status(500).json({ error: 'Erreur serveur' }); }
});

router.get('/distinct/matieres', async (req, res) => {
    try {
        const matieres = await Assignment.distinct('matiere');
        res.json(matieres.filter(m => m !== null && m !== ''));
    } catch (error) { res.status(500).json({ error: 'Erreur serveur' }); }
});


router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortField = req.query.sortField || 'dateDeRendu';
        const sortOrder = parseInt(req.query.sortOrder) || -1;

        const {
            nom,
            dateDeRenduStart, dateDeRenduEnd,
            selectedTags,
            minNote, maxNote,
            locked,
            selectedMatieres,
            selectedProfesseurIds,
            selectedEleveIds,
            selectedStatuts,
            exerciceKeywords
        } = req.query;

        const filterQuery = {};
        if (nom) filterQuery.nom = { $regex: nom, $options: 'i' };

        if (dateDeRenduStart && dateDeRenduEnd) {
            filterQuery.dateDeRendu = {
                $gte: new Date(dateDeRenduStart),
                $lte: new Date(dateDeRenduEnd)
            };
        } else if (dateDeRenduStart) {
            filterQuery.dateDeRendu = { $gte: new Date(dateDeRenduStart) };
        } else if (dateDeRenduEnd) {
            filterQuery.dateDeRendu = { $lte: new Date(dateDeRenduEnd) };
        }

        if (selectedTags) filterQuery.tags = { $in: selectedTags.split(',') };

        if (minNote || maxNote) {
            filterQuery.note = {};
            if (minNote) filterQuery.note.$gte = parseFloat(minNote);
            if (maxNote) filterQuery.note.$lte = parseFloat(maxNote);
        }

        if (locked !== undefined && locked !== 'null' && locked !== '') {
            filterQuery.locked = (locked === 'true');
        }

        if (selectedMatieres) filterQuery.matiere = { $in: selectedMatieres.split(',') };

        if (selectedProfesseurIds) {
            filterQuery['professeur.idProf'] = {
                $in: selectedProfesseurIds.split(',').map(id => new mongoose.Types.ObjectId(id))
            };
        }
        if (selectedEleveIds) {
            filterQuery['eleve.idEleve'] = {
                $in: selectedEleveIds.split(',').map(id => new mongoose.Types.ObjectId(id))
            };
        }
        if (selectedStatuts) filterQuery.statut = { $in: selectedStatuts.split(',') };

        if (exerciceKeywords) {
            //un des mots
            const keywordsArray = exerciceKeywords.split(',').map(kw => new RegExp(kw.trim(), 'i'));
            //filterQuery.exercice = { $in: keywordsArray };
            //tout
            filterQuery.$and = exerciceKeywords.split(',').map(kw => ({ exercice: { $regex: kw.trim(), $options: 'i' } }));
        }

        const skip = (page - 1) * limit;
        let sortCriteria = {};
        sortCriteria[sortField] = sortOrder;

        const aggregationPipeline = [
            { $match: filterQuery },
            { $sort: sortCriteria },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "users",
                    localField: "professeur.idProf",
                    foreignField: "_id",
                    as: "professeurDetailsArr"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "eleve.idEleve",
                    foreignField: "_id",
                    as: "eleveDetailsArr"
                }
            },
            { $unwind: { path: "$professeurDetailsArr", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$eleveDetailsArr", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    nom: 1, matiere: 1, exercice: 1, note: 1, tags: 1, statut: 1,
                    dateDeRendu: 1, visible: 1, locked: 1,
                    "professeur.idProf": 1,
                    "professeur.nomProf": 1,
                    "eleve.idEleve": 1,
                    "eleve.nomEleve": 1,
                    "professeur.profilePicture": "$professeurDetailsArr.profilePicture",
                    "eleve.profilePicture": "$eleveDetailsArr.profilePicture",
                    // "professeur.nomProfFresh": { $concat: ["$professeurDetailsArr.prenom", " ", "$professeurDetailsArr.nom"] },
                    // "eleve.nomEleveFresh": { $concat: ["$eleveDetailsArr.prenom", " ", "$eleveDetailsArr.nom"] },
                }
            }
        ];

        const assignments = await Assignment.aggregate(aggregationPipeline);
        const totalAssignments = await Assignment.countDocuments(filterQuery);
        res.json({
            assignments,
            totalPages: Math.ceil(totalAssignments / limit),
            currentPage: page,
            totalItems: totalAssignments
        });
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