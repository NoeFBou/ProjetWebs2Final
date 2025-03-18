const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../secu/auth');

// Route d'inscription
router.post('/register', async (req, res) => {
    try {
        const { email, password, isAdmin } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, isAdmin: isAdmin || false });
        await newUser.save();
        res.json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
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
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'secret', // Utilisez une variable d'environnement pour le secret
            { expiresIn: '1h' }
        );
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la connexion" });
    }
});

// Exemple de route protégée accessible uniquement avec un token valide
router.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: "Accès autorisé", user: req.user });
});

module.exports = router;
