// Utilitaires d'authentification pour le frontend
// Génération et gestion des tokens côté client

class AuthManager {
  constructor() {
    this.clientToken = null;
    this.userUuid = null;
    this.userData = null;
  }

  // Génération d'un token client sécurisé
  generateClientToken() {
    // Utilise l'API Web Crypto pour générer un token sécurisé
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.clientToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return this.clientToken;
  }

  // Connexion utilisateur
  async signin(email, password) {
    try {
      // Génération du token côté client
      const clientToken = this.generateClientToken();
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          clientToken
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Stockage des données utilisateur
        this.userUuid = data.user.uuid;
        this.userData = data.user;
        
        // Stockage en localStorage (optionnel, pour persistance)
        localStorage.setItem('clientToken', this.clientToken);
        localStorage.setItem('userUuid', this.userUuid);
        localStorage.setItem('userData', JSON.stringify(this.userData));
        
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, error: 'network_error' };
    }
  }

  // Inscription utilisateur
  async signup(userData) {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return { success: false, error: 'network_error' };
    }
  }

  // Vérification du token
  async verifyToken() {
    try {
      if (!this.clientToken || !this.userUuid) {
        // Tentative de récupération depuis localStorage
        this.clientToken = localStorage.getItem('clientToken');
        this.userUuid = localStorage.getItem('userUuid');
        this.userData = JSON.parse(localStorage.getItem('userData') || 'null');
      }

      if (!this.clientToken || !this.userUuid) {
        return { valid: false, error: 'no_token' };
      }

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientToken: this.clientToken,
          userUuid: this.userUuid
        })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        this.userData = data.user;
        return { valid: true, user: data.user };
      } else {
        this.clearAuth();
        return { valid: false, error: data.error };
      }
    } catch (error) {
      console.error('Erreur de vérification:', error);
      return { valid: false, error: 'network_error' };
    }
  }

  // Déconnexion
  async signout() {
    try {
      if (!this.clientToken || !this.userUuid) {
        return { success: true };
      }

      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientToken: this.clientToken,
          userUuid: this.userUuid
        })
      });

      this.clearAuth();
      return { success: true };
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      this.clearAuth(); // Déconnexion locale même en cas d'erreur
      return { success: true };
    }
  }

  // Nettoyage des données d'authentification
  clearAuth() {
    this.clientToken = null;
    this.userUuid = null;
    this.userData = null;
    localStorage.removeItem('clientToken');
    localStorage.removeItem('userUuid');
    localStorage.removeItem('userData');
  }

  // Vérification si l'utilisateur est connecté
  isAuthenticated() {
    return !!(this.clientToken && this.userUuid);
  }

  // Récupération des données utilisateur
  getUser() {
    return this.userData;
  }
}

// Instance singleton
const authManager = new AuthManager();

export default authManager;

// Exemple d'utilisation :
/*
import authManager from './utils/auth.js';

// Connexion
const result = await authManager.signin('user@example.com', 'password');
if (result.success) {
  console.log('Connecté:', result.user);
} else {
  console.error('Erreur:', result.error);
}

// Vérification du token
const verification = await authManager.verifyToken();
if (verification.valid) {
  console.log('Token valide:', verification.user);
}

// Déconnexion
await authManager.signout();
*/
