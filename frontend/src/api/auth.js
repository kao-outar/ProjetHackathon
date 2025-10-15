import axios from "axios";

const API = axios.create({
  baseURL: "https://hackathon-dorphs-projects.vercel.app/api",
  withCredentials: true,
});

export async function loginUser(email, password) {
  return API.post("/auth/login", { email, password });
}
