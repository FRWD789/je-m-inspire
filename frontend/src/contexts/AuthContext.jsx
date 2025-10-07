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
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("access_token");

      if (!storedToken) {
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
        return;
      }

      try {
        const response = await api.get("/api/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (isMounted) {
          setUser(response.data);
          setToken(storedToken);
        }
      } catch (error) {
        console.error("❌ Auth init error:", error.message);
        if (isMounted) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
          setToken(null);
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
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        const noRefreshUrls = [
          "/api/login",
          "/api/refresh",
          "/api/register/user",
          "/api/register/professional",
          "/api/logout",
        ];

        if (
          !status ||
          status !== 401 ||
          originalRequest._retry ||
          noRefreshUrls.includes(originalRequest.url)
        ) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshingRef.current) {
          return new Promise((resolve, reject) => {
            failedQueueRef.current.push({ resolve, reject });
          })
            .then((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshingRef.current = true;

        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) throw new Error("Missing refresh token");

          const response = await apiSimple.post("/api/refresh", {
            refresh_token: refreshToken,
          });

          const { access_token: newToken, refresh_token: newRefresh } =
            response.data;

          localStorage.setItem("access_token", newToken);
          if (newRefresh) localStorage.setItem("refresh_token", newRefresh);
          setToken(newToken);

          failedQueueRef.current.forEach((cb) => cb.resolve(newToken));
          failedQueueRef.current = [];

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("❌ Refresh token invalide :", refreshError.message);

          failedQueueRef.current.forEach((cb) => cb.reject(refreshError));
          failedQueueRef.current = [];

          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
          setToken(null);

          // redirection propre
          window.location.replace("/login");
          return Promise.reject(refreshError);
        } finally {
          isRefreshingRef.current = false;
        }
      }
    );

    return () => {
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
