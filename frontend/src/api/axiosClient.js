import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  //withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const clientToken = localStorage.getItem('clientToken');
    const userId = localStorage.getItem('userId');
    if (clientToken && userId) {
      config.headers['x-client-token'] = clientToken;
      config.headers['x-user-id'] = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;