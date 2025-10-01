// contexts/AuthContext.jsx - VERSION CORRIGÉE
import React, { createContext, useState, useEffect, useLayoutEffect, useContext, useRef } from "react";
import api, { apiSimple } from "../api"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('access_token');
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // ✅ FIX 1: Flag pour empêcher les refreshs simultanés
  const isRefreshingRef = useRef(false);
  const refreshSubscribersRef = useRef([]);
  
  // ✅ FIX LOGOUT: Flag pour empêcher les logouts simultanés
  const isLoggingOutRef = useRef(false);

  // ✅ FIX 2: Fonction pour gérer les abonnés au refresh
  const subscribeTokenRefresh = (callback) => {
    refreshSubscribersRef.current.push(callback);
  };

  const onRefreshed = (newToken) => {
    refreshSubscribersRef.current.forEach(callback => callback(newToken));
    refreshSubscribersRef.current = [];
  };

  // ✅ FIX 3: useEffect amélioré avec flag pour éviter les appels multiples
  useEffect(() => {
    let isMounted = true;

    const fetchMe = async () => {
      try {
        const res = await api.get("/api/me");
        if (isMounted) {
          console.log("User data loaded:", res.data);
          setUser(res.data);
        }
      } catch (err) {
        if (isMounted) {
          console.log("Not authenticated", err.message);
          setUser(null);
          setToken(null);
          localStorage.removeItem('access_token');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    if (token && !user) { // ✅ Seulement si pas encore d'user
      fetchMe();
    } else if (!token) {
      setLoading(false);
      setIsInitialized(true);
    }

    return () => {
      isMounted = false;
    };
  }, [token]); // Dépendance token OK, mais avec vérification !user

  // ✅ FIX 4: Intercepteur de requête simplifié
  useLayoutEffect(() => {
    const authInterceptor = api.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem('access_token');
      if (currentToken && !config._retry) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(authInterceptor);
    };
  }, []);

  // ✅ FIX 5: Intercepteur de réponse avec gestion de file d'attente
  useLayoutEffect(() => {
    const refreshInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Vérifier si c'est une erreur 401 et pas déjà une retry
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== '/api/refresh' && // ✅ Éviter boucle sur refresh lui-même
          originalRequest.url !== '/api/login' // ✅ Éviter refresh sur login
        ) {
          originalRequest._retry = true;
          
          // ✅ Si un refresh est déjà en cours, attendre sa résolution
          if (isRefreshingRef.current) {
            return new Promise((resolve) => {
              subscribeTokenRefresh((newToken) => {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                resolve(api(originalRequest));
              });
            });
          }

          isRefreshingRef.current = true;

          try {
            console.log('🔄 Tentative de refresh du token...');
            const response = await api.post("/api/refresh");
            const newToken = response.data.access_token;
            
            console.log('✅ Token refreshed successfully');
            
            setToken(newToken);
            localStorage.setItem('access_token', newToken);
            
            isRefreshingRef.current = false;
            onRefreshed(newToken);
            
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
            
          } catch (refreshError) {
            console.error("❌ Refresh token invalid:", refreshError);
            isRefreshingRef.current = false;
            logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(refreshInterceptor);
    };
  }, []); // ✅ Pas de dépendances car on utilise refs

  // Fonctions d'authentification
  const login = async (email, password) => {
    try {
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
      const response = await apiSimple.post('/api/register', userData);
      const { token: accessToken, user: newUser } = response.data;
      
      setToken(accessToken);
      setUser(newUser);
      localStorage.setItem('access_token', accessToken);
      
      return response.data;
    } catch (error) {
      console.error('Registration error details:', error);
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Erreur réseau : Impossible de contacter le serveur');
      }
      
      if (error.message.includes('CORS') || error.message.includes('blocked')) {
        throw new Error('Erreur CORS : Vérifiez la configuration du serveur Laravel');
      }
      
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
      isRefreshingRef.current = false; // ✅ Reset du flag
      refreshSubscribersRef.current = []; // ✅ Clear des subscribers
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
    apiSimple, 
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
    put: (url, data, config) => api.put(url, data, config),
    delete: (url, config) => api.delete(url, config),
    patch: (url, data, config) => api.patch(url, data, config),
  };
};