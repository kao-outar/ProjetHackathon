const express = require('express');
const app = express();
const PORT = 3000;

// Tableau de citations
const quotes = [
  "Le code, c’est la poésie du XXIe siècle.",
  "Apprendre, c’est réapprendre à chaque erreur.",
  "Un bon développeur lit avant d’écrire.",
  "La patience est le meilleur débogueur.",
  "Code moins, mais mieux."
];

// Route principale
app.get('/', (req, res) => {
  res.send('Bienvenue sur mon API de citations !');
});

// Route API qui renvoie une citation aléatoire
app.get('/api/quote', (req, res) => {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote: random });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur actif sur http://localhost:${PORT}`);
});

