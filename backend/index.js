const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const uri = "mongodb+srv://nono:test@clusterwebs2.lhw4z.mongodb.net/ClusterWebs2?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connecté à MongoDB via Mongoose"))
    .catch(err => console.error("Erreur de connexion :", err));

const assignmentSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: String,
    date: Date,
    nombre: Number,
    department: String,
    termine: Boolean
});


const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
});

// Création du modèle
const Assignment = mongoose.model('Assignment', assignmentSchema);
const User = mongoose.model('User', userSchema);


app.get('/api/assignments', async (req, res) => {
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

// Route pour récupérer un assignment par son ID
app.get('/api/assignments/:id', async (req, res) => {
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

// Route pour ajouter un nouvel assignment
app.post('/api/assignments', async (req, res) => {
    console.log("e")

    //print(req.body)
    console.log(req.body)

    try {
        req.body.id = Date.now();
        const newAssignment = new Assignment(req.body);
        await newAssignment.save();
        res.status(201).json(newAssignment);
        console.log(res.json)


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'ajout de l'assignment" });
    }
});

// Route pour modifier un assignment existant
app.put('/api/assignments/:id', async (req, res) => {
    console.log("e")
    try {
        const updatedAssignment = await Assignment.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedAssignment) {
            return res.status(404).json({ message: "Assignment non trouvé" });
        }
        res.json(updatedAssignment);
        console.log(res.json)
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Route pour supprimer un assignment
app.delete('/api/assignments/:id', async (req, res) => {
    try {
        const deleted = await Assignment.findOneAndDelete({ id: req.params.id });
        if (!deleted) {
            return res.status(404).json({ message: "Assignment non trouvé" });
        }
        res.json({ message: "Assignment supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});


app.post('/api/register', async (req, res) => {
    try {
        const { email, password, isAdmin } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, isAdmin: isAdmin || false });
        console.log(newUser)
        console.log(isAdmin)

        await newUser.save();
        res.json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Mot de passe invalide" });
        }
        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            'secret', { expiresIn: '1h' }
        );
        console.log(user.isAdmin)
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la connexion" });
    }
});

app.get('/api/protected', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({error: "Accès refusé"});
    }
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            return res.status(403).json({error: "Token invalide"});
        }
        res.json({message: "Accès autorisé"});
    });
});
