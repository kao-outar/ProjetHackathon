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
  uuid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  age: Number,
  gender: String,
  date_created: { type: Date, default: Date.now },
  date_updated: { type: Date, default: Date.now }
});


// 🔧 Modèle
const User = mongoose.model('User', userSchema);

// 📋 GET - liste des utilisateurs
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const { email, name, age, gender, password } = req.body;
  if (!email || !name || !password){
    return res.status(400).json({ error: 'Champs manquants' });
  }
  //uuid generation
  const uuid = require('crypto').randomBytes(16).toString('hex');
  try {
    const newUser = await User.create({ email, name, age, gender, password, uuid });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/users/:uuid', async (req, res) => {
  const { uuid } = req.params;
  const { email, name, age, gender, password } = req.body;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { uuid },
      { email, name, age, gender, password, date_updated: Date.now() },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(updatedUser);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// On exporte notre application Express
module.exports = app;

