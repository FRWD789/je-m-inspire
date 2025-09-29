import { useNavigate } from 'react-router-dom'; // AJOUT IMPORTANT
import { useAuth } from "../../contexts/AuthContext";

export const Navigation = () => {
    const { user, logout, isProfessional, isAdmin } = useAuth();
    const navigate = useNavigate(); // AJOUT IMPORTANT
    
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav style={{ 
            padding: '1rem', 
            backgroundColor: '#f8f9fa', 
            borderBottom: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <h3 style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
                    Mon App Événements
                </h3>
                
                {/* Bouton Pro Plus pour les professionnels */}
                {isProfessional() && (
                    <button
                        onClick={() => navigate('/abonnement')}
                        style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                        }}
                    >
                        ⭐ Pro Plus
                    </button>
                )}
            </div>
            
            {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#333' }}>
                        Bonjour, <strong>{user.name}</strong>
                    </span>
                    
                    {/* Badge de rôle */}
                    <span style={{ 
                        backgroundColor: isAdmin() ? '#dc3545' : isProfessional() ? '#28a745' : '#007bff',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        {user.roles?.map(role => {
                            // Traduire les rôles en français
                            const roleNames = {
                                'admin': 'Admin',
                                'professionnel': 'Professionnel',
                                'utilisateur': 'Utilisateur'
                            };
                            return roleNames[role.role] || role.role;
                        }).join(', ')}
                    </span>
                    
                    {/* Bouton de déconnexion */}
                    <button 
                        onClick={handleLogout}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                        Déconnexion
                    </button>
                </div>
            )}
        </nav>
    );
};