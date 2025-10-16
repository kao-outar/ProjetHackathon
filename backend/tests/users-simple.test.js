const request = require('supertest');
const app = require('../index');

describe('👥 Tests simples des routes utilisateur', () => {
  let testUser;
  let clientToken;

  beforeEach(async () => {
    // Créer un utilisateur de test
    const userData = {
      email: 'user-simple@example.com',
      password: 'password123',
      name: 'Simple User',
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
        email: 'user-simple@example.com',
        password: 'password123',
        clientToken: clientToken
      });
  });

  describe('GET /api/users', () => {
    it('devrait retourner la liste de tous les utilisateurs', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(200);

      console.log('GET /api/users response:', response.body);
      
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
      
      // Vérifier que les mots de passe ne sont pas retournés
      response.body.users.forEach(user => {
        expect(user.password).toBeUndefined();
        expect(user.token).toBeUndefined();
        expect(user.token_expiration).toBeUndefined();
      });
    });

    it('devrait retourner une erreur sans token d\'authentification', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.error).toBe('client_token_and_user_id_required');
    });
  });

  describe('GET /api/users/:id', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(200);

      console.log('GET /api/users/:id response:', response.body);
      
      expect(response.body).toHaveProperty('user');
      expect(response.body.user._id).toBe(testUser.id);
      expect(response.body.user.email).toBe('user-simple@example.com');
      expect(response.body.user.name).toBe('Simple User');
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.token).toBeUndefined();
      expect(response.body.user.token_expiration).toBeUndefined();
    });

    it('devrait retourner une erreur pour un ID inexistant', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .expect(404);

      expect(response.body.error).toBe('Utilisateur non trouvé');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      const updateData = {
        name: 'Updated Simple User'
      };

      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('x-client-token', clientToken)
        .set('x-user-id', testUser.id)
        .send(updateData)
        .expect(200);

      console.log('PUT /api/users/:id response:', response.body);
      
      expect(response.body.name).toBe('Updated Simple User');
      expect(response.body.email).toBe('user-simple@example.com'); // Email inchangé
      expect(response.body.password).toBeUndefined();
    });
  });
});
