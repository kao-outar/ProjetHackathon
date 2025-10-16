import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://hackathon-livid-eight.vercel.app/api",
  //withCredentials: true,
});

export default API;