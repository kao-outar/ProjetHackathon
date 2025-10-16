const request = require('supertest');
const app = require('../index');

describe('🔐 Tests d\'authentification complets', () => {
  
  describe('POST /api/auth/signup', () => {
    it('devrait créer un nouvel utilisateur avec toutes les données', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        age: 25,
        gender: 'male'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('Utilisateur créé avec succès');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.name).toBe('Test User');
      expect(response.body.user.age).toBe(25);
      expect(response.body.user.gender).toBe('male');
      expect(response.body.user.password).toBeUndefined();
    });

    it('devrait créer un utilisateur avec seulement les champs requis', async () => {
      const userData = {
        email: 'minimal@example.com',
        password: 'password123',
        name: 'Minimal User'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.user.email).toBe('minimal@example.com');
      expect(response.body.user.name).toBe('Minimal User');
      expect(response.body.user.age).toBeUndefined();
      expect(response.body.user.gender).toBeUndefined();
    });

    it('devrait retourner une erreur pour un email invalide', async () => {
      const userData = {
        email: 'email-invalide',
        password: 'password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(422);

      expect(response.body.error).toBe('invalid_email');
    });

    it('devrait retourner une erreur pour un mot de passe trop court', async () => {
      const userData = {
        email: 'test2@example.com',
        password: '123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(422);

      expect(response.body.error).toBe('weak_password');
    });

    it('devrait retourner une erreur pour un nom manquant', async () => {
      const userData = {
        email: 'test3@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(422);

      expect(response.body.error).toBe('name_required');
    });

    it('devrait retourner une erreur pour un âge invalide', async () => {
      const userData = {
        email: 'test4@example.com',
        password: 'password123',
        name: 'Test User',
        age: 200
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(422);

      expect(response.body.error).toBe('invalid_age');
    });

    it('devrait retourner une erreur pour un genre invalide', async () => {
      const userData = {
        email: 'test5@example.com',
        password: 'password123',
        name: 'Test User',
        gender: 'invalid'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(422);

      expect(response.body.error).toBe('invalid_gender');
    });

    it('devrait retourner une erreur pour un email déjà utilisé', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Créer le premier utilisateur
      await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      // Essayer de créer un second utilisateur avec le même email
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(409);

      expect(response.body.error).toBe('email_taken');
    });
  });

  describe('POST /api/auth/signin', () => {
    let user;
    let clientToken;

    beforeEach(async () => {
      // Créer un utilisateur de test
      const userData = {
        email: 'signin@example.com',
        password: 'password123',
        name: 'Signin User'
      };

      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(userData);
      
      user = signupResponse.body.user;
      clientToken = 'test-client-token-' + Date.now() + '-extra-long-token-for-testing';
    });

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'signin@example.com',
          password: 'password123',
          clientToken: clientToken
        })
        .expect(200);

      expect(response.body.message).toBe('Connexion réussie');
      expect(response.body.user.email).toBe('signin@example.com');
      expect(response.body.user.password).toBeUndefined();
    });

    it('devrait retourner une erreur pour un email invalide', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'invalid@example.com',
          password: 'password123',
          clientToken: clientToken
        })
        .expect(401);

      expect(response.body.error).toBe('invalid_credentials');
    });

    it('devrait retourner une erreur pour un mot de passe incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'signin@example.com',
          password: 'wrongpassword',
          clientToken: clientToken
        })
        .expect(401);

      expect(response.body.error).toBe('invalid_credentials');
    });

    it('devrait retourner une erreur pour un token client manquant', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'signin@example.com',
          password: 'password123'
        })
        .expect(422);

      expect(response.body.error).toBe('client_token_required');
    });

    it('devrait retourner une erreur pour un token client trop court', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'signin@example.com',
          password: 'password123',
          clientToken: 'short'
        })
        .expect(422);

      expect(response.body.error).toBe('client_token_required');
    });
  });

  describe('POST /api/auth/verify', () => {
    let user;
    let clientToken;

    beforeEach(async () => {
      // Créer un utilisateur de test
      const userData = {
        email: 'verify@example.com',
        password: 'password123',
        name: 'Verify User'
      };

      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(userData);
      
      user = signupResponse.body.user;
      clientToken = 'test-client-token-' + Date.now() + '-extra-long-token-for-testing';

      // Connecter l'utilisateur
      await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'verify@example.com',
          password: 'password123',
          clientToken: clientToken
        });
    });

    it('devrait vérifier un token valide', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          clientToken: clientToken,
          userId: user.id
        })
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.user.email).toBe('verify@example.com');
    });

    it('devrait retourner une erreur pour un token manquant', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          userId: user.id
        })
        .expect(401);

      expect(response.body.error).toBe('client_token_required');
    });

    it('devrait retourner une erreur pour un userId manquant', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          clientToken: clientToken
        })
        .expect(401);

      expect(response.body.error).toBe('user_id_required');
    });

    it('devrait retourner une erreur pour un utilisateur inexistant', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          clientToken: clientToken,
          userId: '507f1f77bcf86cd799439011' // ID inexistant
        })
        .expect(401);

      expect(response.body.error).toBe('invalid_or_expired_token');
    });

    it('devrait retourner une erreur pour un token incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          clientToken: 'wrong-token',
          userId: user.id
        })
        .expect(401);

      expect(response.body.error).toBe('invalid_token');
    });
  });

  describe('POST /api/auth/signout', () => {
    let user;
    let clientToken;

    beforeEach(async () => {
      // Créer un utilisateur de test
      const userData = {
        email: 'signout@example.com',
        password: 'password123',
        name: 'Signout User'
      };

      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(userData);
      
      user = signupResponse.body.user;
      clientToken = 'test-client-token-' + Date.now() + '-extra-long-token-for-testing';

      // Connecter l'utilisateur
      await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'signout@example.com',
          password: 'password123',
          clientToken: clientToken
        });
    });

    it('devrait déconnecter un utilisateur avec un token valide', async () => {
      const response = await request(app)
        .post('/api/auth/signout')
        .send({
          clientToken: clientToken,
          userId: user.id
        })
        .expect(200);

      expect(response.body.message).toBe('Déconnexion réussie');
    });

    it('devrait retourner une erreur pour un token manquant', async () => {
      const response = await request(app)
        .post('/api/auth/signout')
        .send({
          userId: user.id
        })
        .expect(422);

      expect(response.body.error).toBe('client_token_and_user_id_required');
    });

    it('devrait retourner une erreur pour un userId manquant', async () => {
      const response = await request(app)
        .post('/api/auth/signout')
        .send({
          clientToken: clientToken
        })
        .expect(422);

      expect(response.body.error).toBe('client_token_and_user_id_required');
    });

    it('devrait retourner une erreur pour un utilisateur inexistant', async () => {
      const response = await request(app)
        .post('/api/auth/signout')
        .send({
          clientToken: clientToken,
          userId: '507f1f77bcf86cd799439011' // ID inexistant
        })
        .expect(404);

      expect(response.body.error).toBe('user_not_found');
    });

    it('devrait retourner une erreur pour un token incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/signout')
        .send({
          clientToken: 'wrong-token',
          userId: user.id
        })
        .expect(401);

      expect(response.body.error).toBe('invalid_token');
    });
  });
});
