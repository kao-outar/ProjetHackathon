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
  localStorage.setItem('userUuid', response.data.user.uuid);
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
}

export async function verifyToken() {
  const clientToken = localStorage.getItem('clientToken');
  const userUuid = localStorage.getItem('userUuid');

  if (!clientToken || !userUuid) {
    return null;  // ✅ Retourne null si pas de token
  }

  try {
    const response = await API.post("/auth/verify", {
      clientToken,
      userUuid
    });
    return response.data.user;  // ✅ Retourne l'user
  } catch (error) {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('userUuid');
    localStorage.removeItem('user');
    return null;  // ✅ Retourne null si erreur
  }
}

export async function signout() {
  const clientToken = localStorage.getItem('clientToken');
  const userUuid = localStorage.getItem('userUuid');

  try {
    if (clientToken && userUuid) {
      await API.post("/auth/signout", {
        clientToken,
        userUuid
      });
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }

  // Nettoie le localStorage
  localStorage.removeItem('clientToken');
  localStorage.removeItem('userUuid');
  localStorage.removeItem('user');
}