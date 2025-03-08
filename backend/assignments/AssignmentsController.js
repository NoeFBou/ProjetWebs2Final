var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var VerifyToken = require(__root + 'auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: true }));
var Assignement = require('./Assignement');



app.get('/api/assignments', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: "Accès refusé" });

    jwt.verify(token, 'votre_secret_jwt', async (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token invalide" });
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
});

// Route pour récupérer un assignment par son ID
app.get('/api/assignments/:id', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: "Accès refusé" });

    jwt.verify(token, 'votre_secret_jwt', async (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token invalide" });
        try {
            const assignment = await Assignment.findOne({ id: req.params.id });
            if (!assignment) {
                return res.status(404).json({ message: "Assignment non trouvé" });
            }
            res.json(assignment);
        } catch (error) {
            res.status(500).json({ error: "Erreur serveur" });
        }
    });
});

// Route pour ajouter un nouvel assignment
app.post('/api/assignments', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: "Accès refusé" });

    jwt.verify(token, 'votre_secret_jwt', async (err, decoded) => {
        if (err) return res.status(403).json({error: "Token invalide"});
        try {
            req.body.id = Date.now();
            const newAssignment = new Assignment(req.body);
            await newAssignment.save();
            res.status(201).json(newAssignment);
            console.log(res.json)


        } catch (error) {
            console.error(error);
            res.status(500).json({error: "Erreur lors de l'ajout de l'assignment"});
        }
    });
});

// Route pour modifier un assignment existant
app.put('/api/assignments/:id', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: "Accès refusé" });

    jwt.verify(token, 'votre_secret_jwt', async (err, decoded) => {
        if (err) return res.status(403).json({error: "Token invalide"});
        try {
            const updatedAssignment = await Assignment.findOneAndUpdate(
                {id: req.params.id},
                req.body,
                {new: true}
            );
            if (!updatedAssignment) {
                return res.status(404).json({message: "Assignment non trouvé"});
            }
            res.json(updatedAssignment);
            console.log(res.json)
        } catch (error) {
            res.status(500).json({error: "Erreur serveur"});
        }
    });
});

// Route pour supprimer un assignment
app.delete('/api/assignments/:id', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: "Accès refusé" });

    jwt.verify(token, 'votre_secret_jwt', async (err, decoded) => {
        if (err) return res.status(403).json({error: "Token invalide"});
        try {
            const deleted = await Assignment.findOneAndDelete({id: req.params.id});
            if (!deleted) {
                return res.status(404).json({message: "Assignment non trouvé"});
            }
            res.json({message: "Assignment supprimé avec succès"});
        } catch (error) {
            res.status(500).json({error: "Erreur serveur"});
        }
    });
});