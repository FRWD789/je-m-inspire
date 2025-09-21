// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isProfessional = () => user?.role?.name === 'professional';
  const isUser = () => user?.role?.name === 'user';
  const isAdmin = () => user?.role?.name === 'admin';

  // ... logique auth

  return (
    <AuthContext.Provider value={{
      user,
      isProfessional,
      isUser,
      isAdmin,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};