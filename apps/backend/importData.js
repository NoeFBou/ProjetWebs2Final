// scripts/seedDB.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path to your User model
const Assignment = require('./models/Assignment'); // Adjust path
const connectDB = require('./config/db'); // Adjust path if your db connection setup is there

const seedData = async () => {
    try {
        await connectDB(); // Connect to the DB

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Assignment.deleteMany({});
        console.log('Data cleared.');

        // Create Users (Teachers and Students)
        console.log('Creating users...');
        const hashedProfPassword = await bcrypt.hash('password123', 10);
        const prof1 = await User.create({
            nom: 'Einstein',
            prenom: 'Albert',
            email: 'prof.einstein@example.com',
            password: hashedProfPassword,
            isAdmin: true // Teacher
        });

        const hashedStudentPassword = await bcrypt.hash('password456', 10);
        const student1 = await User.create({
            nom: 'Curie',
            prenom: 'Marie',
            email: 'student.curie@example.com',
            password: hashedStudentPassword,
            isAdmin: false // Student
        });
        const student2 = await User.create({
            nom: 'Newton',
            prenom: 'Isaac',
            email: 'student.newton@example.com',
            password: hashedStudentPassword, // Can reuse or make unique
            isAdmin: false // Student
        });
        console.log('Users created.');

        // Create Assignments
        console.log('Creating assignments...');
        await Assignment.create([
            {
                nom: 'Dissertation sur la Relativité',
                matiere: 'Physique',
                exercice: 'Expliquer E=mc^2 en 5 pages.',
                tags: ['physique', 'relativité'],
                statut: 'en cours',
                dateDeRendu: new Date('2025-09-15'),
                visible: true,
                locked: false,
                professeur: { idProf: prof1._id, nomProf: `${prof1.prenom} ${prof1.nom}` },
                eleve: { idEleve: student1._id, nomEleve: `${student1.prenom} ${student1.nom}` },
                note: 18.5
            },
            {
                nom: 'Recherche sur la Radioactivité',
                matiere: 'Chimie',
                tags: ['chimie', 'recherche'],
                statut: 'terminé',
                dateDeRendu: new Date('2025-08-20'),
                visible: true,
                locked: true,
                professeur: { idProf: prof1._id, nomProf: `${prof1.prenom} ${prof1.nom}` },
                eleve: { idEleve: student1._id, nomEleve: `${student1.prenom} ${student1.nom}` },
                note: 19
            },
            {
                nom: 'Devoir sur les Lois du Mouvement',
                matiere: 'Physique',
                exercice: 'Résoudre 10 problèmes sur la dynamique.',
                tags: ['physique', 'mécanique'],
                statut: 'en attente',
                dateDeRendu: new Date('2025-10-01'),
                professeur: { idProf: prof1._id, nomProf: `${prof1.prenom} ${prof1.nom}` },
                eleve: { idEleve: student2._id, nomEleve: `${student2.prenom} ${student2.nom}` }
            }
        ]);
        console.log('Assignments created.');

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
};

seedData();