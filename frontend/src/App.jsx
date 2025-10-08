// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import RegisterForm from "./components/auth/RegisterForm";
import LoginForm from "./components/auth/LoginForm";
import Navigation from "./components/common/Navigation";
import { EventDashboard } from "./components/events/EventDashboard";
import PaymentPage from "./components/payment/PaymentPage";
import PaymentSuccess from "./components/payment/PaymentSuccess";
import PaymentCancel from "./components/payment/PaymentCancel";
import ProPlusPage from "./components/subscription/ProPlusPage";
import SubscriptionSuccess from "./components/subscription/SubscriptionSuccess";
import SubscriptionCancel from "./components/subscription/SubscriptionCancel";
import ProfilePage from "./components/profile/ProfilePage";
import LinkAccountSuccess from "./components/profile/LinkAccountSuccess";
import AdminCommissionsPage from './components/admin/AdminCommissionsPage';
import VendorEarningsPage from './components/vendor/VendorEarningsPage';
import MesRemboursementsPage from './components/remboursements/MesRemboursementsPage';
import {AdminRemboursements} from './components/remboursements/AdminRemboursements';
import RegisterUserForm from "./components/auth/RegisterUserForm";
import RegisterProfessionalForm from "./components/auth/RegisterProfessionnalForm";
import AdminApprovalPage from "./components/admin/AdminApprovalPage";
import EventCalendar from "./components/events/EventCalendar";

// Helper pour logs conditionnels
const DEBUG = import.meta.env.DEV;
const debug = (...args) => {
  if (DEBUG) console.log(...args);
};

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
  const { isAuthenticated, isInitialized, loading, user, hasRole } = useAuth();

  debug('🎨 AppContent render:', {
    isInitialized,
    loading,
    isAuthenticated,
    userEmail: user?.email
  });

  if (!isInitialized) {
    debug('⏳ AppContent attend isInitialized');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          Chargement de l'application...
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: '#666' 
        }}>
          Veuillez patienter
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  debug('✅ AppContent initialized - rendering routes');

  const ProtectedRoute = ({ children, requiredRole = null }) => {
    if (!isAuthenticated) {
      debug('🔒 ProtectedRoute: Non authentifié, redirect vers /login');
      return <Navigate to="/login" replace />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      debug('🚫 ProtectedRoute: Rôle requis non satisfait:', requiredRole);
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ fontSize: '48px' }}>🚫</div>
          <h2>Accès refusé</h2>
          <p>Vous n'avez pas les permissions nécessaires.</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Retour à l'accueil
          </button>
        </div>
      );
    }

    debug('✅ ProtectedRoute: Accès autorisé');
    return children;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {isAuthenticated && <Navigation />}
      
      <Routes>
        {/* ROUTES PUBLIQUES */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />
        } />
        
        <Route path="/register-user" element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterUserForm />
        } />
        
        <Route path="/register-professional" element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterProfessionalForm />
        } />
        
        {/* ROUTES PROTÉGÉES */}
        <Route path="/" element={
          <ProtectedRoute>
            <EventDashboard />
          </ProtectedRoute>
        } />

         <Route path="/payment/success" element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
        
        <Route path="/payment/cancel" element={
          <ProtectedRoute>
            <PaymentCancel />
          </ProtectedRoute>
        } />
        
        <Route path="/payment/:eventId" element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        } />
        
        <Route path="/abonnement" element={
          <ProtectedRoute>
            <ProPlusPage />
          </ProtectedRoute>
        } />
        
        <Route path="/abonnement/success" element={
          <ProtectedRoute>
            <SubscriptionSuccess />
          </ProtectedRoute>
        } />
        
        <Route path="/abonnement/cancel" element={
          <ProtectedRoute>
            <SubscriptionCancel />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/link-account-success" element={
          <ProtectedRoute>
            <LinkAccountSuccess />
          </ProtectedRoute>
        } />
        
        <Route path="/mes-remboursements" element={
          <ProtectedRoute>
            <MesRemboursementsPage />
          </ProtectedRoute>
        } />
        
        {/* ROUTES ADMIN */}
        <Route path="/admin/approvals" element={
          <ProtectedRoute requiredRole="admin">
            <AdminApprovalPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/commissions" element={
          <ProtectedRoute requiredRole="admin">
            <AdminCommissionsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/remboursements" element={
          <ProtectedRoute requiredRole="admin">
            <AdminRemboursements />
          </ProtectedRoute>
        } />
        
        {/* ROUTES VENDOR */}
        <Route path="/vendor/earnings" element={
          <ProtectedRoute requiredRole="professionnel">
            <VendorEarningsPage />
          </ProtectedRoute>
        } />

        <Route path="/calendar" element={<EventCalendar />} />
      </Routes>
    </div>
  );
}

export default App;