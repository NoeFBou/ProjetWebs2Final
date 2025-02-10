const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api', (req, res) => {
    res.send({ message: 'Hello depuis Express !' });
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});

let assignments = require('./data.json');

const multer = require('multer');
const upload = multer();
app.use(upload.none());
