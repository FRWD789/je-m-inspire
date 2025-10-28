import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  allowedRoles: string[];
}

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const { accessToken, user } = useAuth();
  const location = useLocation();


  console.log(accessToken,user)



  // Not logged in → go to login
  if (!accessToken || !user) {
    console.log("🔐 Redirecting to login - No access token or user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has any of the allowed roles
  const userRoles = user.roles.map(role => role.role);
  const hasRequiredRole = userRoles.some(role => allowedRoles.includes(role));

  // Logged in but no permission → go to forbidden
  if (!hasRequiredRole) {
    console.log("🚫 Access denied - User roles:", userRoles, "Required:", allowedRoles);
    return <Navigate to="/forbidden" replace />;
  }

  // Has access → render the route
  console.log("✅ Access granted - User has required role");
  return <Outlet />;
}