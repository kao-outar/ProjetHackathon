const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB Atlas'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// 🧱 Schéma utilisateur
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  age: Number
});

// 🔧 Modèle
const User = mongoose.model('User', userSchema);

// 📋 GET - liste des utilisateurs
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 🚨 Pas de app.listen() ici
// Vercel se charge de lancer l’application

// On exporte notre application Express
module.exports = app;

