// contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useLayoutEffect, useContext } from "react";
import api, { apiSimple } from "../api"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('access_token');
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Au montage, on peut tenter de récupérer le profil user
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/api/me");
        console.log("User data:", res.data);
        setUser(res.data);
      } catch (err) {
        console.log("Not authenticated", err.message);
        setUser(null);
        setToken(null);
        localStorage.removeItem('access_token');
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    if (token) {
      fetchMe();
    } else {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [token]);

  // Intercepteur de requête : injecte le Bearer token
  useLayoutEffect(() => {
    const authInterceptor = api.interceptors.request.use((config) => {
      if (token && !config._retry) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(authInterceptor);
    };
  }, [token]);

  // Intercepteur de réponse : gère les 401 Unauthorized et refresh token
  useLayoutEffect(() => {
    const refreshInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (
          error.response?.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          
          try {
            const response = await api.post("/api/refresh");
            const newToken = response.data.access_token;
            
            setToken(newToken);
            localStorage.setItem('access_token', newToken);
            
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
            
          } catch (refreshError) {
            console.error("Refresh token invalid:", refreshError);
            logout();
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(refreshInterceptor);
    };
  }, []);

  // Fonctions d'authentification avec gestion d'erreurs améliorée
  const login = async (email, password) => {
    try {
      // Utiliser l'instance simple pour éviter les problèmes CORS sur login
      const response = await apiSimple.post('/api/login', { email, password });
      const { token: accessToken, user: userData } = response.data;
      
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('access_token', accessToken);
      
      return response.data;
    } catch (error) {
      console.error('Login error details:', error);
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Erreur réseau : Impossible de contacter le serveur');
      }
      
      if (error.message.includes('CORS')) {
        throw new Error('Erreur CORS : Vérifiez la configuration du serveur');
      }
      
      throw new Error(error.response?.data?.error || 'Erreur de connexion');
    }
  };

  const register = async (userData) => {
    try {
      // Utiliser l'instance simple pour l'inscription aussi
      const response = await apiSimple.post('/api/register', userData);
      const { token: accessToken, user: newUser } = response.data;
      
      setToken(accessToken);
      setUser(newUser);
      localStorage.setItem('access_token', accessToken);
      
      return response.data;
    } catch (error) {
      console.error('Registration error details:', error);
      
      // Gestion spécifique des erreurs réseau
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Erreur réseau : Impossible de contacter le serveur');
      }
      
      // Gestion des erreurs CORS
      if (error.message.includes('CORS') || error.message.includes('blocked')) {
        throw new Error('Erreur CORS : Vérifiez la configuration du serveur Laravel');
      }
      
      // Gestion des erreurs de validation Laravel
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        throw { message: errors, isValidation: true };
      }
      
      // Autres erreurs
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

  // Méthodes utilitaires pour les rôles
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
    apiSimple, // Exposer les deux instances
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
    put: (url, data, config) => api.put(url, data, config),
    delete: (url, config) => api.delete(url, config),
    patch: (url, data, config) => api.patch(url, data, config),
  };
};