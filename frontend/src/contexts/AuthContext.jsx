// frontend/src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
} from "react";
import axios from "axios";

const DEBUG = import.meta.env.DEV;
const debug = (...args) => {
  if (DEBUG) console.log(...args);
};
const debugError = (...args) => {
  if (DEBUG) console.error(...args);
};
const debugGroup = (...args) => {
  if (DEBUG) console.group(...args);
};
const debugGroupEnd = () => {
  if (DEBUG) console.groupEnd();
};

const AuthContext = createContext(null);

// ✅ Base URL
const BASE_URL = "";

// ===============================
// AXIOS INSTANCES
// ===============================
const apiSimple = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ===============================
// AUTH PROVIDER
// ===============================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const isRefreshingRef = useRef(false);
  const failedQueueRef = useRef([]);

  // ===============================
  // 1️⃣ INITIALISATION
  // ===============================
  useEffect(() => {
    debug('🚀 useEffect Initialisation DÉMARRE');
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      
      debug('1️⃣ Token trouvé:', !!storedToken);
      
      // ✅ Nouvelle logique : Si pas de token, tenter un refresh d'abord
      if (!storedToken) {
        debug('2️⃣ Pas d\'access token - Tentative de refresh avec le cookie...');
        
        try {
          // Essayer de refresh avec le cookie refresh_token
          const refreshResponse = await apiSimple.post('/api/refresh');
          const newToken = refreshResponse.data.access_token;
          
          debug('✅ Refresh réussi au démarrage !');
          localStorage.setItem('access_token', newToken);
          
          // Maintenant on peut charger l'utilisateur
          const userResponse = await api.get('/api/me', {
            headers: { Authorization: `Bearer ${newToken}` }
          });
          
          if (isMounted) {
            setUser(userResponse.data);
            setToken(newToken);
          }
        } catch (error) {
          debug('⚠️ Pas de session valide (refresh échoué)');
          // Pas de session valide, l'utilisateur doit se reconnecter
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
        return;
      }

      // Si on a un access token, on continue comme avant
      try {
        debug('3️⃣ Appel /api/me avec access token existant');
        const response = await api.get('/api/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        
        debug('4️⃣ Réponse reçue:', response.data);
        
        if (isMounted) {
          setUser(response.data);
          setToken(storedToken);
        }
      } catch (error) {
        debugError('5️⃣ Erreur:', error.message);
        if (isMounted) {
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          debug('6️⃣ AVANT setLoading(false)');
          setLoading(false);
          debug('7️⃣ APRÈS setLoading(false)');
          setIsInitialized(true);
          debug('8️⃣ Initialisation terminée');
        }
      }
    };

    initializeAuth();

    return () => {
      debug('🧹 Cleanup useEffect');
      isMounted = false;
    };
  }, []);

  // ===============================
  // 2️⃣ INTERCEPTEUR REQUEST
  // ===============================
  useLayoutEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const publicUrls = [
          "/api/login",
          "/api/refresh",
          "/api/register/user",
          "/api/register/professional",
        ];

        if (config._retry || publicUrls.includes(config.url)) return config;

        const currentToken = localStorage.getItem("access_token");
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

  // ===============================
  // 3️⃣ INTERCEPTEUR RESPONSE (REFRESH)
  // ===============================
  useLayoutEffect(() => {
    debug('🔧 AuthContext: Installation intercepteur RESPONSE');
    
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        debugGroup('❌ [RESPONSE INTERCEPTOR] Erreur détectée');
        debug('📍 Status:', error.response?.status);
        debug('📍 URL:', originalRequest?.url);
        debug('📍 Retry flag:', originalRequest?._retry);
        debug('📍 Response data:', error.response?.data);
        debugGroupEnd();

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
          debug('⏭️ Skip refresh - Conditions non remplies');
          return Promise.reject(error);
        }

        // ✅ Marquer cette requête comme "retry"
        originalRequest._retry = true;

        // ✅ Si un refresh est déjà en cours
        if (isRefreshingRef.current) {
          debug('⏳ Refresh déjà en cours, mise en file d\'attente');
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

        // ✅ Démarrer le refresh
        isRefreshingRef.current = true;
        debugGroup('🔄 ========== REFRESH TOKEN PROCESS START ==========');
        debug('⏰ Timestamp:', new Date().toLocaleTimeString());
        
        try {
          // Vérifier les cookies avant l'appel
          debug('🍪 Cookies disponibles:', document.cookie);
          
          debug('📤 Appel /api/refresh avec withCredentials');
          const response = await apiSimple.post('/api/refresh');
          
          debugGroup('✅ Réponse reçue');
          debug('📦 Response data:', response.data);
          debug('🍪 Response headers:', response.headers);
          debugGroupEnd();
          
          const newToken = response.data.access_token;

          if (!newToken) {
            debugError('❌ ERREUR: access_token manquant dans la réponse');
            throw new Error('Access token manquant dans la réponse');
          }

          debug('✅ Nouveau access token reçu:', newToken.substring(0, 50) + '...');

          // Mettre à jour le token
          localStorage.setItem('access_token', newToken);
          setToken(newToken);
          debug('💾 Token sauvegardé dans localStorage');

          // Résoudre toutes les requêtes en attente
          debug('📨 Résolution de', failedQueueRef.current.length, 'requêtes en attente');
          failedQueueRef.current.forEach((callback) => {
            callback.resolve(newToken);
          });
          failedQueueRef.current = [];

          // Retry la requête originale
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          debug('🔁 Retry de la requête originale:', originalRequest.url);
          debugGroupEnd();
          
          return api(originalRequest);

        } catch (refreshError) {
          debugGroup('❌ ========== REFRESH TOKEN ERROR ==========');
          debugError('Type d\'erreur:', refreshError.name);
          debugError('Message:', refreshError.message);
          debugError('Status:', refreshError.response?.status);
          debugError('Response data:', refreshError.response?.data);
          debugError('🍪 Cookies actuels:', document.cookie);
          debugGroupEnd();

          // Rejeter toutes les requêtes en attente
          failedQueueRef.current.forEach((callback) => {
            callback.reject(refreshError);
          });
          failedQueueRef.current = [];

          // Déconnecter l'utilisateur
          debug('🚪 Déconnexion de l\'utilisateur');
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);

          // Rediriger vers login
          debug('↪️ Redirection vers /login');
          window.location.href = '/login';

          return Promise.reject(refreshError);

        } finally {
          // Réinitialiser le flag
          isRefreshingRef.current = false;
          debug('🏁 Refresh terminé - Flag réinitialisé');
        }
      }
    );

    return () => {
      debug('🔧 AuthContext: Désinstallation intercepteur RESPONSE');
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // ===============================
  // 4️⃣ FONCTIONS AUTH
  // ===============================
  const login = async (email, password, recaptchaToken) => {
    try {
      const response = await apiSimple.post("/api/login", { 
        email, 
        password,
        recaptcha_token: recaptchaToken 
      });

      const { token: accessToken, refresh_token, user: userData } = response.data;

      localStorage.setItem("access_token", accessToken);
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token);

      setToken(accessToken);
      setUser(userData);

      return response.data;
    } catch (error) {
      debugError("Login error:", error.response?.data || error.message);
      if (error.response?.status === 403)
        throw new Error("Compte en attente d'approbation");
      throw new Error(error.response?.data?.error || "Erreur de connexion");
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/logout");
    } catch (e) {
      debugError("Logout error:", e.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      isRefreshingRef.current = false;
      failedQueueRef.current = [];
    }
  };

  const registerUser = async (formData) => {
    const response = await apiSimple.post("/api/register/user", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const { token: accessToken, refresh_token, user: newUser } = response.data;

    localStorage.setItem("access_token", accessToken);
    if (refresh_token) localStorage.setItem("refresh_token", refresh_token);

    setToken(accessToken);
    setUser(newUser);

    return response.data;
  };

  const registerProfessional = async (formData) => {
    // formData est déjà un FormData avec recaptcha_token inclus
    const response = await apiSimple.post("/api/register/professional", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return {
      status: "pending",
      message: response.data.message,
      user: response.data.user,
    };
  };

  const refreshUser = async () => {
    const response = await api.get("/api/me");
    setUser(response.data);
    return response.data;
  };

  // ===============================
  // 5️⃣ ROLE HELPERS
  // ===============================
  const hasRole = (role) =>
    user?.roles?.some((r) => r.role === role) ?? false;
  const hasAnyRole = (roles) => roles.some((r) => hasRole(r));
  const isAdmin = () => hasRole("admin");
  const isProfessional = () => hasRole("professionnel");
  const isUser = () => hasRole("utilisateur");

  // ===============================
  // 6️⃣ VALEUR CONTEXTE
  // ===============================
  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token && !!user,
    isInitialized,
    login,
    logout,
    registerUser,
    registerProfessional,
    refreshUser,
    hasRole,
    hasAnyRole,
    isAdmin,
    isProfessional,
    isUser,
  };

  // ===============================
  // 7️⃣ LOADER INITIAL
  // ===============================
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#f8f9fa",
        }}
      >
        <div style={{ fontSize: "3rem" }}>🔄</div>
        <p style={{ color: "#333" }}>Chargement de l'application...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

// ===============================
// 8️⃣ HOOKS
// ===============================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};

export const useApi = () => {
  const apiRef = useRef(api);
  const apiSimpleRef = useRef(apiSimple);

  return useMemo(
    () => ({
      api: apiRef.current,
      apiSimple: apiSimpleRef.current,
      get: (url, config) => apiRef.current.get(url, config),
      post: (url, data, config) => apiRef.current.post(url, data, config),
      put: (url, data, config) => apiRef.current.put(url, data, config),
      delete: (url, config) => apiRef.current.delete(url, config),
      patch: (url, data, config) => apiRef.current.patch(url, data, config),
    }),
    []
  );
};
