// routes/stats.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Needed for ObjectId if casting strings
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const authMiddleware = require('../secu/auth'); // Assuming you want to protect these routes


router.get('/assignments/status-counts', authMiddleware, async (req, res) => {
    try {
        const counts = await Assignment.aggregate([
            {
                $group: {
                    _id: '$statut', // Group by the 'statut' field
                    count: { $sum: 1 } // Count documents in each group
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the default _id field
                    status: '$_id', // Rename _id to status
                    count: 1
                }
            }
        ]);

        // Transform into the desired { "statusName": count } format
        const formattedCounts = counts.reduce((acc, curr) => {
            acc[curr.status] = curr.count;
            return acc;
        }, {});

        res.json(formattedCounts);
    } catch (error) {
        console.error("Error fetching assignment status counts:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get('/my-organization-chart', authMiddleware, async (req, res) => {
    try {
        const currentUserFromAuth = req.user; // Contient id, isAdmin, nom, prenom, profilePicture
        const currentUserId = new mongoose.Types.ObjectId(currentUserFromAuth.id);

        const rootNodeLabel = `${currentUserFromAuth.prenom} ${currentUserFromAuth.nom}`;
        const rootNode = {
            label: rootNodeLabel, // Ajout de la propriété label
            expanded: true,
            type: 'user',
            styleClass: currentUserFromAuth.isAdmin ? 'professeur-node current-user' : 'eleve-node current-user',
            data: {
                id: currentUserFromAuth.id,
                name: rootNodeLabel, // Peut être redondant mais utile pour le template
                title: currentUserFromAuth.isAdmin ? 'Professeur (Moi)' : 'Élève (Moi)',
                image: currentUserFromAuth.profilePicture ? `/uploads/profile-pictures/${currentUserFromAuth.profilePicture}` : null
            },
            children: []
        };

        if (currentUserFromAuth.isAdmin) { // Si l'utilisateur connecté est un professeur
            const assignmentsByProf = await Assignment.find({ 'professeur.idProf': currentUserId })
                .populate('eleve.idEleve', 'nom prenom profilePicture email') // Ajouter email pour plus d'infos si besoin
                .lean();

            const studentsMap = new Map();
            assignmentsByProf.forEach(assign => {
                if (assign.eleve && assign.eleve.idEleve && assign.eleve.idEleve._id) {
                    const studentDetails = assign.eleve.idEleve;
                    const studentIdStr = studentDetails._id.toString();
                    if (!studentsMap.has(studentIdStr)) {
                        studentsMap.set(studentIdStr, {
                            id: studentIdStr,
                            name: `${studentDetails.prenom} ${studentDetails.nom}`,
                            title: 'Élève',
                            image: studentDetails.profilePicture ? `/uploads/profile-pictures/${studentDetails.profilePicture}` : null,
                            assignments: []
                        });
                    }
                    studentsMap.get(studentIdStr).assignments.push({ name: assign.nom });
                }
            });

            studentsMap.forEach(student => {
                const studentNode = {
                    label: student.name, // Ajout de la propriété label
                    expanded: true, // Peut-être false par défaut pour les grands arbres
                    type: 'user',
                    styleClass: 'eleve-node',
                    data: { id: student.id, name: student.name, title: student.title, image: student.image },
                    children: student.assignments.map(assign => ({
                        label: assign.name, // Ajout de la propriété label
                        type: 'assignment',
                        styleClass: 'assignment-node',
                        data: { name: assign.name, title: 'Devoir' },
                        leaf: true // Indique que c'est une feuille, pas d'enfants
                    }))
                };
                rootNode.children.push(studentNode);
            });

        } else { // Si l'utilisateur connecté est un élève
            const assignmentsForStudent = await Assignment.find({ 'eleve.idEleve': currentUserId })
                .populate('professeur.idProf', 'nom prenom profilePicture email')
                .lean();

            const professorsMap = new Map();
            assignmentsForStudent.forEach(assign => {
                if (assign.professeur && assign.professeur.idProf && assign.professeur.idProf._id) {
                    const profDetails = assign.professeur.idProf;
                    const profIdStr = profDetails._id.toString();
                    if (!professorsMap.has(profIdStr)) {
                        professorsMap.set(profIdStr, {
                            id: profIdStr,
                            name: `${profDetails.prenom} ${profDetails.nom}`,
                            title: 'Professeur',
                            image: profDetails.profilePicture ? `/uploads/profile-pictures/${profDetails.profilePicture}` : null,
                            assignments: []
                        });
                    }
                    professorsMap.get(profIdStr).assignments.push({ name: assign.nom });
                }
            });

            professorsMap.forEach(prof => {
                const profNode = {
                    label: prof.name, // Ajout de la propriété label
                    expanded: true, // Peut-être false par défaut
                    type: 'user',
                    styleClass: 'professeur-node',
                    data: { id: prof.id, name: prof.name, title: prof.title, image: prof.image },
                    children: prof.assignments.map(assign => ({
                        label: assign.name, // Ajout de la propriété label
                        type: 'assignment',
                        styleClass: 'assignment-node',
                        data: { name: assign.name, title: 'Devoir' },
                        leaf: true
                    }))
                };
                rootNode.children.push(profNode);
            });
        }
        res.json([rootNode]);
    } catch (error) {
        console.error("Error fetching organization chart data:", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des données de l'organigramme." });
    }
});

// GET /api/stats/assignments/average-note-per-student
router.get('/assignments/average-note-per-student', authMiddleware, async (req, res) => {
    try {
        const averageNotes = await Assignment.aggregate([
            {
                $match: {
                    note: { $ne: null, $exists: true } // Only consider assignments with a note
                }
            },
            {
                $group: {
                    _id: '$eleve.idEleve', // Group by student ID
                    averageNote: { $avg: '$note' },
                    // Keep one instance of student details (assuming eleve.nomEleve is consistent)
                    nomEleve: { $first: '$eleve.nomEleve' }
                }
            },
            {
                $lookup: { // Optional: If nomEleve wasn't denormalized or to get more fresh details
                    from: 'users', // The name of the users collection
                    localField: '_id', // The _id from the $group stage (eleve.idEleve)
                    foreignField: '_id', // The _id in the users collection
                    as: 'studentDetails'
                }
            },
            {
                $unwind: { // Deconstruct the studentDetails array (if $lookup used)
                    path: '$studentDetails',
                    preserveNullAndEmptyArrays: true // Keep students even if lookup fails (though unlikely here)
                }
            },
            {
                $project: {
                    _id: 0,
                    studentId: '$_id',
                    // Use studentDetails from lookup if available, otherwise use denormalized name
                    studentNom: '$studentDetails.nom', // From User model
                    studentPrenom: '$studentDetails.prenom', // From User model
                    // studentFullName: '$nomEleve', // If you used the denormalized name
                    averageNote: { $round: ['$averageNote', 2] } // Round to 2 decimal places
                }
            },
            {
                $sort: { averageNote: -1 } // Optional: Sort by average note
            }
        ]);
        res.json(averageNotes);
    } catch (error) {
        console.error("Error fetching average notes per student:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get('/assignments/average-notes-trend-by-due-date', authMiddleware, async (req, res) => {
    try {
        const trend = await Assignment.aggregate([
            {
                $match: {
                    dateDeRendu: { $ne: null },
                    note: { $ne: null, $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$dateDeRendu' },
                        month: { $month: '$dateDeRendu' }
                    },
                    averageNote: { $avg: '$note' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $concat: [
                            { $toString: '$_id.year' },
                            "-",
                            { $cond: [ { $lt: [ "$_id.month", 10 ] }, { $concat: [ "0", { $toString: "$_id.month" } ] }, { $toString: "$_id.month" } ] }
                        ]
                    },
                    averageNote: { $round: ['$averageNote', 2] },
                    assignmentCount: '$count'
                }
            },
            { $sort: { date: 1 } }
        ]);
        res.json(trend);
    } catch (error) {
        console.error("Error fetching average notes trend by due date:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// GET /api/stats/assignments/count-per-professor
router.get('/assignments/count-per-professor', authMiddleware, async (req, res) => {
    try {
        const assignmentsPerProfessor = await Assignment.aggregate([
            {
                $group: {
                    _id: '$professeur.idProf',
                    assignmentCount: { $sum: 1 },
                    nomProf: { $first: '$professeur.nomProf' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'professorDetails'
                }
            },
            {
                $unwind: {
                    path: '$professorDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    professorId: '$_id',
                    professorNom: '$professorDetails.nom',
                    professorPrenom: '$professorDetails.prenom',
                    assignmentCount: 1
                }
            },
            {
                $sort: { assignmentCount: -1 }
            }
        ]);
        res.json(assignmentsPerProfessor);
    } catch (error) {
        console.error("Error fetching assignments per professor:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// GET /api/stats/assignments/by-date (for scatter plot)
router.get('/assignments/by-date', authMiddleware, async (req, res) => {
    try {
        const assignments = await Assignment.find({
            note: { $ne: null, $exists: true }, // Only assignments with notes for a meaningful scatter plot (note vs date)
            dateDeRendu: { $ne: null, $exists: true }
        }).select('nom dateDeRendu note -_id').lean(); // lean() for plain JS objects

        res.json(assignments.map(a => ({
            nom: a.nom,
            dateDeRendu: a.dateDeRendu, // Ensure this is in a format Chart.js time adapter can parse (ISO string is good)
            note: a.note
        })));
    } catch (error) {
        console.error("Error fetching assignments by date:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// GET /api/stats/assignments/count-per-matiere
router.get('/assignments/count-per-matiere', authMiddleware, async (req, res) => {
    try {
        const counts = await Assignment.aggregate([
            {
                $match: { matiere: { $ne: null, $exists: true, $ne: "" } } // Only consider assignments with a matiere
            },
            {
                $group: {
                    _id: '$matiere',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    matiere: '$_id',
                    count: 1
                }
            },
            {
                $sort: { count: -1 } // Optional
            }
        ]);
        res.json(counts);
    } catch (error) {
        console.error("Error fetching assignments count per matiere:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get('/assignments/trend-by-due-date', authMiddleware, async (req, res) => {
    try {
        const trend = await Assignment.aggregate([
            {
                $match: { dateDeRendu: { $ne: null } } // Seulement les assignments avec une date de rendu
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$dateDeRendu' },
                        month: { $month: '$dateDeRendu' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        // Concaténer pour former une chaîne "YYYY-MM"
                        $concat: [
                            { $toString: '$_id.year' },
                            "-",
                            // Ajouter un zéro pour les mois < 10
                            { $cond: [ { $lt: [ "$_id.month", 10 ] }, { $concat: [ "0", { $toString: "$_id.month" } ] }, { $toString: "$_id.month" } ] }
                        ]
                    },
                    count: 1
                }
            },
            { $sort: { date: 1 } } // Trier par date
        ]);
        res.json(trend);
    } catch (error) {
        console.error("Error fetching assignment trend by due date:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// GET /api/stats/assignments/notes-distribution
router.get('/assignments/notes-distribution', authMiddleware, async (req, res) => {
    try {
        const distribution = await Assignment.aggregate([
            {
                $match: { note: { $ne: null, $exists: true } } // Seulement les assignments notés
            },
            {
                $bucket: {
                    groupBy: "$note", // Le champ sur lequel baser les tranches
                    boundaries: [0, 5, 8, 10, 12, 14, 16, 18, 20.1], // Tranches: [0-5), [5-8), ..., [18-20] (20.1 pour inclure 20)
                    default: "Hors plage", // Pour les notes en dehors des limites (si possible)
                    output: {
                        count: { $sum: 1 }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    range: { // Formatter les libellés des tranches
                        $switch: {
                            branches: [
                                { case: { $eq: [ "$_id", 0 ] }, then: "0 - <5" },
                                { case: { $eq: [ "$_id", 5 ] }, then: "5 - <8" },
                                { case: { $eq: [ "$_id", 8 ] }, then: "8 - <10" },
                                { case: { $eq: [ "$_id", 10 ] }, then: "10 - <12" },
                                { case: { $eq: [ "$_id", 12 ] }, then: "12 - <14" },
                                { case: { $eq: [ "$_id", 14 ] }, then: "14 - <16" },
                                { case: { $eq: [ "$_id", 16 ] }, then: "16 - <18" },
                                { case: { $eq: [ "$_id", 18 ] }, then: "18 - 20" }
                            ],
                            default: "Autre"
                        }
                    },
                    count: 1
                }
            }
            // MongoDB ne garantit pas l'ordre des buckets, si besoin, triez côté client ou ajoutez une étape $sort basée sur un champ d'ordre
        ]);
        // Pour garantir l'ordre des tranches pour l'affichage, on peut le faire ici
        const predefinedOrder = ["0 - <5", "5 - <8", "8 - <10", "10 - <12", "12 - <14", "14 - <16", "16 - <18", "18 - 20"];
        const sortedDistribution = predefinedOrder.map(label => {
            const found = distribution.find(d => d.range === label);
            return found ? found : { range: label, count: 0 };
        });

        res.json(sortedDistribution);
    } catch (error) {
        console.error("Error fetching notes distribution:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// GET /api/stats/professors/assignment-status-breakdown
router.get('/professors/assignment-status-breakdown', authMiddleware, async (req, res) => {
    try {
        const breakdown = await Assignment.aggregate([
            {
                $match: { "professeur.idProf": { $ne: null } }
            },
            {
                $group: {
                    _id: {
                        profId: '$professeur.idProf',
                        statut: '$statut'
                    },
                    nomProf: { $first: '$professeur.nomProf' }, // Garder le nom du prof
                    count: { $sum: 1 }
                }
            },
            {
                $group: { // Regrouper par professeur pour agréger les statuts
                    _id: '$_id.profId',
                    nomProf: { $first: '$nomProf' }, // Utiliser le nomProf groupé précédemment
                    statuses: {
                        $push: {
                            k: '$_id.statut', // k pour key (status name)
                            v: '$count'      // v pour value (count for that status)
                        }
                    }
                }
            },
            {
                $lookup: { // Pour obtenir le nom complet et prénom/nom séparés
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'professorDetails'
                }
            },
            {
                $unwind: '$professorDetails' // On s'attend à un seul prof par ID
            },
            {
                $project: {
                    _id: 0,
                    professorId: '$_id',
                    professorNom: '$professorDetails.nom', // Nom de famille
                    professorPrenom: '$professorDetails.prenom', // Prénom
                    // Convertir le tableau de statuts en objet { status1: count1, status2: count2 }
                    statuses: { $arrayToObject: '$statuses' }
                }
            },
            { $sort: { professorNom: 1, professorPrenom: 1 } }
        ]);
        res.json(breakdown);
    } catch (error) {
        console.error("Error fetching assignment status breakdown by professor:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});


module.exports = router;