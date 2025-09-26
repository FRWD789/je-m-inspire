// App.jsx
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, useApi } from './contexts/AuthContext';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import { Navigation } from './components/Navigation';
import { EventDashboard } from './components/events/EventDashboard';


// Composant principal de l'application
const AppContent = () => {
    const { isAuthenticated, loading, isInitialized } = useAuth();
    const [showRegister, setShowRegister] = useState(false);

    if (!isInitialized || loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>Chargement de l'application...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div>
                {showRegister ? (
                    <RegisterForm 
                        onRegistrationSuccess={() => setShowRegister(false)}
                        onSwitchToLogin={() => setShowRegister(false)}
                    />
                ) : (
                    <div>
                        <LoginForm />
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <span>Pas encore de compte ? </span>
                            <button 
                                onClick={() => setShowRegister(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#007bff',
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
};

// App principale avec le Provider
const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;