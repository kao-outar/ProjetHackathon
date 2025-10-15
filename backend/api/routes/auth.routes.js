// ./api/routes/auth.routes.js
const router = require('express').Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../../models/User.js');

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, age, gender } = req.body || {};

    // Validation des champs requis
    if (!email || !/.+@.+\..+/.test(email)) {
      return res.status(422).json({ error: 'invalid_email' });
    }
    if (!password || password.length < 8) {
      return res.status(422).json({ error: 'weak_password' });
    }
    if (!name || name.trim().length === 0) {
      return res.status(422).json({ error: 'name_required' });
    }
    if (age && (typeof age !== 'number' || age < 0 || age > 150)) {
      return res.status(422).json({ error: 'invalid_age' });
    }
    if (gender && !['male', 'female', 'other', 'prefer_not_to_say'].includes(gender.toLowerCase())) {
      return res.status(422).json({ error: 'invalid_gender' });
    }

    // Vérification de l'unicité de l'email
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'email_taken' });
    }

    // Hashage du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Génération d'un UUID unique
    const uuid = crypto.randomBytes(16).toString('hex');

    // Création de l'utilisateur avec tous les champs du schéma
    const user = await User.create({
      uuid,
      email: email.toLowerCase().trim(),
      password: passwordHash,
      name: name.trim(),
      age: age || undefined,
      gender: gender ? gender.toLowerCase() : undefined,
      date_created: new Date(),
      date_updated: new Date()
    });

    // Retour des informations utilisateur (sans le mot de passe)
    return res.status(201).json({
      user: {
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
        date_created: user.date_created,
        date_updated: user.date_updated
      }
    });
  } catch (e) {
    // Gestion des erreurs de duplication
    if (e?.code === 11000) {
      return res.status(409).json({ error: 'email_taken' });
    }
    // Gestion des erreurs de validation Mongoose
    if (e?.name === 'ValidationError') {
      const errors = Object.values(e.errors).map(err => err.message);
      return res.status(422).json({ error: 'validation_error', details: errors });
    }
    console.error('Erreur lors de la création de l\'utilisateur:', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
