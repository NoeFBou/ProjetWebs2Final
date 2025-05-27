// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../secu/auth'); // Assuming you want to protect this route

// GET users - optionally filter by isAdmin status
// Example: GET /api/users?isAdmin=true (for teachers)
// Example: GET /api/users?isAdmin=false (for students)
// Example: GET /api/users (for all users - use with caution, maybe admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const query = {};
        if (req.query.isAdmin === 'true') {
            query.isAdmin = true;
        } else if (req.query.isAdmin === 'false') {
            query.isAdmin = false;
        }
        // Add other query parameters as needed, e.g., for search, pagination

        // Only allow admins to fetch all users if no filter is applied
        if (Object.keys(query).length === 0 && (req.user && !req.user.isAdmin)) {
            return res.status(403).json({ error: "Accès non autorisé pour lister tous les utilisateurs." });
        }

        const users = await User.find(query).select('-password'); // Exclude passwords
        res.json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// You might also want an endpoint to get a single user by ID (excluding password)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});


module.exports = router;