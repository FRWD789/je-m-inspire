import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom'; // ✅ AJOUTEZ

const RoleGuard = ({ 
    children, 
    roles = [], 
    requireAll = false, 
    fallback = null,
    redirectTo = null 
}) => {
    const { user, hasRole, hasAnyRole, loading, isAuthenticated } = useAuth();

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

    if (!isAuthenticated) {
        // ✅ UTILISEZ Navigate au lieu de window.location
        if (redirectTo) {
            return <Navigate to={redirectTo} replace />;
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

    if (roles.length === 0) {
        return children;
    }

    const hasAccess = requireAll 
        ? roles.every(role => hasRole(role))
        : hasAnyRole(roles);

    if (!hasAccess) {
        // ✅ UTILISEZ Navigate au lieu de window.location
        if (redirectTo) {
            return <Navigate to={redirectTo} replace />;
        }
        return fallback || (
            <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#e74c3c' 
            }}>
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </div>
        );
    }

    return children;
};

export default RoleGuard;