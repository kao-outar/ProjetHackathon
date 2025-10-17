import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://projet-hackathon-z48d.vercel.app/api",
});

// ✅ Intercepteur pour ajouter automatiquement les headers d’authentification
API.interceptors.request.use(
  (config) => {
    const clientToken = localStorage.getItem("clientToken");
    const user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;

    // ✅ Utilisation du bon identifiant depuis la BDD
    const userId = user?.id || user?._id; // le backend renvoie "id"

    if (clientToken) {
      config.headers["x-client-token"] = clientToken;
    }

    if (userId) {
      config.headers["x-user-id"] = userId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
