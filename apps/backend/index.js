const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const path = require('path');

// Import des routes
const assignmentsRoutes = require('./routes/assignments');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // Import user routes
const statsRoutes = require('./routes/stats'); // <--- Import the new stats routes

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Enregistrement des routes
app.use('/api/assignments', assignmentsRoutes);
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
//app.use('/',frontRoutes);

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});
