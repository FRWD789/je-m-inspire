import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, type Credentials, type RegisterCredentials } from "../service/AuthService";
import { useLocation, useNavigate } from "react-router-dom";







interface AuthContextType {
    user:any |undefined
    accessToken:string |undefined
    loading:boolean,
    registerPro: (credentials: RegisterCredentials) => Promise<void>
    logout: () => Promise<void>
    login: (credentials: Credentials) => Promise<void>
    registerUser: (credentials: RegisterCredentials) => Promise<void>
    setUser: (value: React.SetStateAction<any | undefined>) => void
    updateProfile:(payload: any) => Promise<void>
    setAccessToken:React.Dispatch<React.SetStateAction<string | undefined>>

}





const AuthContext = createContext<AuthContextType|undefined>(undefined)






export const AuthContextProvider = ({children}:{children:ReactNode})=>{

    const [user, setUser] = useState<any | undefined>(undefined);
    const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
        useEffect(() => {
            if (accessToken) {
                setLoading(false);
            }
        }, [accessToken]);
        const logout = async ()=>{
            try {
                const data = await authService.logout();
                setUser(undefined);
                setAccessToken(undefined);
                console.log("✅ utlusateur deconecter  avec succès");
            } catch (err) {
            console.error("Erreur réseau:", err);
            }
        }
    const updateProfile = async (payload:any) => {
        
        if (!accessToken) {
            console.error("Cannot update profile — no token found");
            return;
        }

        try {
        const data = await authService.updateProfile(payload);

            if (data.success) {
                setUser(data.user);
                console.log("✅ Profil mis à jour avec succès");
            } else {
                console.error("Erreur de mise à jour:", data.message);
            }
        } catch (err) {
        console.error("Erreur réseau:", err);
        }
    }

    const login = async (credentials:Credentials) => {
        
            const data = await authService.login(credentials);
            setAccessToken(data.token);
            setUser(data.user);
   
      
    };
    const registerUser = async (credentials:RegisterCredentials) =>{

        const data = await authService.register(credentials);
        console.log(data)


    }
      const registerPro = async (credentials:RegisterCredentials) =>{
        const data = await authService.register(credentials,"professional");
        console.log(data)
    }
    
    



    return (


        <AuthContext.Provider value={{user,loading,accessToken,logout,setUser,updateProfile,login,registerUser,registerPro,setAccessToken}}>
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


