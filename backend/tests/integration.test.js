const request = require('supertest');
const app = require('../index');

describe('🔗 Tests d\'intégration', () => {
  let testUser;
  let clientToken;

  beforeEach(async () => {
    // Créer un utilisateur de test
    const userData = {
      email: 'integration-test@example.com',
      password: 'password123',
      name: 'Integration Test User',
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
        email: 'integration-test@example.com',
        password: 'password123',
        clientToken: clientToken
      });
  });

  describe('Scénario complet : Créer un utilisateur, un post et des commentaires', () => {
    it('devrait permettre le flux complet utilisateur -> post -> commentaires', async () => {
      // 1. Créer un post
      const postData = {
        title: 'Post d\'intégration',
        content: 'Ceci est un post de test d\'intégration.',
        author: testUser.id
      };

      const postResponse = await request(app)
        .post('/api/posts')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(postData)
        .expect(201);

      const post = postResponse.body;

      // 2. Ajouter des commentaires au post
      const comment1Data = {
        post: post._id,
        content: 'Premier commentaire',
        author: testUser.id
      };

      const comment2Data = {
        post: post._id,
        content: 'Deuxième commentaire',
        author: testUser.id
      };

      const comment1Response = await request(app)
        .post('/api/comments')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(comment1Data)
        .expect(201);

      const comment2Response = await request(app)
        .post('/api/comments')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(comment2Data)
        .expect(201);

      // 3. Vérifier que le post a bien les commentaires
      const commentsResponse = await request(app)
        .get(`/api/comments/post/${post._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(200);

      expect(commentsResponse.body.length).toBe(2);
      expect(commentsResponse.body[0].content).toBe('Premier commentaire');
      expect(commentsResponse.body[1].content).toBe('Deuxième commentaire');

      // 4. Vérifier que l'utilisateur a bien le post
      const userPostsResponse = await request(app)
        .get(`/api/posts/user/${testUser.id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(200);

      expect(userPostsResponse.body.length).toBe(1);
      expect(userPostsResponse.body[0].title).toBe('Post d\'intégration');

      // 5. Modifier le post
      const updatePostData = {
        title: 'Post d\'intégration modifié',
        content: 'Contenu modifié',
        author: testUser.id
      };

      const updatedPostResponse = await request(app)
        .put(`/api/posts/${post._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(updatePostData)
        .expect(200);

      expect(updatedPostResponse.body.title).toBe('Post d\'intégration modifié');

      // 6. Modifier un commentaire
      const updateCommentData = {
        content: 'Commentaire modifié',
        author: testUser.id
      };

      const updatedCommentResponse = await request(app)
        .put(`/api/comments/${comment1Response.body._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(updateCommentData)
        .expect(200);

      expect(updatedCommentResponse.body.content).toBe('Commentaire modifié');

      // 7. Supprimer un commentaire
      await request(app)
        .delete(`/api/comments/${comment2Response.body._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(200);

      // 8. Vérifier qu'il ne reste qu'un commentaire
      const finalCommentsResponse = await request(app)
        .get(`/api/comments/post/${post._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(200);

      expect(finalCommentsResponse.body.length).toBe(1);

      // 9. Supprimer le post
      await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(200);

      // 10. Vérifier que le post a été supprimé
      const finalUserPostsResponse = await request(app)
        .get(`/api/posts/user/${testUser.id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(200);

      expect(finalUserPostsResponse.body.length).toBe(0);
    });
  });

  describe('Gestion des erreurs d\'authentification', () => {
    it('devrait rejeter les requêtes sans authentification', async () => {
      // Tenter de créer un post sans authentification
      const postData = {
        title: 'Post sans auth',
        content: 'Ceci ne devrait pas fonctionner',
        author: testUser.id
      };

      await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);

      // Tenter de récupérer les posts sans authentification
      await request(app)
        .get('/api/posts')
        .expect(401);

      // Tenter de récupérer les utilisateurs sans authentification
      await request(app)
        .get('/api/users')
        .expect(401);
    });

    it('devrait rejeter les requêtes avec des tokens invalides', async () => {
      const postData = {
        title: 'Post avec token invalide',
        content: 'Ceci ne devrait pas fonctionner',
        author: testUser.id
      };

      await request(app)
        .post('/api/posts')
        .set('x-client-token', 'token-invalide')
        .set('x-user-id', testUser.id)
        .send(postData)
        .expect(401);
    });
  });

  describe('Validation des données', () => {
    it('devrait valider les formats d\'email', async () => {
      const invalidUserData = {
        email: 'email-invalide',
        password: 'password123',
        name: 'Test User',
        age: 25,
        gender: 'male'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(invalidUserData)
        .expect(422);
    });

    it('devrait valider les mots de passe', async () => {
      const invalidUserData = {
        email: 'valid@example.com',
        password: '123', // Trop court
        name: 'Test User',
        age: 25,
        gender: 'male'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(invalidUserData)
        .expect(422);
    });

    it('devrait valider les âges', async () => {
      const invalidUserData = {
        email: 'valid@example.com',
        password: 'password123',
        name: 'Test User',
        age: 'pas-un-nombre',
        gender: 'male'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(invalidUserData)
        .expect(422);
    });
  });
});
