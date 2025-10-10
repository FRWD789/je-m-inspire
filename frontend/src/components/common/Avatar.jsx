// frontend/src/components/common/Avatar.jsx
import React from 'react';

const Avatar = ({ user, size = 40, showName = false }) => {
    const API_URL = 'http://localhost:8000';
    
    // Générer les initiales à partir du nom
    const getInitials = () => {
        if (!user) return '?';
        const firstInitial = user.name?.[0]?.toUpperCase() || '';
        const lastInitial = user.last_name?.[0]?.toUpperCase() || '';
        return `${firstInitial}${lastInitial}` || '?';
    };

    const avatarStyle = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        flexShrink: 0
    };

    const placeholderStyle = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#3498db',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: `${size * 0.4}px`,
        border: '2px solid #fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        flexShrink: 0
    };

    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: showName ? '10px' : '0'
    };

    return (
        <div style={containerStyle}>
            {user?.profile_picture ? (
                <img 
                    src={`${API_URL}/storage/${user.profile_picture}`}
                    alt={`${user.name} ${user.last_name}`}
                    style={avatarStyle}
                    onError={(e) => {
                        // Si l'image ne charge pas, afficher le placeholder
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : (
                <div style={placeholderStyle}>
                    {getInitials()}
                </div>
            )}
            
            {/* Placeholder de secours (caché par défaut si image existe) */}
            {user?.profile_picture && (
                <div style={{...placeholderStyle, display: 'none'}}>
                    {getInitials()}
                </div>
            )}

            {showName && user && (
                <span style={{ fontWeight: 'bold' }}>
                    {user.name} {user.last_name}
                </span>
            )}
        </div>
    );
};

export default Avatar;