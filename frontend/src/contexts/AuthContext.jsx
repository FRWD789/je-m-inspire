// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// ✅ BASE URL sans /api à la fin
const BASE_URL = 'http://localhost:8000';

// ✅ Configuration de base pour les requêtes simples (sans intercepteur)
const apiSimple = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ✅ Configuration pour les requêtes authentifiées (avec intercepteurs)
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // ✅ Refs pour éviter les re-renders et gérer l'état de refresh
  const isRefreshingRef = useRef(false);
  const failedQueueRef = useRef([]);

  // ✅ ÉTAPE 1 : Initialisation - Charger l'utilisateur si token existe
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      
      if (!storedToken) {
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        // Récupérer les infos utilisateur avec le token stocké
        const response = await api.get('/api/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        
        if (isMounted) {
          setUser(response.data);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('❌ Initialisation échouée:', error);
        if (isMounted) {
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // ✅ Une seule fois au montage

  // ✅ ÉTAPE 2 : Intercepteur de requête - Ajouter le token
  useLayoutEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // Ne pas ajouter le token si c'est une retry ou si c'est /refresh ou /login
        if (config._retry || config.url === '/api/refresh' || config.url === '/api/login') {
          return config;
        }

        const currentToken = localStorage.getItem('access_token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // ✅ ÉTAPE 3 : Intercepteur de réponse - Gérer le refresh
  useLayoutEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // ✅ Conditions pour NE PAS tenter de refresh
        if (
          !error.response ||
          error.response.status !== 401 ||
          originalRequest._retry ||
          originalRequest.url === '/api/refresh' ||
          originalRequest.url === '/api/login' ||
          originalRequest.url === '/api/register'
        ) {
          return Promise.reject(error);
        }

        // ✅ Marquer cette requête comme "retry" pour éviter les boucles
        originalRequest._retry = true;

        // ✅ Si un refresh est déjà en cours, mettre cette requête en file d'attente
        if (isRefreshingRef.current) {
          return new Promise((resolve, reject) => {
            failedQueueRef.current.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        // ✅ Marquer qu'un refresh est en cours
        isRefreshingRef.current = true;

        try {
          console.log('🔄 Tentative de refresh du token...');
          
          // ✅ Utiliser apiSimple pour éviter l'intercepteur
          const response = await apiSimple.post('/api/refresh');
          const newToken = response.data.access_token;

          console.log('✅ Token refreshed avec succès');

          // ✅ Mettre à jour le token
          localStorage.setItem('access_token', newToken);
          setToken(newToken);

          // ✅ Résoudre toutes les requêtes en attente
          failedQueueRef.current.forEach((callback) => {
            callback.resolve(newToken);
          });
          failedQueueRef.current = [];

          // ✅ Retry la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);

        } catch (refreshError) {
          console.error('❌ Refresh token invalide ou expiré');

          // ✅ Rejeter toutes les requêtes en attente
          failedQueueRef.current.forEach((callback) => {
            callback.reject(refreshError);
          });
          failedQueueRef.current = [];

          // ✅ Déconnecter l'utilisateur
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);

          // ✅ Rediriger vers login
          window.location.href = '/login';

          return Promise.reject(refreshError);

        } finally {
          // ✅ Réinitialiser le flag de refresh
          isRefreshingRef.current = false;
        }
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []); // ✅ Pas de dépendances car on utilise des refs

  // ✅ ÉTAPE 4 : Fonctions d'authentification

  const login = async (email, password) => {
    try {
      const response = await apiSimple.post('/api/login', { email, password });
      const { token: accessToken, user: userData } = response.data;
      
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('access_token', accessToken);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Erreur réseau : Impossible de contacter le serveur');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Email ou mot de passe incorrect');
      }
      
      throw new Error(error.response?.data?.error || 'Erreur de connexion');
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiSimple.post('/api/register', userData);
      const { token: accessToken, user: newUser } = response.data;
      
      setToken(accessToken);
      setUser(newUser);
      localStorage.setItem('access_token', accessToken);
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        throw { message: errors, isValidation: true };
      }
      
      const errorMessage = error.response?.data?.error || 'Erreur d\'inscription';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('access_token');
      isRefreshingRef.current = false;
      failedQueueRef.current = [];
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Refresh user error:', error);
      logout();
      throw error;
    }
  };

  // ✅ Méthodes utilitaires pour les rôles
  const hasRole = (role) => {
    return user && user.roles && user.roles.some(r => r.role === role);
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };

  const isAdmin = () => hasRole('admin');
  const isProfessional = () => hasRole('professionnel');
  const isUser = () => hasRole('utilisateur');

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token && !!user,
    isInitialized,
    login,
    register,
    logout,
    refreshUser,
    setToken,
    hasRole,
    hasAnyRole,
    isAdmin,
    isProfessional,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useApi = () => {
  return {
    api,
    apiSimple,
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
    put: (url, data, config) => api.put(url, data, config),
    delete: (url, config) => api.delete(url, config),
    patch: (url, data, config) => api.patch(url, data, config),
  };
};