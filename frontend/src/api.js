// api.js - Configuration Axios avec deux instances
import axios from 'axios';

// Instance pour les appels avec cookies
export const apiSimple = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance pour les appels avec credentials (refresh token)
export const apiWithCredentials = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance par défaut
const api = apiWithCredentials;
export default api;