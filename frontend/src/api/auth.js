import API from "./axiosClient";

// Génération sécurisée d'un token client
function generateClientToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function signup(email, password, name, age, gender) {
  const response = await API.post("/auth/signup", {
    email,
    password,
    name,
    age,
    gender
  });
  return response.data;
}

export async function signin(email, password) {
  const clientToken = generateClientToken();
  
  const response = await API.post("/auth/signin", {
    email,
    password,
    clientToken
  });

  // Stocke le token et l'UUID
  localStorage.setItem('clientToken', clientToken);
  localStorage.setItem('userId', response.data.user.id);
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
}

export async function verifyToken() {
  const clientToken = localStorage.getItem('clientToken');
  const userId = localStorage.getItem('userId');

  if (!clientToken || !userId) {
    return null;  // ✅ Retourne null si pas de token
  }

  try {
    const response = await API.post("/auth/verify", {
      clientToken,
      userId
    });
    return response.data.user;  // ✅ Retourne l'user
  } catch (error) {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    return null;  // ✅ Retourne null si erreur
  }
}

export async function signout() {
  const clientToken = localStorage.getItem('clientToken');
  const userId = localStorage.getItem('userId');

  try {
    if (clientToken && userId) {
      await API.post("/auth/signout", {
        clientToken,
        userId
      });
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }

  // Nettoie le localStorage
  localStorage.removeItem('clientToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
}