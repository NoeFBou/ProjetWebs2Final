// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../secu/auth'); // Assuming you want to protect this route
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// You might also want an endpoint to get a single user by ID (excluding password)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Only exclude password
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// --- Multer Configuration ---
const profilePicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'profile-pictures');
        // Create directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Use userId as filename, get extension from original file
        // Important: Ensure req.user is populated by authMiddleware and contains user ID
        const userId = req.params.userId; // Or req.user.id if uploader can only change their own
        if (!userId) {
            return cb(new Error("User ID not found for filename"), null);
        }
        const extension = path.extname(file.originalname);
        const filename = `${userId}${extension}`;

        // Delete old profile picture if it exists with a different extension
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'profile-pictures');
        ['.png', '.jpg', '.jpeg', '.gif'].forEach(ext => {
            const oldFilePath = path.join(uploadPath, `${userId}${ext}`);
            if (fs.existsSync(oldFilePath) && ext !== extension) {
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.error("Error deleting old profile picture:", err);
                });
            }
        });

        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const uploadProfilePic = multer({ storage: profilePicStorage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // Limit to 5MB

// POST /api/users/:userId/profile-picture
router.post('/:userId/profile-picture', authMiddleware, uploadProfilePic.single('profilePic'), async (req, res) => {
    // 'profilePic' should be the name attribute of your file input in the frontend
    try {
        const userIdToUpdate = req.params.userId;
        const currentUser = req.user; // From authMiddleware

        // Authorization: Allow user to update their own picture, or admin to update any
        if (currentUser.id !== userIdToUpdate && !currentUser.isAdmin) {
            // If file was uploaded by multer despite auth check, delete it
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(403).json({ error: "Accès non autorisé." });
        }

        if (req.fileValidationError) {
            return res.status(400).json({ error: req.fileValidationError });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Veuillez sélectionner un fichier image.' });
        }

        const user = await User.findById(userIdToUpdate);
        if (!user) {
            // If file was uploaded, delete it as user doesn't exist
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        // The filename is already set by multer to be <userId>.<ext>
        // We just need to store this filename (or a relative path) in the user document.
        user.profilePicture = req.file.filename; // e.g., "609bdf7a1c9d440000f3e8a3.jpg"
        await user.save();

        res.json({
            message: 'Photo de profil mise à jour avec succès!',
            filePath: `/uploads/profile-pictures/${user.profilePicture}`, // Relative path for client
            filename: user.profilePicture
        });

    } catch (error) {
        console.error("Error uploading profile picture:", error);
        if (req.file && error.code !== 'ENOENT') { // Don't try to delete if it wasn't created or error is unrelated to file system
            // fs.unlinkSync(req.file.path); // Clean up uploaded file on error
        }
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Le fichier est trop volumineux. Limite de 5MB.' });
        }
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de la photo.' });
    }
});


module.exports = router;