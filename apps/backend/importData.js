require('dotenv').config(); // If you use environment variables for MONGO_URI or JWT_SECRET
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db'); //
const User = require('./models/User'); //
const Assignment = require('./models/Assignment'); //

const usersFilePath = path.join(__dirname, 'users.json');
const assignmentsFilePath = path.join(__dirname, 'assignments.json');

const populateUsers = async () => {
    try {
       // await User.deleteMany({}); // Clear existing users
        console.log('Existing users cleared.');

        const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        const createdUsers = [];

        for (const userData of usersData) {
            const hashedPassword = await bcrypt.hash(userData.password, 10); //
            const user = new User({
                nom: userData.nom, //
                prenom: userData.prenom, //
                email: userData.email, //
                password: hashedPassword, //
                isAdmin: userData.isAdmin || false, //
                profilePicture: userData.profilePicture //
            });
            const savedUser = await user.save();
            createdUsers.push(savedUser);
            console.log(`User ${savedUser.email} created.`);
        }
        console.log(`${createdUsers.length} users successfully populated!`);
        return createdUsers;
    } catch (error) {
        console.error('Error populating users:', error);
        process.exit(1);
    }
};

const populateAssignments = async (users) => {
    try {
        await Assignment.deleteMany({}); // Clear existing assignments
        console.log('Existing assignments cleared.');

        const assignmentsData = JSON.parse(fs.readFileSync(assignmentsFilePath, 'utf-8'));
        let populatedCount = 0;

        // Create a map of email to user object for easy lookup
        const userMap = users.reduce((map, user) => {
            map[user.email] = user;
            return map;
        }, {});

        for (const assignData of assignmentsData) {
            const professor = userMap[assignData.professeurEmail];
            const student = userMap[assignData.eleveEmail];

            if (!professor) {
                console.warn(`Professor with email ${assignData.professeurEmail} not found. Skipping assignment: ${assignData.nom}`);
                continue;
            }
            if (!student) {
                console.warn(`Student with email ${assignData.eleveEmail} not found. Skipping assignment: ${assignData.nom}`);
                continue;
            }

            const assignment = new Assignment({
                nom: assignData.nom,
                matiere: assignData.matiere,
                exercice: assignData.exercice,
                note: assignData.note,
                tags: assignData.tags,
                statut: assignData.statut,
                dateDeRendu: new Date(assignData.dateDeRendu),
                visible: assignData.visible !== undefined ? assignData.visible : true,
                locked: assignData.locked !== undefined ? assignData.locked : false,
                professeur: {
                    idProf: professor._id,
                    nomProf: `${professor.prenom} ${professor.nom}`
                },
                eleve: {
                    idEleve: student._id,
                    nomEleve: `${student.prenom} ${student.nom}`
                }
            });
            await assignment.save();
            populatedCount++;
            console.log(`Assignment "${assignment.nom}" created.`);
        }
        console.log(`${populatedCount} assignments successfully populated!`);
    } catch (error) {
        console.error('Error populating assignments:', error);
        process.exit(1);
    }
};


const runPopulation = async () => {
    await connectDB(); //
    const createdUsers = await populateUsers();
    if (createdUsers && createdUsers.length > 0) {
        await populateAssignments(createdUsers);
    } else {
        console.log('No users were created, skipping assignment population.');
    }
    await mongoose.disconnect();
    console.log('Database population complete. Disconnected from MongoDB.');
};

runPopulation();