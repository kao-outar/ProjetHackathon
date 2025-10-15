const express = require('express');
const app = express();

// Tableau de citations
const quotes = [
  "Le code, c’est la poésie du XXIe siècle.",
  "Apprendre, c’est réapprendre à chaque erreur.",
  "Un bon développeur lit avant d’écrire.",
  "La patience est le meilleur débogueur.",
  "Code moins, mais mieux."
];

// Route API
app.get('/api/quote', (req, res) => {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote: random });
});

// 🚨 Pas de app.listen() ici
// Vercel se charge de lancer l’application

// On exporte notre application Express
module.exports = app;

