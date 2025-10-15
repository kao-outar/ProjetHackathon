// ./api/routes/auth.routes.js
const router = require('express').Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

// ⚠️ On récupère le modèle déjà déclaré dans index.js
// Assure-toi que l'enregistrement du modèle a eu lieu AVANT d'importer cette route.
const User = mongoose.model('User');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, age, gender } = req.body || {};

    // validations simples
    if (!email || !/.+@.+\..+/.test(email)) {
      return res.status(422).json({ error: 'invalid_email' });
    }
    if (!password || password.length < 8) {
      return res.status(422).json({ error: 'weak_password' });
    }

    // email unique
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'email_taken' });
    }

    // hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // uuid (tu utilises déjà un champ uuid)
    const uuid = crypto.randomBytes(16).toString('hex');

    // Création (NOTE : on stocke le HASH dans le champ "password" existant)
    const user = await User.create({
      uuid,
      email,
      password: passwordHash, // <-- hashé, JAMAIS en clair
      name,
      age,
      gender
    });

    // Ne JAMAIS renvoyer le mot de passe (même hashé)
    return res.status(201).json({
      user: {
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
        date_created: user.date_created
      }
    });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ error: 'email_taken' });
    }
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
