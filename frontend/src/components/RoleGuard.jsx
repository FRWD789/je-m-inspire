// components/RoleGuard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const RoleGuard = ({ 
    children, 
    roles = [], 
    requireAll = false, 
    fallback = null,
    redirectTo = null 
}) => {
    const { user, hasRole, hasAnyRole, loading, isAuthenticated } = useAuth();

    // Attendre le chargement
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px' 
            }}>
                Chargement...
            </div>
        );
    }

    // Vérifier l'authentification
    if (!isAuthenticated) {
        if (redirectTo) {
            window.location.href = redirectTo;
            return null;
        }
        return fallback || (
            <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#e74c3c' 
            }}>
                Vous devez être connecté pour accéder à cette page.
            </div>
        );
    }

    // Si aucun rôle spécifié, l'utilisateur authentifié a accès
    if (roles.length === 0) {
        return children;
    }

    // Vérifier les rôles
    const hasAccess = requireAll 
        ? roles.every(role => hasRole(role))
        : hasAnyRole(roles);

    if (!hasAccess) {
        if (redirectTo) {
            window.location.href = redirectTo;
            return null;
        }
        return fallback || (
            <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#e74c3c' 
            }}>
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                <br />
                <small>Rôles requis: {roles.join(', ')}</small>
            </div>
        );
    }

    return children;
};

// Composants spécialisés pour les rôles courants
export const AdminOnly = ({ children, fallback, redirectTo }) => (
    <RoleGuard 
        roles={['admin']} 
        fallback={fallback} 
        redirectTo={redirectTo}
    >
        {children}
    </RoleGuard>
);

export const ProfessionalOnly = ({ children, fallback, redirectTo }) => (
    <RoleGuard 
        roles={['professionnel']} 
        fallback={fallback} 
        redirectTo={redirectTo}
    >
        {children}
    </RoleGuard>
);

export const UserOrProfessional = ({ children, fallback, redirectTo }) => (
    <RoleGuard 
        roles={['utilisateur', 'professionnel']} 
        fallback={fallback} 
        redirectTo={redirectTo}
    >
        {children}
    </RoleGuard>
);

// Hook pour utiliser la vérification de rôle dans les composants
export const useRoleCheck = () => {
    const { hasRole, hasAnyRole } = useAuth();
    
    return {
        canAccess: (roles, requireAll = false) => {
            if (!Array.isArray(roles)) {
                return hasRole(roles);
            }
            return requireAll 
                ? roles.every(role => hasRole(role))
                : hasAnyRole(roles);
        },
        hasRole,
        hasAnyRole
    };
};

export default RoleGuard;