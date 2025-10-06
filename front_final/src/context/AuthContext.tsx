import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, type Credentials, type RegisterCredentials } from "../service/AuthService";
import { useNavigate } from "react-router-dom";




interface User {
    name :string,
    email:string,
    role:string
}


interface AuthContextType {
    user:User |undefined
    accessToken:string |undefined
    login: (credentials: Credentials) => Promise<void>
    register: (credentials: RegisterCredentials) => Promise<void>
    setAccessToken:React.Dispatch<React.SetStateAction<string | undefined>>

}





const AuthContext = createContext<AuthContextType|undefined>(undefined)






export const AuthContextProvider = ({children}:{children:ReactNode})=>{

    const [user, setUser] = useState<User | undefined>(undefined);
    const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
    const navigate = useNavigate()

    const login = async (credentials:Credentials) => {
        
        const data = await authService.login(credentials);
        console.log(data)
        setAccessToken(data.token);
        setUser(data.user);
        navigate("/dashboard/profile")
      
    };
    const register = async (credentials:RegisterCredentials) =>{

        const data = await authService.register(credentials);
        console.log(data)
        navigate("/login",{replace:true})

    }
    
    useEffect(() => {
        console.log("Access token updated:", accessToken);
    }, [accessToken]);



    return (


        <AuthContext.Provider value={{user,accessToken,login,register,setAccessToken}}>
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


