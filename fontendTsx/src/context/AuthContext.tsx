import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import authService from '../service/authService';
import type { LoginCredentials, RegisterCredentials } from '../types/auth';
import { useNavigate } from 'react-router-dom';


type User = {
  id: number;
  name: string;
  email: string;
  role:string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  login: (credentials:LoginCredentials) => Promise<void>;
  register_user: (userData:RegisterCredentials) => Promise<void>;
  logout?: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  loading:boolean
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const didRun = useRef(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            console.log("im here")
          if (didRun.current) return; // persist across renders
            didRun.current = true;
        try {
            const data = await authService.refresh();
            setAccessToken(data.access_token);
            setUser(data.user);
        } catch {
            setAccessToken(null);
            setUser(null);
        }finally{
          setLoading(false);
        }
        };
        initAuth();

    }, []);
    const login = async (credentials:LoginCredentials) => {
        const data = await authService.login(credentials);
        console.log(data)
        setAccessToken(data.token);
        setUser(data.user);
    };
     const register_user = async (userData:RegisterCredentials) => {
        const data = await authService.register(userData);
        console.log(data)
        setAccessToken(data.token);
        setUser(data.user);
    };


  return (
    <AuthContext.Provider value={{ user, accessToken,loading,register_user, login, setAccessToken }}>
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