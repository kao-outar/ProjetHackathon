const router = require('express').Router();
const User = require('../../models/User.js');

// GET /api/users - Récupérer tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclure les mots de passe
    res.json({ users });
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
});

// GET /api/users/:uuid - Récupérer un utilisateur par UUID
router.get('/:uuid', async (req, res) => {
  const { uuid } = req.params;
  try {
    const user = await User.findOne({ uuid }, { password: 0 }); // Exclure le mot de passe
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de l\'utilisateur' });
  }
});

// PUT /api/users/:uuid - Mettre à jour un utilisateur
router.put('/:uuid', async (req, res) => {
  const { uuid } = req.params;
  const { email, name, age, gender } = req.body; // Pas de password dans l'update
  
  try {
    // Validation des données
    const updateData = {};
    if (email && /.+@.+\..+/.test(email)) {
      updateData.email = email.toLowerCase().trim();
    }
    if (name && name.trim().length > 0) {
      updateData.name = name.trim();
    }
    if (age && typeof age === 'number' && age >= 0 && age <= 150) {
      updateData.age = age;
    }
    if (gender && ['male', 'female', 'other', 'prefer_not_to_say'].includes(gender.toLowerCase())) {
      updateData.gender = gender.toLowerCase();
    }
    
    updateData.date_updated = new Date();
    
    const updatedUser = await User.findOneAndUpdate(
      { uuid },
      updateData,
      { new: true, select: '-password' } // Exclure le mot de passe de la réponse
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({ user: updatedUser });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'utilisateur' });
  }
});

module.exports = router;