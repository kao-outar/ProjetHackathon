const router = require('express').Router();
import { User } from '../../models/User.js';


router.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get('/api/users/:uuid', async (req, res) => {
    const { uuid } = req.params;
    try {
        const user = await User.findOne({ uuid });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/api/users/:uuid', async (req, res) => {
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