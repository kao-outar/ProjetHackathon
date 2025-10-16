const request = require('supertest');
const app = require('../index');

describe('📝 Tests des routes de posts', () => {
  let testUser;
  let clientToken;

  beforeEach(async () => {
    // Créer un utilisateur de test
    const userData = {
      email: 'posts-test@example.com',
      password: 'password123',
      name: 'Posts Test User',
      age: 25,
      gender: 'male'
    };

    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send(userData);
    
    testUser = signupResponse.body.user;
    clientToken = 'test-client-token-' + Date.now() + '-extra-long-token-for-testing';

    // Connecter l'utilisateur
    await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'posts-test@example.com',
        password: 'password123',
        clientToken: clientToken
      });
  });

  describe('GET /api/posts', () => {
    it('devrait retourner la liste de tous les posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('devrait retourner une erreur sans token d\'authentification', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(401);

      expect(response.body.error).toBe('client_token_and_user_id_required');
    });
  });

  describe('GET /api/posts/user/:userId', () => {
    it('devrait retourner les posts d\'un utilisateur spécifique', async () => {
      const response = await request(app)
        .get(`/api/posts/user/${testUser._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('devrait retourner une erreur pour un utilisateur inexistant', async () => {
      const response = await request(app)
        .get('/api/posts/user/507f1f77bcf86cd799439011')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .expect(404);

      expect(response.body.error).toBe('Utilisateur non trouvé');
    });
  });

  describe('POST /api/posts', () => {
    it('devrait créer un nouveau post', async () => {
      const postData = {
        title: 'Mon premier post',
        content: 'Ceci est le contenu de mon premier post.',
        author: testUser._id
      };

      const response = await request(app)
        .post('/api/posts')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .send(postData)
        .expect(201);

      expect(response.body.title).toBe('Mon premier post');
      expect(response.body.content).toBe('Ceci est le contenu de mon premier post.');
      expect(response.body.author).toBe(testUser.id);
      expect(response.body._id).toBeDefined();
    });

    it('devrait retourner une erreur pour un titre manquant', async () => {
      const postData = {
        content: 'Contenu sans titre',
        author: testUser._id
      };

      const response = await request(app)
        .post('/api/posts')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .send(postData)
        .expect(400);

      expect(response.body.error).toBe('title, content, and author are required');
    });

    it('devrait retourner une erreur pour un contenu manquant', async () => {
      const postData = {
        title: 'Titre sans contenu',
        author: testUser._id
      };

      const response = await request(app)
        .post('/api/posts')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .send(postData)
        .expect(400);

      expect(response.body.error).toBe('title, content, and author are required');
    });

    it('devrait retourner une erreur pour un auteur manquant', async () => {
      const postData = {
        title: 'Titre sans auteur',
        content: 'Contenu sans auteur'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .send(postData)
        .expect(400);

      expect(response.body.error).toBe('title, content, and author are required');
    });
  });

  describe('PUT /api/posts/:postId', () => {
    let testPost;

    beforeEach(async () => {
      // Créer un post de test
      const postData = {
        title: 'Post de test',
        content: 'Contenu du post de test',
        author: testUser._id
      };

      const postResponse = await request(app)
        .post('/api/posts')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .send(postData);
      
      testPost = postResponse.body;
    });

    it('devrait mettre à jour un post', async () => {
      const updateData = {
        title: 'Post mis à jour',
        content: 'Contenu mis à jour',
        author: testUser._id
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Post mis à jour');
      expect(response.body.content).toBe('Contenu mis à jour');
    });

    it('devrait retourner une erreur pour un post inexistant', async () => {
      const updateData = {
        title: 'Post inexistant',
        content: 'Ce post n\'existe pas',
        author: testUser._id
      };

      const response = await request(app)
        .put('/api/posts/507f1f77bcf86cd799439011')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Post non trouvé');
    });
  });

  describe('DELETE /api/posts/:postId', () => {
    let testPost;

    beforeEach(async () => {
      // Créer un post de test
      const postData = {
        title: 'Post à supprimer',
        content: 'Ce post sera supprimé',
        author: testUser._id
      };

      const postResponse = await request(app)
        .post('/api/posts')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .send(postData);
      
      testPost = postResponse.body;
    });

    it('devrait supprimer un post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .expect(200);

      expect(response.body.message).toBe('Post supprimé avec succès');
    });

    it('devrait retourner une erreur pour un post inexistant', async () => {
      const response = await request(app)
        .delete('/api/posts/507f1f77bcf86cd799439011')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser._id)
        .expect(404);

      expect(response.body.error).toBe('Post non trouvé');
    });
  });
});
