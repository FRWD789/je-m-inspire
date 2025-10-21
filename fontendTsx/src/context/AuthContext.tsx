// frontend/src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";

// ===============================
// TYPES & INTERFACES
// ===============================
interface Role {
  id: number;
  role: string;
  description?: string;
}

interface User {
  id: number;
  name: string;
  last_name?: string;
  email: string;
  city?: string;
  date_of_birth?: string;
  profile_picture?: string;
  is_approved: boolean;
  roles?: Role[];
}

interface LoginCredentials {
  email: string;
  password: string;
  recaptcha_token: string;
}

interface LoginResponse {
  token: string;
  refresh_token?: string;
  user: User;
  expires_in?: number;
}

interface RegisterResponse {
  status?: string;
  message?: string;
  user?: User;
  token?: string;
  refresh_token?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, password: string, recaptchaToken: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  registerUser: (formData: FormData) => Promise<LoginResponse>;
  registerProfessional: (formData: FormData) => Promise<RegisterResponse>;
  refreshUser: () => Promise<User>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isProfessional: () => boolean;
  isUser: () => boolean;
  updateProfile: (formData: FormData) => Promise<any>;
  updateProfileImg: (formData: FormData) => Promise<any>;
  updatePassword: (payload: { current_password: string; new_password: string; new_password_confirmation: string }) => Promise<void>;
}

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

// ===============================
// DEBUG UTILITIES
// ===============================
const DEBUG = import.meta.env.DEV;
const debug = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};
const debugError = (...args: any[]) => {
  if (DEBUG) console.error(...args);
};
const debugGroup = (...args: any[]) => {
  if (DEBUG) console.group(...args);
};
const debugGroupEnd = () => {
  if (DEBUG) console.groupEnd();
};

// ===============================
// CONTEXT
// ===============================
const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Base URL
const BASE_URL = "http://localhost:8000";

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
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const isRefreshingRef = useRef(false);
  const failedQueueRef = useRef<QueueItem[]>([]);

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
          const refreshResponse = await apiSimple.post<{ access_token: string }>('/api/refresh');
          const newToken = refreshResponse.data.access_token;
          
          debug('✅ Refresh réussi au démarrage !');
          localStorage.setItem('access_token', newToken);
          
          // Maintenant on peut charger l'utilisateur
          const userResponse = await api.get<User>('/api/me', {
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
        const response = await api.get<User>('/api/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        
        debug('4️⃣ Réponse reçue:', response.data);
        
        if (isMounted) {
          setUser(response.data);
          setToken(storedToken);
        }
      } catch (error) {
        debugError('5️⃣ Erreur:', (error as Error).message);
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
      (config: InternalAxiosRequestConfig) => {
        const publicUrls = [
          "/api/login",
          "/api/refresh",
          "/api/register/user",
          "/api/register/professional",
        ];

        if ((config as any)._retry || publicUrls.includes(config.url || '')) return config;

        const currentToken = localStorage.getItem("access_token");
        if (currentToken && config.headers) {
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
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

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
          noRefreshUrls.includes(originalRequest.url || '')
        ) {
          debug('⏭️ Skip refresh - Conditions non remplies');
          return Promise.reject(error);
        }

        // ✅ Marquer cette requête comme "retry"
        originalRequest._retry = true;

        // ✅ Si un refresh est déjà en cours
        if (isRefreshingRef.current) {
          debug('⏳ Refresh déjà en cours, mise en file d\'attente');
          return new Promise<string>((resolve, reject) => {
            failedQueueRef.current.push({ resolve, reject });
          })
            .then((newToken) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
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
          const response = await apiSimple.post<{ access_token: string }>('/api/refresh');
          
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
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          debug('🔁 Retry de la requête originale:', originalRequest.url);
          debugGroupEnd();
          
          return api(originalRequest);

        } catch (refreshError) {
          debugGroup('❌ ========== REFRESH TOKEN ERROR ==========');
          debugError('Type d\'erreur:', (refreshError as Error).name);
          debugError('Message:', (refreshError as Error).message);
          debugError('Status:', (refreshError as AxiosError).response?.status);
          debugError('Response data:', (refreshError as AxiosError).response?.data);
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
  const login = async (email: string, password: string, recaptchaToken: string): Promise<LoginResponse> => {
    try {
      const response = await apiSimple.post<LoginResponse>("/api/login", { 
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
      const axiosError = error as AxiosError<{ error?: string }>;
      debugError("Login error:", axiosError.response?.data || axiosError.message);
      if (axiosError.response?.status === 403)
        throw new Error("Compte en attente d'approbation");
      throw new Error(axiosError.response?.data?.error || "Erreur de connexion");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/api/logout");
    } catch (e) {
      debugError("Logout error:", (e as Error).message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      isRefreshingRef.current = false;
      failedQueueRef.current = [];
    }
  };

  const registerUser = async (formData: FormData): Promise<LoginResponse> => {
    const response = await apiSimple.post<LoginResponse>("/api/register/user", formData, {
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

  const registerProfessional = async (formData: FormData): Promise<RegisterResponse> => {
    // formData est déjà un FormData avec recaptcha_token inclus
    const response = await apiSimple.post<RegisterResponse>("/api/register/professional", formData, {
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

  const refreshUser = async (): Promise<User> => {
    const response = await api.get<User>("/api/me");
    setUser(response.data);
    return response.data;
  };

  const updateProfile = async (formData: FormData): Promise<any> => {
    try {
      const response = await api.post<any>("/api/profile/update", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Mettre à jour l'utilisateur dans le state
      if (response.data.user) {
        setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      debugError("Update profile error:", axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error || "Erreur lors de la mise à jour du profil");
    }
  };

  const updateProfileImg = async (formData: FormData): Promise<any> => {
    try {
      const response = await api.post<any>("/api/profile/update", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Mettre à jour l'utilisateur dans le state
      if (response.data.user) {
        setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      debugError("Update profile image error:", axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error || "Erreur lors de la mise à jour de l'image");
    }
  };

  const updatePassword = async (payload: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<void> => {
    try {
      await api.put("/api/profile/update-password", payload);
      debug("✅ Mot de passe mis à jour avec succès");
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      debugError("Update password error:", axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error || axiosError.response?.data?.message || "Erreur lors de la mise à jour du mot de passe");
    }
  };

  // ===============================
  // 5️⃣ ROLE HELPERS
  // ===============================
  const hasRole = (role: string): boolean =>
    user?.roles?.some((r) => r.role === role) ?? false;
  
  const hasAnyRole = (roles: string[]): boolean => 
    roles.some((r) => hasRole(r));
  
  const isAdmin = (): boolean => hasRole("admin");
  const isProfessional = (): boolean => hasRole("professionnel");
  const isUser = (): boolean => hasRole("utilisateur");

  // ===============================
  // 6️⃣ VALEUR CONTEXTE
  // ===============================
  const value: AuthContextType = {
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
    updateProfile,
    updateProfileImg,
    updatePassword,
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
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};

interface UseApiReturn {
  api: AxiosInstance;
  apiSimple: AxiosInstance;
  get: <T = any>(url: string, config?: any) => Promise<{ data: T }>;
  post: <T = any>(url: string, data?: any, config?: any) => Promise<{ data: T }>;
  put: <T = any>(url: string, data?: any, config?: any) => Promise<{ data: T }>;
  delete: <T = any>(url: string, config?: any) => Promise<{ data: T }>;
  patch: <T = any>(url: string, data?: any, config?: any) => Promise<{ data: T }>;
}

export const useApi = (): UseApiReturn => {
  const apiRef = useRef(api);
  const apiSimpleRef = useRef(apiSimple);

  return useMemo(
    () => ({
      api: apiRef.current,
      apiSimple: apiSimpleRef.current,
      get: <T = any>(url: string, config?: any) => apiRef.current.get<T>(url, config),
      post: <T = any>(url: string, data?: any, config?: any) => apiRef.current.post<T>(url, data, config),
      put: <T = any>(url: string, data?: any, config?: any) => apiRef.current.put<T>(url, data, config),
      delete: <T = any>(url: string, config?: any) => apiRef.current.delete<T>(url, config),
      patch: <T = any>(url: string, data?: any, config?: any) => apiRef.current.patch<T>(url, data, config),
    }),
    []
  );
};