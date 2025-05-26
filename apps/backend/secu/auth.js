// Création du middleware d'authentification

const jwt = require('jsonwebtoken');

// Middleware d'authentification
module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Accès refusé" });
    }

    // Vérification du token
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Token invalide" });
        }
        req.user = decoded;
        next();
    });
};
