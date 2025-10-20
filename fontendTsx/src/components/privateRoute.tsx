import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  allowedRoles: string[];
}

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const { accessToken, user } = useAuth();
  const location = useLocation();

  // Not logged in → go to login
  if (!accessToken || !user) {
    console.log("here")
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but no permission → go to forbidden
  if (!allowedRoles.includes(user.roles[0].role)) {
    return <Navigate to="/forbidden" replace />;
  }

  // Has access → render the route
  return <Outlet />;
}