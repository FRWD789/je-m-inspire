// src/App.jsx
import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth, useApi } from "./contexts/AuthContext";
import RegisterForm from "./components/auth/RegisterForm";
import LoginForm from "./components/auth/LoginForm";
import { Navigation } from "./components/common/Navigation";
import { EventDashboard } from "./components/events/EventDashboard";

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        {showRegister ? (
          <RegisterForm
            onRegistrationSuccess={() => {
              setShowRegister(false);
              // L'utilisateur sera automatiquement connecté après l'inscription
            }}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <div>
            <LoginForm />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ color: '#666' }}>Pas encore de compte ? </span>
              <button 
                onClick={() => setShowRegister(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3498db',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                S'inscrire
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <EventDashboard />
    </div>
  );
}

export default App;