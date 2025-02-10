const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());

app.use(express.json());

app.get('/api', (req, res) => {
    res.send({ message: 'Hello depuis Express !' });
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});

let assignments = require('./data.json');

//route pour récupérer tous les assignments
app.get('/api/assignments', (req, res) => {
    res.send(assignments);
});

//route pour récupérer un seul assignment
app.get('/api/assignments/:id', (req, res) => {
    let id = req.params.id;
    let assignment = assignments.find(assignment => assignment.id === id);
    res.send(assignment);
});

//route pour ajouter un assignment
app.post('/api/assignments', (req, res) => {
    let assignment = req.body;
    assignment.id = assignments.length + 1;
    assignments.push(assignment);
    res.send(assignment);
});

//route pour modifier un assignment
app.put('/api/assignments/:id', (req, res) => {
    let id = req.params.id;
    let assignment = assignments.find(assignment => assignment.id === id);
    assignment.nom = req.body.nom;
    assignment.dateDeRendu = req.body.dateDeRendu;
    res.send(assignment);
});

//route pour supprimer un assignment
app.delete('/api/assignments/:id', (req, res) => {
    let id = req.params.id;
    assignments = assignments.filter(assignment => assignment.id !== id);
    res.send(assignments);
});



const multer = require('multer');
const upload = multer();
app.use(upload.none());
