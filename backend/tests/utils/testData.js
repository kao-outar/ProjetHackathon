// Données de test pour les tests unitaires
const crypto = require('crypto');

// Génération d'un token client pour les tests
const generateClientToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Données de test pour les utilisateurs
const testUsers = {
  valid: {
    email: 'test@example.com',
    password: 'motdepasse123',
    name: 'Utilisateur Test',
    age: 25,
    gender: 'male'
  },
  invalid: {
    email: 'email-invalide',
    password: '123',
    name: '',
    age: 200,
    gender: 'genre_invalide'
  },
  existing: {
    email: 'existing@example.com',
    password: 'motdepasse123',
    name: 'Utilisateur Existant',
    age: 30,
    gender: 'female'
  }
};

// Données de test pour les posts
const testPosts = {
  valid: {
    title: 'Mon premier post',
    content: 'Voici le contenu de mon premier post sur cette plateforme !',
    author: null // Sera défini dynamiquement avec l'ID de l'utilisateur
  },
  invalid: {
    title: '',
    content: '',
    author: null
  },
  update: {
    title: 'Titre modifié',
    content: 'Contenu modifié du post'
  }
};

// Données de test pour les commentaires
const testComments = {
  valid: {
    content: 'Excellent post ! Merci pour le partage.',
    post: null, // Sera défini dynamiquement avec l'ID du post
    author: null // Sera défini dynamiquement avec l'ID de l'utilisateur
  },
  invalid: {
    content: '',
    post: null,
    author: null
  },
  update: {
    content: 'Commentaire modifié'
  }
};

// Utilitaires pour les tests
const testUtils = {
  // Créer un utilisateur de test
  async createTestUser(User) {
    const user = await User.create({
      uuid: crypto.randomBytes(16).toString('hex'),
      email: testUsers.valid.email,
      password: '$2b$10$rQZ8K9mN2pL3oI4uV5wX6e7fG8hI9jK0lM1nO2pQ3rS4tU5vW6xY7zA8bC',
      name: testUsers.valid.name,
      age: testUsers.valid.age,
      gender: testUsers.valid.gender,
      date_created: new Date(),
      date_updated: new Date()
    });
    return user;
  },

  // Créer un post de test
  async createTestPost(Post, authorId) {
    const post = await Post.create({
      title: testPosts.valid.title,
      content: testPosts.valid.content,
      author: authorId,
      date_created: new Date(),
      date_updated: new Date(),
      comments: []
    });
    return post;
  },

  // Créer un commentaire de test
  async createTestComment(Comment, postId, authorId) {
    const comment = await Comment.create({
      content: testComments.valid.content,
      post: postId,
      author: authorId,
      date_created: new Date(),
      date_updated: new Date()
    });
    return comment;
  },

  // Générer un token client
  generateClientToken,

  // Attendre un délai
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

module.exports = {
  testUsers,
  testPosts,
  testComments,
  testUtils,
  generateClientToken
};
