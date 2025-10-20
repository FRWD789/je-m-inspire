import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { authService, type Credentials, type RegisterCredentials } from "../service/AuthService";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    user: any | undefined
    accessToken: string | undefined
    loading: boolean
    isAuthenticated: boolean // 👈 AJOUT
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
    const navigate = useNavigate()

    // 👇 AJOUT : Variable dérivée calculée automatiquement
    const isAuthenticated = useMemo(() => {
        return !!(accessToken && user);
    }, [accessToken, user]);

    useEffect(() => {
        if (accessToken) {
            setLoading(false);
        }
    }, [accessToken]);

    const logout = async () => {
        try {
            const data = await authService.logout();
            setUser(undefined);
            setAccessToken(undefined);
            console.log("✅ Utilisateur déconnecté avec succès");
            navigate("/")
        } catch (err) {
            console.error("Erreur réseau:", err);
        }
    }

    const updatePassword = async (payload: any) => {
        if (!accessToken) {
            console.error("Cannot update password — no token found");
            return;
        }

        try {
            const data = await authService.updatePassword(payload);
            console.log(data)
        } catch (err) {
            console.error("Erreur réseau:", err);
        }
    }

    const updateProfileImg = async (payload: any) => {
        if (!accessToken) {
            console.error("Cannot update profile image — no token found");
            return;
        }

        try {
            const data = await authService.updateProfile(payload, true)
            if (data.success) {
                setUser(data);
                console.log("✅ Image de profil mise à jour avec succès");
            } else {
                console.error("Erreur de mise à jour:", data.message);
            }
            return data
        } catch (err) {
            console.error("Erreur réseau:", err);
        }
    }

    const updateProfile = async (payload: any) => {
        if (!accessToken) {
            console.error("Cannot update profile — no token found");
            return;
        }
        setLoading(true)
        try {
            const data = await authService.updateProfile(payload);

            if (data.success) {
                setUser(data);
                console.log("✅ Profil mis à jour avec succès");
            } else {
                console.error("Erreur de mise à jour:", data.message);
            }
            return data
        } catch (err) {
            console.error("Erreur réseau:", err);
        } finally {
            setLoading(false)
        }
    }

    const login = async (credentials: Credentials) => {
        const data = await authService.login(credentials);
        setAccessToken(data.token);
        setUser(data.user);
    };

    const registerUser = async (credentials: RegisterCredentials) => {
        const data = await authService.register(credentials);
        console.log(data)
    }

    const registerPro = async (credentials: RegisterCredentials) => {
        const data = await authService.register(credentials, "professional");
        console.log(data)
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            accessToken,
            isAuthenticated, // 👈 AJOUT
            updatePassword,
            updateProfileImg,
            logout,
            setUser,
            updateProfile,
            login,
            registerUser,
            registerPro,
            setAccessToken
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }
    return context;
};