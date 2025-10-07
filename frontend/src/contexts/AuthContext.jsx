// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// ✅ BASE URL sans /api à la fin
const BASE_URL = 'http://localhost:8000';

console.log('🔧 AuthContext: Création des instances Axios');

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
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('access_token');
    console.log('🔧 AuthContext: Token initial:', storedToken ? 'EXISTS' : 'NULL');
    return storedToken;
  });
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // ✅ Refs pour éviter les re-renders et gérer l'état de refresh
  const isRefreshingRef = useRef(false);
  const failedQueueRef = useRef([]);

  console.log('🔄 RENDER AuthProvider', { loading, user: user?.email });

  // ✅ ÉTAPE 1 : Initialisation - Charger l'utilisateur si token existe
  useEffect(() => {
    console.log('🚀 useEffect Initialisation DÉMARRE');
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      
      console.log('1️⃣ Token trouvé:', !!storedToken);
      
      if (!storedToken) {
        console.log('2️⃣ Pas de token - setLoading(false)');
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
        return;
      }

      try {
        console.log('3️⃣ Appel /api/me');
        const response = await api.get('/api/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        
        console.log('4️⃣ Réponse reçue:', response.data);
        
        if (isMounted) {
          setUser(response.data);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('5️⃣ Erreur:', error.message);
        if (isMounted) {
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          console.log('6️⃣ AVANT setLoading(false)');
          setLoading(false);
          console.log('7️⃣ APRÈS setLoading(false)');
          setIsInitialized(true);
          console.log('8️⃣ Initialisation terminée');
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Cleanup useEffect');
      isMounted = false;
    };
  }, []);

  // ✅ ÉTAPE 2 : Intercepteur de requête - Ajouter le token
  useLayoutEffect(() => {
    console.log('🔧 AuthContext: Installation intercepteur REQUEST');
    
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        console.log('📤 [REQUEST INTERCEPTOR]', {
          url: config.url,
          method: config.method,
          retry: config._retry
        });

        // URLs qui ne nécessitent pas de token
        const publicUrls = [
          '/api/refresh',
          '/api/login',
          '/api/register/user',
          '/api/register/professional'
        ];

        // Ne pas ajouter le token si c'est une retry ou une URL publique
        if (config._retry || publicUrls.includes(config.url)) {
          console.log('⏭️ Skip token injection pour:', config.url);
          return config;
        }

        const currentToken = localStorage.getItem('access_token');
        
        console.log('🔑 Token check:', {
          exists: !!currentToken,
          preview: currentToken ? currentToken.substring(0, 30) + '...' : 'NULL'
        });

        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
          console.log('✅ Token ajouté au header');
        } else {
          console.error('❌ AUCUN TOKEN DISPONIBLE !');
        }

        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    return () => {
      console.log('🔧 AuthContext: Désinstallation intercepteur REQUEST');
      api.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // ✅ ÉTAPE 3 : Intercepteur de réponse - Gérer le refresh
  useLayoutEffect(() => {
    console.log('🔧 AuthContext: Installation intercepteur RESPONSE');
    
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        console.log('❌ [RESPONSE INTERCEPTOR] Erreur détectée:', {
          status: error.response?.status,
          url: originalRequest?.url,
          retry: originalRequest?._retry
        });

        // URLs qui ne déclenchent pas de refresh
        const noRefreshUrls = [
          '/api/refresh',
          '/api/login',
          '/api/register/user',
          '/api/register/professional'
        ];

        // ✅ Conditions pour NE PAS tenter de refresh
        if (
          !error.response ||
          error.response.status !== 401 ||
          originalRequest._retry ||
          noRefreshUrls.includes(originalRequest.url)
        ) {
          console.log('⏭️ Skip refresh, rejet de l\'erreur');
          return Promise.reject(error);
        }

        // ✅ Marquer cette requête comme "retry" pour éviter les boucles
        originalRequest._retry = true;

        // ✅ Si un refresh est déjà en cours, mettre cette requête en file d'attente
        if (isRefreshingRef.current) {
          console.log('⏳ Refresh en cours, mise en file d\'attente');
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
        console.log('🔄 Démarrage du refresh...');

        try {
          console.log('📤 Appel /api/refresh');
          
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
          console.log('✅ Refresh terminé');
        }
      }
    );

    return () => {
      console.log('🔧 AuthContext: Désinstallation intercepteur RESPONSE');
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // ✅ ÉTAPE 4 : Fonctions d'authentification

  const login = async (email, password) => {
    console.log('🔐 Tentative de login pour:', email);
    
    try {
      const response = await apiSimple.post('/api/login', { email, password });
      const { token: accessToken, user: userData } = response.data;
      
      console.log('✅ Login réussi:', {
        hasToken: !!accessToken,
        tokenPreview: accessToken?.substring(0, 30) + '...',
        user: userData
      });
      
      localStorage.setItem('access_token', accessToken);
      console.log('💾 Token sauvegardé dans localStorage');
      
      setToken(accessToken);
      setUser(userData);
      
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Erreur réseau : Impossible de contacter le serveur');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Email ou mot de passe incorrect');
      }

      if (error.response?.status === 403) {
        throw new Error(error.response.data.error || 'Compte non autorisé');
      }
      
      throw new Error(error.response?.data?.error || 'Erreur de connexion');
    }
  };

  /**
   * Inscription pour utilisateur régulier
   */
  const registerUser = async (userData) => {
    console.log('📝 Tentative d\'inscription utilisateur');
    
    try {
      const response = await apiSimple.post('/api/register/user', userData);
      const { token: accessToken, user: newUser } = response.data;
      
      console.log('✅ Inscription utilisateur réussie');
      
      setToken(accessToken);
      setUser(newUser);
      localStorage.setItem('access_token', accessToken);
      
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        throw { message: errors, isValidation: true };
      }
      
      const errorMessage = error.response?.data?.error || 'Erreur d\'inscription';
      throw new Error(errorMessage);
    }
  };

  /**
   * Inscription pour professionnel (nécessite approbation)
   */
  const registerProfessional = async (userData) => {
    console.log('📝 Tentative d\'inscription professionnel');
    
    try {
      const response = await apiSimple.post('/api/register/professional', userData);
      
      console.log('✅ Demande professionnel envoyée:', response.data);
      
      // Ne PAS connecter automatiquement - le compte doit être approuvé
      return {
        status: 'pending',
        message: response.data.message,
        user: response.data.user
      };
    } catch (error) {
      console.error('❌ Professional registration error:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        throw { message: errors, isValidation: true };
      }
      
      const errorMessage = error.response?.data?.error || 'Erreur d\'inscription professionnel';
      throw new Error(errorMessage);
    }
  };

  /**
   * Fonction générique register (pour compatibilité)
   * Détermine automatiquement le type d'inscription
   */
  const register = async (userData) => {
    if (userData.role === 'professionnel') {
      return registerProfessional(userData);
    } else {
      return registerUser(userData);
    }
  };

  const logout = async () => {
    console.log('👋 Déconnexion');
    
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
      console.log('✅ Déconnexion terminée');
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
    registerUser,
    registerProfessional,
    logout,
    refreshUser,
    setToken,
    hasRole,
    hasAnyRole,
    isAdmin,
    isProfessional,
    isUser,
  };

  // ✅ AJOUT DU LOADER
  console.log('👁️ Avant return - loading:', loading);

  if (loading) {
    console.log('⏳ Affichage du loader');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '15px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ fontSize: '3rem' }}>🔄</div>
        <div style={{ fontSize: '1.2rem', color: '#333', fontWeight: '500' }}>
          Chargement de l'application...
        </div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          Vérification de l'authentification
        </div>
      </div>
    );
  }

  console.log('✅ Affichage des children');
  
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
  const apiRef = useRef(api);
  const apiSimpleRef = useRef(apiSimple);

  return useMemo(() => ({
    api: apiRef.current,
    apiSimple: apiSimpleRef.current,
    get: (url, config) => apiRef.current.get(url, config),
    post: (url, data, config) => apiRef.current.post(url, data, config),
    put: (url, data, config) => apiRef.current.put(url, data, config),
    delete: (url, config) => apiRef.current.delete(url, config),
    patch: (url, data, config) => apiRef.current.patch(url, data, config),
  }), []);
};