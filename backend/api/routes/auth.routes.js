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

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'email_taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const uuid = crypto.randomBytes(16).toString('hex');

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
    if (e?.code === 11000) {
      return res.status(409).json({ error: 'email_taken' });
    }
    if (e?.name === 'ValidationError') {
      const errors = Object.values(e.errors).map(err => err.message);
      return res.status(422).json({ error: 'validation_error', details: errors });
    }
    console.error('Erreur lors de la création de l\'utilisateur:', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password, clientToken } = req.body || {};

    // Validation des champs requis
    if (!email || !/.+@.+\..+/.test(email)) {
      return res.status(422).json({ error: 'invalid_email' });
    }
    if (!password || password.length < 1) {
      return res.status(422).json({ error: 'password_required' });
    }
    if (!clientToken || clientToken.length < 32) {
      return res.status(422).json({ error: 'client_token_required' });
    }

    // Recherche de l'utilisateur par email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    // Vérification du mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    // Hashage du token client pour le stockage (sécurité supplémentaire)
    const hashedToken = await bcrypt.hash(clientToken, 10);
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Mise à jour du token dans la base de données
    await User.findOneAndUpdate(
      { uuid: user.uuid },
      { 
        token: hashedToken,
        token_expiration: tokenExpiration,
        date_updated: new Date()
      }
    );

    // Retour des informations utilisateur (sans le token)
    return res.status(200).json({
      message: 'Connexion réussie',
      user: {
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
        date_created: user.date_created,
        date_updated: new Date()
      }
    });
  } catch (e) {
    console.error('Erreur lors de la connexion:', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/auth/signout
router.post('/signout', async (req, res) => {
  try {
    const { clientToken, userUuid } = req.body || {};

    if (!clientToken || !userUuid) {
      return res.status(422).json({ error: 'client_token_and_user_uuid_required' });
    }

    // Recherche de l'utilisateur et vérification du token
    const user = await User.findOne({ uuid: userUuid });
    if (!user) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    const isValidToken = await bcrypt.compare(clientToken, user.token);
    if (!isValidToken) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    // Suppression du token de la base de données
    await User.findOneAndUpdate(
      { uuid: userUuid },
      { 
        token: null,
        token_expiration: null,
        date_updated: new Date()
      }
    );

    return res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (e) {
    console.error('Erreur lors de la déconnexion:', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/auth/verify - Vérifier la validité d'un token
router.post('/verify', async (req, res) => {
  try {
    const { clientToken, userUuid } = req.body || {};

    if (!clientToken) {
      return res.status(401).json({ error: 'client_token_required' });
    }
    if (!userUuid) {
      return res.status(401).json({ error: 'user_uuid_required' });
    }

    // Recherche de l'utilisateur par UUID
    const user = await User.findOne({ 
      uuid: userUuid,
      token_expiration: { $gt: new Date() } // Token non expiré
    });

    if (!user) {
      return res.status(401).json({ error: 'invalid_or_expired_token' });
    }

    // Vérification du token client avec le hash stocké
    const isValidToken = await bcrypt.compare(clientToken, user.token);
    if (!isValidToken) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    return res.status(200).json({
      valid: true,
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
    console.error('Erreur lors de la vérification du token:', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
