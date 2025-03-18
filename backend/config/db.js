const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://nono:test@clusterwebs2.lhw4z.mongodb.net/ClusterWebs2?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connecté à MongoDB via Mongoose");
    } catch (error) {
        console.error("Erreur de connexion à MongoDB :", error);
        process.exit(1);
    }
};

module.exports = connectDB;
