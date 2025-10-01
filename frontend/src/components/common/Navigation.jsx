import { useAuth } from "../../contexts/AuthContext";


export const Navigation = () => {
    const { user, logout, isProfessional, isAdmin } = useAuth();
    
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
            <div>
                 {/* Logo */}
                <img
                    src="/assets/img/logo.png"
    style={{ height: '120px', width: 'auto' }}
                    alt="Je m'inspire"
                />
            </div>
            
            {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>Bonjour, {user.name}</span>
                    <span style={{ 
                        backgroundColor: isAdmin() ? '#dc3545' : isProfessional() ? '#28a745' : '#007bff',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>
                        {user.roles?.map(role => role.role).join(', ')}
                    </span>
                    <button 
                        onClick={handleLogout}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Déconnexion
                    </button>
                </div>
            )}
        </nav>
    );
};