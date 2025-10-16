import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://hackathon-livid-eight.vercel.app/api",
  //withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clientToken');
    const userUuid = localStorage.getItem('userUuid');
    if (token && userUuid) {
      config.headers['Authorization'] = 'Bearer ' + token;
      config.headers['X-User-UUID'] = userUuid;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;