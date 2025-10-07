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
    console.log('🚀 useEffect Initialisation DÉMARRE');
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      
      console.log('1️⃣ Token trouvé:', !!storedToken);
      
      // ✅ Nouvelle logique : Si pas de token, tenter un refresh d'abord
      if (!storedToken) {
        console.log('2️⃣ Pas d\'access token - Tentative de refresh avec le cookie...');
        
        try {
          // Essayer de refresh avec le cookie refresh_token
          const refreshResponse = await apiSimple.post('/api/refresh');
          const newToken = refreshResponse.data.access_token;
          
          console.log('✅ Refresh réussi au démarrage !');
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
          console.log('⚠️ Pas de session valide (refresh échoué)');
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
        console.log('3️⃣ Appel /api/me avec access token existant');
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
    console.log('🔧 AuthContext: Installation intercepteur RESPONSE');
    
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        console.group('❌ [RESPONSE INTERCEPTOR] Erreur détectée');
        console.log('📍 Status:', error.response?.status);
        console.log('📍 URL:', originalRequest?.url);
        console.log('📍 Retry flag:', originalRequest?._retry);
        console.log('📍 Response data:', error.response?.data);
        console.groupEnd();

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
          console.log('⏭️ Skip refresh - Conditions non remplies');
          return Promise.reject(error);
        }

        // ✅ Marquer cette requête comme "retry"
        originalRequest._retry = true;

        // ✅ Si un refresh est déjà en cours
        if (isRefreshingRef.current) {
          console.log('⏳ Refresh déjà en cours, mise en file d\'attente');
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
        console.group('🔄 ========== REFRESH TOKEN PROCESS START ==========');
        console.log('⏰ Timestamp:', new Date().toLocaleTimeString());
        
        try {
          // Vérifier les cookies avant l'appel
          console.log('🍪 Cookies disponibles:', document.cookie);
          
          console.log('📤 Appel /api/refresh avec withCredentials');
          const response = await apiSimple.post('/api/refresh');
          
          console.group('✅ Réponse reçue');
          console.log('📦 Response data:', response.data);
          console.log('🍪 Response headers:', response.headers);
          console.groupEnd();
          
          const newToken = response.data.access_token;

          if (!newToken) {
            console.error('❌ ERREUR: access_token manquant dans la réponse');
            throw new Error('Access token manquant dans la réponse');
          }

          console.log('✅ Nouveau access token reçu:', newToken.substring(0, 50) + '...');

          // Mettre à jour le token
          localStorage.setItem('access_token', newToken);
          setToken(newToken);
          console.log('💾 Token sauvegardé dans localStorage');

          // Résoudre toutes les requêtes en attente
          console.log('📨 Résolution de', failedQueueRef.current.length, 'requêtes en attente');
          failedQueueRef.current.forEach((callback) => {
            callback.resolve(newToken);
          });
          failedQueueRef.current = [];

          // Retry la requête originale
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log('🔁 Retry de la requête originale:', originalRequest.url);
          console.groupEnd();
          
          return api(originalRequest);

        } catch (refreshError) {
          console.group('❌ ========== REFRESH TOKEN ERROR ==========');
          console.error('Type d\'erreur:', refreshError.name);
          console.error('Message:', refreshError.message);
          console.error('Status:', refreshError.response?.status);
          console.error('Response data:', refreshError.response?.data);
          console.error('🍪 Cookies actuels:', document.cookie);
          console.groupEnd();

          // Rejeter toutes les requêtes en attente
          failedQueueRef.current.forEach((callback) => {
            callback.reject(refreshError);
          });
          failedQueueRef.current = [];

          // Déconnecter l'utilisateur
          console.log('🚪 Déconnexion de l\'utilisateur');
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);

          // Rediriger vers login
          console.log('↪️ Redirection vers /login');
          window.location.href = '/login';

          return Promise.reject(refreshError);

        } finally {
          // Réinitialiser le flag
          isRefreshingRef.current = false;
          console.log('🏁 Refresh terminé - Flag réinitialisé');
        }
      }
    );

    return () => {
      console.log('🔧 AuthContext: Désinstallation intercepteur RESPONSE');
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // ===============================
  // 4️⃣ FONCTIONS AUTH
  // ===============================
  const login = async (email, password) => {
    try {
      const response = await apiSimple.post("/api/login", { email, password });
      const {
        token: accessToken,
        refresh_token,
        user: userData,
      } = response.data;

      localStorage.setItem("access_token", accessToken);
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token);

      setToken(accessToken);
      setUser(userData);

      return response.data;
    } catch (error) {
      if (error.code === "ERR_NETWORK")
        throw new Error("Erreur réseau : impossible de contacter le serveur");
      if (error.response?.status === 401)
        throw new Error("Email ou mot de passe incorrect");
      throw new Error(error.response?.data?.error || "Erreur de connexion");
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/logout");
    } catch (e) {
      console.error("Logout error:", e.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      isRefreshingRef.current = false;
      failedQueueRef.current = [];
    }
  };

  const registerUser = async (data) => {
    const response = await apiSimple.post("/api/register/user", data);
    const { token: accessToken, refresh_token, user: newUser } = response.data;

    localStorage.setItem("access_token", accessToken);
    if (refresh_token) localStorage.setItem("refresh_token", refresh_token);

    setToken(accessToken);
    setUser(newUser);

    return response.data;
  };

  const registerProfessional = async (data) => {
    const response = await apiSimple.post("/api/register/professional", data);
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
