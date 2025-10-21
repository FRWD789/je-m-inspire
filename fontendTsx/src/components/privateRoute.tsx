// fontendTsx/src/components/privateRoute.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  allowedRoles: string[];
}

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  // ✅ Utilisation correcte des propriétés du nouveau AuthContext
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // ⏳ Si chargement en cours, afficher un loader
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '3rem' }}>🔄</div>
        <p>Vérification de l'authentification...</p>
      </div>
    );
  }

  // ❌ Not logged in → go to login
  if (!isAuthenticated || !user) {
    console.log("🔒 PrivateRoute: Non authentifié, redirection vers /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ❌ Logged in but no permission → go to forbidden
  // ✅ Vérification sécurisée des rôles
  const userRoles = user.roles?.map(r => r.role) || [];
  const hasPermission = allowedRoles.some(role => userRoles.includes(role));

  if (!hasPermission) {
    console.log("🚫 PrivateRoute: Rôle requis non satisfait");
    return <Navigate to="/forbidden" replace />;
  }

  // ✅ Has access → render the route
  console.log("✅ PrivateRoute: Accès autorisé");
  return <Outlet />;
}