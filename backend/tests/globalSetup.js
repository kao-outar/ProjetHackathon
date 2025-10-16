const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Configuration des variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Configuration globale de MongoDB Memory Server
beforeAll(async () => {
  try {
    // Fermer toute connexion existante
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Démarrer le serveur MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'test-db'
      }
    });
    const mongoUri = mongoServer.getUri();
    
    // Se connecter à la base de données en mémoire
    await mongoose.connect(mongoUri);
    
    console.log('🧪 Base de données de test connectée');
  } catch (error) {
    console.error('Erreur lors de la configuration des tests:', error);
    throw error;
  }
});

// Nettoyage après chaque test
afterEach(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
  }
});

// Fermeture de la connexion après tous les tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('🧪 Base de données de test fermée');
  } catch (error) {
    console.error('Erreur lors de la fermeture:', error);
  }
});
