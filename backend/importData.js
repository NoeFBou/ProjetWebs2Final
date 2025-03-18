const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const uri = "mongodb+srv://nono:test@clusterwebs2.lhw4z.mongodb.net/ClusterWebs2?retryWrites=true&w=majority";

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => {
        console.error('Erreur de connexion', err);
        process.exit(1);
    });

const assignmentSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: String,
    date: Date,
    nombre: Number,
    department: String,
    termine: Boolean
});
const Assignment = mongoose.model('Assignment', assignmentSchema);

const filePath = path.join(__dirname, 'data.json');

fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
        console.error("Erreur lors de la lecture du fichier data.json:", err);
        process.exit(1);
    }
    try {
        const assignmentsData = JSON.parse(data);

        for (const item of assignmentsData) {
            const assignment = new Assignment({
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: item.name,
                date: new Date(item.date),
                nombre: item.number,
                department: item.department,
                termine: item.termine
            });

            await assignment.save();
            console.log(`Assignment "${assignment.name}" importé avec succès`);
        }
        console.log('Importation terminée.');
    } catch (error) {
        console.error("Erreur lors de l'importation des données:", error);
    } finally {
        mongoose.disconnect();
    }
});
