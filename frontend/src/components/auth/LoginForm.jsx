import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(credentials.email, credentials.password);
        } catch (err) {
            setError(err.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#FAF5EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            padding: '20px'
        }}>
            <div style={{ 
                maxWidth: '480px', 
                width: '100%',
                padding: '50px 40px',
                backgroundColor: '#FAF5EE',
                borderRadius: '24px',
                boxShadow: `
                    0 25px 50px -12px rgba(74, 32, 14, 0.1),
                    0 8px 24px -4px rgba(74, 32, 14, 0.05),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.2)
                `,
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(146, 143, 130, 0.2)'
            }}>
                {/* Éléments décoratifs d'arrière-plan */}
                <div style={{
                    position: 'absolute',
                    top: '-70px',
                    right: '-70px',
                    width: '200px',
                    height: '200px',
                    backgroundColor: '#50562E',
                    borderRadius: '50%',
                    opacity: '0.08',
                    filter: 'blur(10px)'
                }} />
                
                <div style={{
                    position: 'absolute',
                    bottom: '-50px',
                    left: '-50px',
                    width: '150px',
                    height: '150px',
                    backgroundColor: '#937965',
                    borderRadius: '50%',
                    opacity: '0.06',
                    filter: 'blur(8px)'
                }} />

                <div style={{ 
                    position: 'relative', 
                    zIndex: 1,
                    textAlign: 'center'
                }}>
                    <div style={{
                        marginBottom: '40px'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '16px',
                            backgroundColor: '#50562E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 4px 12px rgba(80, 86, 46, 0.15)'
                        }}>
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#FAF5EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="#FAF5EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h2 style={{
                            fontSize: '28px',
                            color: '#4A200E',
                            marginBottom: '12px',
                            fontWeight: '700',
                            letterSpacing: '-0.5px'
                        }}>
                            Content de vous revoir
                        </h2>
                        <p style={{
                            color: '#928F82',
                            fontSize: '16px',
                            fontWeight: '400'
                        }}>
                            Connectez-vous à votre compte
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{
                                position: 'relative'
                            }}>
                                <input
                                    type="email"
                                    placeholder=" "
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                    style={{ 
                                        width: '100%', 
                                        padding: '18px 20px 10px', 
                                        border: '1px solid rgba(146, 143, 130, 0.4)',
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        color: '#4A200E',
                                        fontSize: '16px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 1px 3px rgba(74, 32, 14, 0.04)'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#50562E';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(80, 86, 46, 0.1)';
                                        e.target.style.backgroundColor = '#FFFFFF';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(146, 143, 130, 0.4)';
                                        e.target.style.boxShadow = '0 1px 3px rgba(74, 32, 14, 0.04)';
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                                    }}
                                    required
                                />
                                <label style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '20px',
                                    transform: 'translateY(-50%)',
                                    color: '#928F82',
                                    fontSize: '16px',
                                    fontWeight: '400',
                                    pointerEvents: 'none',
                                    transition: 'all 0.2s ease'
                                }}>
                                    Email
                                </label>
                            </div>
                        </div>

                        <div style={{ marginBottom: '28px' }}>
                            <div style={{
                                position: 'relative'
                            }}>
                                <input
                                    type="password"
                                    placeholder=" "
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                    style={{ 
                                        width: '100%', 
                                        padding: '18px 20px 10px', 
                                        border: '1px solid rgba(146, 143, 130, 0.4)',
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        color: '#4A200E',
                                        fontSize: '16px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 1px 3px rgba(74, 32, 14, 0.04)'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#50562E';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(80, 86, 46, 0.1)';
                                        e.target.style.backgroundColor = '#FFFFFF';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(146, 143, 130, 0.4)';
                                        e.target.style.boxShadow = '0 1px 3px rgba(74, 32, 14, 0.04)';
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                                    }}
                                    required
                                />
                                <label style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '20px',
                                    transform: 'translateY(-50%)',
                                    color: '#928F82',
                                    fontSize: '16px',
                                    fontWeight: '400',
                                    pointerEvents: 'none',
                                    transition: 'all 0.2s ease'
                                }}>
                                    Mot de passe
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div style={{ 
                                color: '#4A200E', 
                                marginBottom: '20px',
                                padding: '14px 16px',
                                backgroundColor: 'rgba(250, 245, 238, 0.9)',
                                borderRadius: '10px',
                                textAlign: 'center',
                                fontSize: '14px',
                                fontWeight: '500',
                                border: '1px solid rgba(74, 32, 14, 0.1)',
                                boxShadow: '0 2px 6px rgba(74, 32, 14, 0.05)'
                            }}>
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                padding: '16px', 
                                backgroundColor: loading ? 'rgba(80, 86, 46, 0.7)' : '#50562E', 
                                color: '#FAF5EE',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                boxShadow: loading ? 'none' : '0 4px 14px rgba(80, 86, 46, 0.4)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.backgroundColor = '#4A200E';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(74, 32, 14, 0.35)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.target.style.backgroundColor = '#50562E';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 14px rgba(80, 86, 46, 0.4)';
                                }
                            }}
                        >
                            {loading && (
                                <span style={{
                                    display: 'inline-block',
                                    width: '18px',
                                    height: '18px',
                                    border: '2px solid rgba(250, 245, 238, 0.3)',
                                    borderTop: '2px solid #FAF5EE',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    marginRight: '10px',
                                    verticalAlign: 'middle'
                                }} />
                            )}
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center',
                        marginTop: '32px'
                    }}>
                        <a href="#" style={{
                            color: '#937965',
                            textDecoration: 'none',
                            fontSize: '15px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            display: 'inline-flex',
                            alignItems: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.color = '#4A200E';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = '#937965';
                        }}
                        >
                            Mot de passe oublié ?
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '6px' }}>
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Animation CSS pour le spinner */}
                <style>
                    {`
                        input:focus + label,
                        input:not(:placeholder-shown) + label {
                            top: 12px !important;
                            transform: translateY(0) !important;
                            font-size: 12px !important;
                            color: #50562E !important;
                        }
                        
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        </div>
    );
};

export default LoginForm;