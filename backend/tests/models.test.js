const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

describe('📋 Tests des modèles', () => {
  describe('Modèle User', () => {
    it('devrait créer un utilisateur avec toutes les données', async () => {
      const userData = {
        email: 'model-test@example.com',
        password: 'password123',
        name: 'Model Test User',
        age: 25,
        gender: 'male'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe('model-test@example.com');
      expect(savedUser.name).toBe('Model Test User');
      expect(savedUser.age).toBe(25);
      expect(savedUser.gender).toBe('male');
      expect(savedUser.date_created).toBeDefined();
      expect(savedUser.date_updated).toBeDefined();
    });

    it('devrait créer un utilisateur avec seulement les champs requis', async () => {
      const userData = {
        email: 'minimal@example.com',
        password: 'password123',
        name: 'Minimal User'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe('minimal@example.com');
      expect(savedUser.name).toBe('Minimal User');
      expect(savedUser.age).toBeUndefined();
      expect(savedUser.gender).toBeUndefined();
    });

    it('devrait rejeter un utilisateur sans email', async () => {
      const userData = {
        password: 'password123',
        name: 'No Email User'
      };

      const user = new User(userData);
      
      try {
        await user.save();
        fail('Le modèle devrait rejeter un utilisateur sans email');
      } catch (error) {
        expect(error.errors.email).toBeDefined();
      }
    });

    it('devrait rejeter un utilisateur sans mot de passe', async () => {
      const userData = {
        email: 'nopassword@example.com',
        name: 'No Password User'
      };

      const user = new User(userData);
      
      try {
        await user.save();
        fail('Le modèle devrait rejeter un utilisateur sans mot de passe');
      } catch (error) {
        expect(error.errors.password).toBeDefined();
      }
    });

  });

  describe('Modèle Post', () => {
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        email: 'post-model-test@example.com',
        password: 'password123',
        name: 'Post Model Test User'
      });
      await testUser.save();
    });

    it('devrait créer un post avec toutes les données', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Ceci est un post de test',
        author: testUser._id
      };

      const post = new Post(postData);
      const savedPost = await post.save();

      expect(savedPost._id).toBeDefined();
      expect(savedPost.title).toBe('Test Post');
      expect(savedPost.content).toBe('Ceci est un post de test');
      expect(savedPost.author.toString()).toBe(testUser._id.toString());
      expect(savedPost.date_created).toBeDefined();
      expect(savedPost.date_updated).toBeDefined();
      expect(Array.isArray(savedPost.comments)).toBe(true);
    });

    it('devrait rejeter un post sans titre', async () => {
      const postData = {
        content: 'Post sans titre',
        author: testUser._id
      };

      const post = new Post(postData);
      
      try {
        await post.save();
        throw new Error('Le modèle devrait rejeter un post sans titre');
      } catch (error) {
        expect(error.errors.title).toBeDefined();
      }
    });

    it('devrait rejeter un post sans contenu', async () => {
      const postData = {
        title: 'Post sans contenu',
        author: testUser._id
      };

      const post = new Post(postData);
      
      try {
        await post.save();
        throw new Error('Le modèle devrait rejeter un post sans contenu');
      } catch (error) {
        expect(error.errors.content).toBeDefined();
      }
    });

    it('devrait rejeter un post sans auteur', async () => {
      const postData = {
        title: 'Post sans auteur',
        content: 'Post sans auteur'
      };

      const post = new Post(postData);
      
      try {
        await post.save();
        throw new Error('Le modèle devrait rejeter un post sans auteur');
      } catch (error) {
        expect(error.errors.author).toBeDefined();
      }
    });
  });

  describe('Modèle Comment', () => {
    let testUser;
    let testPost;

    beforeEach(async () => {
      testUser = new User({
        email: 'comment-model-test@example.com',
        password: 'password123',
        name: 'Comment Model Test User'
      });
      await testUser.save();

      testPost = new Post({
        title: 'Test Post for Comments',
        content: 'Ceci est un post pour les commentaires',
        author: testUser._id
      });
      await testPost.save();
    });

    it('devrait créer un commentaire avec toutes les données', async () => {
      const commentData = {
        content: 'Test Comment',
        post: testPost._id,
        author: testUser._id
      };

      const comment = new Comment(commentData);
      const savedComment = await comment.save();

      expect(savedComment._id).toBeDefined();
      expect(savedComment.content).toBe('Test Comment');
      expect(savedComment.post.toString()).toBe(testPost._id.toString());
      expect(savedComment.author.toString()).toBe(testUser._id.toString());
      expect(savedComment.date_created).toBeDefined();
      expect(savedComment.date_updated).toBeDefined();
    });

    it('devrait rejeter un commentaire sans contenu', async () => {
      const commentData = {
        post: testPost._id,
        author: testUser._id
      };

      const comment = new Comment(commentData);
      
      try {
        await comment.save();
        throw new Error('Le modèle devrait rejeter un commentaire sans contenu');
      } catch (error) {
        expect(error.errors.content).toBeDefined();
      }
    });

    it('devrait rejeter un commentaire sans post', async () => {
      const commentData = {
        content: 'Commentaire sans post',
        author: testUser._id
      };

      const comment = new Comment(commentData);
      
      try {
        await comment.save();
        throw new Error('Le modèle devrait rejeter un commentaire sans post');
      } catch (error) {
        expect(error.errors.post).toBeDefined();
      }
    });

    it('devrait rejeter un commentaire sans auteur', async () => {
      const commentData = {
        content: 'Commentaire sans auteur',
        post: testPost._id
      };

      const comment = new Comment(commentData);
      
      try {
        await comment.save();
        throw new Error('Le modèle devrait rejeter un commentaire sans auteur');
      } catch (error) {
        expect(error.errors.author).toBeDefined();
      }
    });
  });

  describe('Relations entre modèles', () => {
    it('devrait maintenir les relations User-Post-Comment', async () => {
      // Créer un utilisateur
      const user = new User({
        email: 'relations@example.com',
        password: 'password123',
        name: 'Relations Test User'
      });
      await user.save();

      // Créer un post
      const post = new Post({
        title: 'Post avec relations',
        content: 'Ceci est un post pour tester les relations',
        author: user._id
      });
      await post.save();

      // Créer des commentaires
      const comment1 = new Comment({
        content: 'Premier commentaire',
        post: post._id,
        author: user._id
      });
      await comment1.save();

      const comment2 = new Comment({
        content: 'Deuxième commentaire',
        post: post._id,
        author: user._id
      });
      await comment2.save();

      // Vérifier les relations
      const populatedPost = await Post.findById(post._id).populate('author');
      expect(populatedPost.author.email).toBe('relations@example.com');

      const populatedComments = await Comment.find({ post: post._id }).populate('author');
      expect(populatedComments.length).toBe(2);
      expect(populatedComments[0].author.email).toBe('relations@example.com');
      expect(populatedComments[1].author.email).toBe('relations@example.com');
    });
  });
});
