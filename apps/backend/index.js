const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

// Import des routes
const assignmentsRoutes = require('./routes/assignments');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // Import user routes

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Enregistrement des routes
app.use('/api/assignments', assignmentsRoutes);
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
//app.use('/',frontRoutes);

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});
