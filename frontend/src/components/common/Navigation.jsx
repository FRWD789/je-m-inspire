// frontend/src/components/common/Navigation.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from './Avatar';

const Navigation = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, hasRole, isAdmin, isProfessional, isUser } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav style={{
            backgroundColor: '#343a40',
            padding: '15px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>

            <div>
                {/* Logo */}
                <img
                    src="/assets/img/logo.png"
                    style={{ height: '120px', width: 'auto' }}
                    alt="Je m'inspire"
                />
            </div>

            {/* Navigation principale */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                {isAuthenticated && (
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Link to="/" style={navLinkStyle}>
                            🏠 Accueil
                        </Link>

                        <Link to="/calendar" style={navLinkStyle}>
                            📅 Calendrier
                        </Link>

                        {hasRole('utilisateur') && (
                            <Link to="/mes-remboursements" style={navLinkStyle}>
                                💸 Mes Remboursements
                            </Link>
                        )}

                        {/* Liens spécifiques aux professionnels */}
                        {isProfessional() && (
                            <>
                                <Link to="/abonnement" style={navLinkStyle}>
                                    ⭐ Pro Plus
                                </Link>
                                <Link to="/vendor/earnings" style={navLinkStyle}>
                                    💰 Mes Revenus
                                </Link>
                            </>
                        )}

                        {/* Liens admin */}
                        {hasRole('admin') && (
                            <>
                                <Link to="/admin/commissions" style={{
                                    ...navLinkStyle,
                                    backgroundColor: '#dc3545',
                                    padding: '5px 15px',
                                    borderRadius: '5px'
                                }}>
                                    💰 Commissions
                                </Link>
                                
                                <Link to="/admin/approvals" style={{
                                    ...navLinkStyle,
                                    backgroundColor: '#dc3545',
                                    padding: '5px 15px',
                                    borderRadius: '5px'
                                }}>
                                    👤 Approbations
                                </Link>
                                
                                <Link to="/admin/remboursements" style={{
                                    ...navLinkStyle,
                                    backgroundColor: '#dc3545',
                                    padding: '5px 15px',
                                    borderRadius: '5px'
                                }}>
                                    💸 Remboursements
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Menu utilisateur */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {isAuthenticated ? (
                    <>
                        <span style={{ color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Bonjour, <strong>{user?.name}</strong>
                            {hasRole('admin') && (
                                <span style={{
                                    padding: '2px 8px',
                                    backgroundColor: '#dc3545',
                                    borderRadius: '3px',
                                    fontSize: '12px'
                                }}>
                                    ADMIN
                                </span>
                            )}
                            {isProfessional() && (
                                <span style={{
                                    padding: '2px 8px',
                                    backgroundColor: '#28a745',
                                    borderRadius: '3px',
                                    fontSize: '12px'
                                }}>
                                    PRO
                                </span>
                            )}
                        </span>
                        
                        {/* Avatar + Lien Profil */}
                        <Link to="/profile" style={{
                            ...navLinkStyle,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        >
                            <Avatar user={user} size={32} />
                            <span>Profil</span>
                        </Link>
                        
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Déconnexion
                        </button>
                    </>
                ) : (
                    <>
                        <Link 
                            to="/login" 
                            style={{
                                ...navLinkStyle,
                                backgroundColor: '#007bff',
                                padding: '8px 16px',
                                borderRadius: '5px'
                            }}
                        >
                            Connexion
                        </Link>
                        <Link 
                            to="/register-user" 
                            style={{
                                ...navLinkStyle,
                                backgroundColor: '#28a745',
                                padding: '8px 16px',
                                borderRadius: '5px'
                            }}
                        >
                            Inscription
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

// Style pour les liens de navigation
const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    transition: 'opacity 0.2s',
};

export default Navigation;