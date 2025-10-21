// fontendTsx/src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useMemo, useRef, type ReactNode } from "react";
import { authService, type Credentials, type RegisterCredentials } from "../service/AuthService";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Instance axios pour les appels simples (sans intercepteurs)
const apiSimple = axios.create({
    baseURL: "",
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // ✅ IMPORTANT pour les cookies
});

interface AuthContextType {
    user: any | undefined
    accessToken: string | undefined
    loading: boolean
    isAuthenticated: boolean
    isInitialized: boolean // ✅ AJOUT
    updatePassword: (payload: any) => Promise<void>
    updateProfileImg: (payload: any) => Promise<void>
    registerPro: (credentials: RegisterCredentials) => Promise<void>
    logout: () => Promise<void>
    login: (credentials: Credentials) => Promise<void>
    registerUser: (credentials: RegisterCredentials) => Promise<void>
    setUser: (value: React.SetStateAction<any | undefined>) => void
    updateProfile: (payload: any) => Promise<void>
    setAccessToken: React.Dispatch<React.SetStateAction<string | undefined>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | undefined>(undefined);
    const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false); // ✅ AJOUT
    const navigate = useNavigate();

    const isRefreshingRef = useRef(false);

    const isAuthenticated = useMemo(() => {
        return !!(accessToken && user);
    }, [accessToken, user]);

    // ✅ Fonction refresh interne (utilisée par l'intercepteur)
    const refreshAccessToken = async (): Promise<string> => {
        if (isRefreshingRef.current) {
            throw new Error("Refresh already in progress");
        }

        isRefreshingRef.current = true;

        try {
            console.log('🔄 Appel /api/refresh...');
            const response = await apiSimple.post('/api/refresh');
            
            const newToken = response.data.access_token;
            
            if (!newToken) {
                throw new Error('Access token manquant dans la réponse');
            }

            console.log('✅ Nouveau access token reçu');
            setAccessToken(newToken);
            
            return newToken;
        } catch (error) {
            console.error('❌ Erreur refresh token:', error);
            // Déconnecter l'utilisateur
            setAccessToken(undefined);
            setUser(undefined);
            throw error;
        } finally {
            isRefreshingRef.current = false;
        }
    };

    useEffect(() => {
        // Ne plus dépendre de accessToken, toujours vérifier au montage
        setLoading(false);
        setIsInitialized(true);
    }, []); // ✅ Vide : s'exécute une seule fois au montage

    const logout = async () => {
        try {
            await authService.logout();
            setUser(undefined);
            setAccessToken(undefined);
            console.log("✅ Utilisateur déconnecté avec succès");
            navigate("/");
        } catch (err) {
            console.error("Erreur logout:", err);
        }
    };

    const login = async (credentials: Credentials) => {
        try {
            const response = await authService.login(credentials);
            setAccessToken(response.token);
            setUser(response.user);
            console.log("✅ Connexion réussie");
        } catch (err) {
            console.error("Erreur login:", err);
            throw err;
        }
    };

    const registerUser = async (credentials: RegisterCredentials) => {
        try {
            const response = await authService.registerUser(credentials);
            setAccessToken(response.token);
            setUser(response.user);
            console.log("✅ Inscription réussie");
        } catch (err) {
            console.error("Erreur register:", err);
            throw err;
        }
    };

    const registerPro = async (credentials: RegisterCredentials) => {
        try {
            await authService.registerPro(credentials);
            console.log("✅ Inscription pro réussie (en attente d'approbation)");
        } catch (err) {
            console.error("Erreur register pro:", err);
            throw err;
        }
    };

    const updatePassword = async (payload: any) => {
        if (!accessToken) {
            console.error("Cannot update password — no token found");
            return;
        }

        try {
            await authService.updatePassword(payload);
            console.log("✅ Mot de passe mis à jour");
        } catch (err) {
            console.error("Erreur update password:", err);
            throw err;
        }
    };

    const updateProfileImg = async (payload: any) => {
        if (!accessToken) {
            console.error("Cannot update profile image — no token found");
            return;
        }

        try {
            const data = await authService.updateProfileImg(payload);
            setUser(data.user);
            console.log("✅ Image de profil mise à jour");
        } catch (err) {
            console.error("Erreur update profile img:", err);
            throw err;
        }
    };

    const updateProfile = async (payload: any) => {
        if (!accessToken) {
            console.error("Cannot update profile — no token found");
            return;
        }

        try {
            const data = await authService.updateProfile(payload);
            setUser(data.user);
            console.log("✅ Profil mis à jour");
        } catch (err) {
            console.error("Erreur update profile:", err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                loading,
                isAuthenticated,
                isInitialized, // ✅ AJOUT
                updatePassword,
                updateProfileImg,
                registerPro,
                logout,
                login,
                registerUser,
                setUser,
                updateProfile,
                setAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé dans un AuthContextProvider");
    }
    return context;
};