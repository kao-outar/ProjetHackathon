const request = require('supertest');
const app = require('../index');

describe('🔐 Test Auth simple', () => {
  
  it('devrait créer un nouvel utilisateur', async () => {
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
    expect(response.body.user.password).toBeUndefined(); // Le mot de passe ne doit pas être retourné
  });

  it('devrait retourner une erreur pour un email invalide', async () => {
    const userData = {
      email: 'email-invalide',
      password: 'password123',
      name: 'Test User',
      age: 25,
      gender: 'male'
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
      name: 'Test User',
      age: 25,
      gender: 'male'
    };

    const response = await request(app)
      .post('/api/auth/signup')
      .send(userData)
      .expect(422);

    expect(response.body.error).toBe('weak_password');
  });

  it('devrait retourner une erreur pour un email déjà utilisé', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      age: 25,
      gender: 'male'
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
