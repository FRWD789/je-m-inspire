// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import RegisterForm from "./components/auth/RegisterForm";
import LoginForm from "./components/auth/LoginForm";
import { Navigation } from "./components/common/Navigation";
import { EventDashboard } from "./components/events/EventDashboard";
import PaymentPage from "./components/payment/PaymentPage";
import PaymentSuccess from "./components/payment/PaymentSuccess";
import PaymentCancel from "./components/payment/PaymentCancel";
import ProPlusPage from "./components/subscription/ProPlusPage";
import SubscriptionSuccess from "./components/subscription/SubscriptionSuccess";
import SubscriptionCancel from "./components/subscription/SubscriptionCancel";
import ProfilePage from "./components/profile/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
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
      <Routes>
        <Route path="/register" element={
          <RegisterForm
            onRegistrationSuccess={() => {
              setShowRegister(false);
            }}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        } />
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={
          <div>
            {showRegister ? (
              <RegisterForm
                onRegistrationSuccess={() => {
                  setShowRegister(false);
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
        } />
      </Routes>
    );
  }

  return (
    <div>
      <Navigation />
      <Routes>
        <Route path="/" element={<EventDashboard />} />
        <Route path="/dashboard" element={<EventDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        
        {/* Routes d'abonnement Pro Plus */}
        <Route path="/abonnement" element={<ProPlusPage />} />
        <Route path="/abonnement/success" element={<SubscriptionSuccess />} />
        <Route path="/abonnement/cancel" element={<SubscriptionCancel />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </div>
  );
}

export default App;