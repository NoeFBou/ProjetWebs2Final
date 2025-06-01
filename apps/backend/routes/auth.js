const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../secu/auth');

router.post('/register', async (req, res) => {
    try {
        const { email, password, isAdmin, nom, prenom } = req.body;
        if (!nom || !prenom || !email || !password) { // Validation de base
            return res.status(400).json({ error: "Tous les champs obligatoires n'ont pas été fournis." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, isAdmin: isAdmin || false, nom, prenom });
        await newUser.save();
        res.status(201).json({
            message: "Utilisateur créé avec succès",
            userId: newUser._id
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
    }
});

// Route d'inscription
router.post('/register', async (req, res) => {
    try {
        const { email, password, isAdmin, nom, prenom } = req.body; // Added nom, prenom
        if (!nom || !prenom) {
            return res.status(400).json({ error: "Le nom et le prénom sont requis." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, isAdmin: isAdmin || false, nom, prenom });
        await newUser.save();
        res.status(201).json({ message: "Utilisateur créé avec succès" }); // Changed to 201 for resource creation
    } catch (error) {
        console.error(error);
        // Handle potential duplicate email error (code 11000)
        if (error.code === 11000) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }
        res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
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
            {
                id: user._id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                isAdmin: user.isAdmin,
                profilePicture: user.profilePicture
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la connexion" });
    }
});


router.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: "Accès autorisé", user: req.user });
});

module.exports = router;
