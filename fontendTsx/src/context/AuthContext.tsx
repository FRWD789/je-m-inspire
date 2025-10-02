import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../service/authService';
import type { LoginCredentials, RegisterCredentials } from '../types/auth';

type User = {
  id: number;
  name: string;
  last_name?: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setAccessToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {


  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const data = await authService.refresh();
        if (isMounted) {
          setAccessToken(data.access_token);
          setUser(data.user);
        }
      } catch (error) {
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const data = await authService.login(credentials);
      setAccessToken(data.token);
      setUser(data.user);
   
    } catch (error) {
      // Re-throw to allow component-level error handling
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: RegisterCredentials) => {
    try {
      const data = await authService.register(userData);
      setAccessToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...userData };
    });
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
    updateUser,
    setAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};