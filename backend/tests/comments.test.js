const request = require('supertest');
const app = require('../index');

describe('💬 Tests des routes de commentaires', () => {
  let testUser;
  let testPost;
  let clientToken;

  beforeEach(async () => {
    // Créer un utilisateur de test
    const userData = {
      email: 'comments-test@example.com',
      password: 'password123',
      name: 'Comments Test User',
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
        email: 'comments-test@example.com',
        password: 'password123',
        clientToken: clientToken
      });

    // Créer un post de test
    const postData = {
      title: 'Post pour commentaires',
      content: 'Ceci est un post pour tester les commentaires.',
        author: testUser.id
    };

    const postResponse = await request(app)
      .post('/api/posts')
      .set('x-client-token', clientToken)
      .set('x-user-id', testUser.id)
      .send(postData);
    
    testPost = postResponse.body;
  });

  describe('POST /api/comments', () => {
    it('devrait créer un nouveau commentaire', async () => {
      const commentData = {
        postId: testPost._id,
        content: 'Ceci est un commentaire de test.'
      };

      const response = await request(app)
        .post('/api/comments')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(commentData)
        .expect(201);

      expect(response.body.content).toBe('Ceci est un commentaire de test.');
      expect(response.body.post).toBe(testPost._id);
      expect(response.body.author).toBe(testUser.id);
      expect(response.body._id).toBeDefined();
    });

    it('devrait retourner une erreur pour un contenu manquant', async () => {
      const commentData = {
        postId: testPost._id
      };

      const response = await request(app)
        .post('/api/comments')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(commentData)
        .expect(400);

      expect(response.body.error).toBe('postId and content are required');
    });

    it('devrait retourner une erreur pour un post manquant', async () => {
      const commentData = {
        content: 'Commentaire sans post'
      };

      const response = await request(app)
        .post('/api/comments')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(commentData)
        .expect(400);

      expect(response.body.error).toBe('postId and content are required');
    });

    it('devrait retourner une erreur sans authentification', async () => {
      const commentData = {
        postId: testPost._id,
        content: 'Commentaire sans auth'
      };

      const response = await request(app)
        .post('/api/comments')
        .send(commentData)
        .expect(401);

      expect(response.body.error).toBe('client_token_and_user_id_required');
    });
  });

  describe('GET /api/comments/post/:postId', () => {
    it('devrait retourner la liste des commentaires d\'un post', async () => {
      // Créer un commentaire
      const commentData = {
        postId: testPost._id,
        content: 'Commentaire de test'
      };

      await request(app)
        .post('/api/comments')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(commentData);

      const response = await request(app)
        .get(`/api/comments/post/${testPost._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].content).toBe('Commentaire de test');
    });

    it('devrait retourner une liste vide pour un post sans commentaires', async () => {
      const response = await request(app)
        .get(`/api/comments/post/${testPost._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('PUT /api/comments/:commentId', () => {
    let testComment;

    beforeEach(async () => {
      // Créer un commentaire de test
      const commentData = {
        postId: testPost._id,
        content: 'Commentaire original'
      };

      const commentResponse = await request(app)
        .post('/api/comments')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(commentData);
      
      testComment = commentResponse.body;
    });

    it('devrait mettre à jour un commentaire', async () => {
      const updateData = {
        content: 'Commentaire modifié'
      };

      const response = await request(app)
        .put(`/api/comments/${testComment._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(updateData)
        .expect(200);

      expect(response.body.content).toBe('Commentaire modifié');
    });

    it('devrait retourner une erreur pour un commentaire inexistant', async () => {
      const updateData = {
        content: 'Commentaire inexistant'
      };

      const response = await request(app)
        .put('/api/comments/507f1f77bcf86cd799439011')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Commentaire non trouvé');
    });
  });

  describe('DELETE /api/comments/:commentId', () => {
    let testComment;

    beforeEach(async () => {
      // Créer un commentaire de test
      const commentData = {
        postId: testPost._id,
        content: 'Commentaire à supprimer'
      };

      const commentResponse = await request(app)
        .post('/api/comments')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(commentData);
      
      testComment = commentResponse.body;
    });

    it('devrait supprimer un commentaire', async () => {
      const response = await request(app)
        .delete(`/api/comments/${testComment._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(200);

      expect(response.body.message).toBe('Commentaire supprimé');
    });

    it('devrait retourner une erreur pour un commentaire inexistant', async () => {
      const response = await request(app)
        .delete('/api/comments/507f1f77bcf86cd799439011')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(404);

      expect(response.body.error).toBe('Commentaire non trouvé');
    });
  });
});
