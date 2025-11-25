import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Credentials, LoginResponse, RegisterCredentials, User } from "@/types/user";
import { tokenService } from "@/features/auth/service/TokenService";
import { authService } from "@/features/auth/service/authService";
interface AuthContextType {
  user: User | undefined;
  accessToken: string | undefined;
  loading: boolean;
  requiresOnboarding: boolean;
  updatePassword: (payload: any) => Promise<void>;
  updateProfileImg: (payload: any) => Promise<any>;
  googleLogin : (code: string) => Promise<any>;
  registerPro: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  login: (credentials: Credentials) => Promise<void>;
  registerUser: (credentials: RegisterCredentials) => Promise<void>;
  setUser: (value: React.SetStateAction<User | undefined>) => void;
  updateProfile: (payload: any) => Promise<any>;
  setAccessToken: React.Dispatch<React.SetStateAction<string | undefined>>;
  hasProPlus: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);
   const [hasProPlus, setHasProPlus] = useState<boolean>(false);
  const navigate = useNavigate();



  useEffect(() => {
    tokenService.set(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const checkProPlus = async () => {
      if (user) {
        try {
          const subscription = await authService.getSubscription();
          setHasProPlus(subscription); // true ou false
        } catch (err) {
          console.error("Erreur récupération abonnement Pro Plus:", err);
          setHasProPlus(false);
        }
      }
    };
    checkProPlus();
  }, [user]);
  
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Erreur déconnexion API:", err);
      // Continue with client-side logout even if API call fails
    } finally {
      // Always clear client state
      setUser(undefined);
      setAccessToken(undefined);
      tokenService.clear(); // also clear the global token
      setRequiresOnboarding(false);
      navigate("/");
    }
  };

  const updatePassword = async (payload: any): Promise<void> => {
    if (!accessToken) {
      console.error("Cannot update password — no token found");
      throw new Error("No authentication token");
    }
    try {
      const data = await authService.updatePassword(payload);
      console.log("✅ Mot de passe mis à jour:", data);
    } catch (err) {
      console.error("Erreur mise à jour mot de passe:", err);
      throw err;
    }
  };

  const updateProfileImg = async (payload: any): Promise<any> => {
    if (!accessToken) {
      console.error("Cannot update profile — no token found");
      throw new Error("No authentication token");
    }
    try {
      const data = await authService.updateProfile(payload, true);
      if (data.success) {

        setUser(data);
        console.log("✅ Photo de profil mise à jour avec succès");
      }
      return data;
    } catch (err) {
      console.error("Erreur mise à jour photo:", err);
      throw err;
    }
  };

  const updateProfile = async (payload: any): Promise<any> => {
    if (!accessToken) {
      console.error("Cannot update profile — no token found");
      throw new Error("No authentication token");
    }
    setLoading(true);
    try {
      const data = await authService.updateProfile(payload);
      if (data.success) {
        setUser(data);
        console.log("✅ Profil mis à jour avec succès");
      }
      return data;
    } catch (err) {
      console.error("Erreur mise à jour profil:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: Credentials): Promise<void> => {
    setLoading(true);
    try {
      const response: LoginResponse = await authService.login(credentials);
      setAccessToken(response.access_token);
      setUser(response.user);
      setRequiresOnboarding(response.requires_onboarding);
      console.log("✅ Connexion réussie");
    } catch (err) {
      console.error("Erreur connexion:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  const googleLogin = async (code: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await authService.googleCallback(code);
      setAccessToken(response.access_token);
      setUser(response.user);
      console.log("✅ Google login successful");
      navigate("/dashboard"); 
    } catch (err) {
      console.error("Erreur Google Login:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      const d={...credentials,role:'user'}
      const data = await authService.register(d);
      console.log("✅ Inscription utilisateur réussie:", data);
    } catch (err) {
      console.error("Erreur inscription:", err);
      throw err;
    }
  };

  const registerPro = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      const data = await authService.register(credentials, "professional");
      console.log("✅ Inscription professionnel réussie:", data);
    } catch (err) {
      console.error("Erreur inscription pro:", err);
      throw err;
    }
  };

  

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      accessToken,
      requiresOnboarding,
      googleLogin,
      updatePassword,
      updateProfileImg,
      logout,
      setUser,
      updateProfile,
      login,
      registerUser,
      registerPro,
      setAccessToken,
      hasProPlus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};