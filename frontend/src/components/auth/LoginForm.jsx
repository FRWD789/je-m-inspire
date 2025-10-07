import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    // ✅ Afficher le message si redirection depuis inscription professionnel
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await login(credentials.email, credentials.password);
            console.log('✅ Connexion réussie');
            
            // ✅ Redirection vers la page d'accueil après connexion
            navigate('/', { replace: true });
            
        } catch (err) {
            console.error('❌ Erreur connexion:', err);
            setError(err.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                display: 'flex',
                maxWidth: '1000px',
                width: '100%',
                minHeight: '600px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                {/* Formulaire à gauche */}
                <div style={{ 
                    flex: '1',
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <h2 style={{
                        textAlign: 'center',
                        marginBottom: '10px',
                        color: '#333',
                        fontSize: '24px'
                    }}>
                        Connexion
                    </h2>
                    <p style={{
                        textAlign: 'center',
                        color: '#666',
                        marginBottom: '30px',
                        fontSize: '14px'
                    }}>
                        Connectez-vous à votre compte
                    </p>

                    {/* ✅ Message de succès */}
                    {successMessage && (
                        <div style={{
                            color: '#27ae60',
                            marginBottom: '20px',
                            padding: '12px',
                            backgroundColor: '#d4edda',
                            borderRadius: '4px',
                            fontSize: '14px',
                            textAlign: 'center',
                            border: '1px solid #c3e6cb'
                        }}>
                            {successMessage}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                color: '#333',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={credentials.email}
                                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                color: '#333',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>

                        {error && (
                            <div style={{ 
                                color: '#d32f2f', 
                                marginBottom: '20px',
                                padding: '10px',
                                backgroundColor: '#ffebee',
                                borderRadius: '4px',
                                fontSize: '14px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                backgroundColor: loading ? '#999' : '#007bff', 
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center',
                        marginTop: '20px'
                    }}>
                        <a href="#" style={{
                            color: '#007bff',
                            textDecoration: 'none',
                            fontSize: '14px'
                        }}>
                            Mot de passe oublié ?
                        </a>
                    </div>

                    <div style={{
                        marginTop: '30px',
                        paddingTop: '20px',
                        borderTop: '1px solid #eee'
                    }}>
                        <p style={{
                            textAlign: 'center',
                            color: '#666',
                            fontSize: '14px',
                            marginBottom: '15px'
                        }}>
                            Pas encore de compte ?
                        </p>
                        
                        <button 
                            onClick={() => navigate('/register-user')}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#fff',
                                color: '#333',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                marginBottom: '10px'
                            }}
                        >
                            Inscription Utilisateur
                        </button>

                        <button 
                            onClick={() => navigate('/register-professional')}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#fff',
                                color: '#333',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Inscription Professionnel
                        </button>
                    </div>
                </div>

                {/* Image à droite */}
                <div style={{
                    flex: '1',
                    backgroundImage: 'url("/assets/img/projet2imglogin.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '600px'
                }}>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;