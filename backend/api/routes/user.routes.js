
const router = require('express').Router();
const User = require('../../models/User.js');
const verifyToken = require('../../middleware/verifyToken');

router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, token: 0, token_expiration: 0 });
    res.json({ users });
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id }, { password: 0, token: 0, token_expiration: 0 }); // Exclure les champs sensibles
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de l\'utilisateur' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { email, name, age, gender } = req.body; // Pas de password dans l'update
  
  try {
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
      { _id: id },
      updateData,
      { new: true, select: '-password -token -token_expiration' } // Exclure les champs sensibles de la réponse
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(updatedUser);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'utilisateur' });
  }
});

module.exports = router;