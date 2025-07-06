const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://sladbeksmd:tFYonsKGCmenQcdD@cluster0.duxy8f5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('📦 Conectado ao MongoDB com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB; 