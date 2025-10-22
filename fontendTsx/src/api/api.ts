import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const publicApi = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export const privateApi = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// ✅ AJOUT : Interceptor pour ajouter le token automatiquement
privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);