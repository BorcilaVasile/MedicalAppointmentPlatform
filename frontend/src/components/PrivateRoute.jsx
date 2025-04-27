import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, userRole } = useAuth();
  
  // Add debugging
  console.log('PrivateRoute check:', { isAuthenticated, userRole, requiredRole });

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Case-insensitive role check
  if (requiredRole && userRole && userRole.toLowerCase() !== requiredRole.toLowerCase()) {
    console.log(`Role mismatch: required ${requiredRole}, have ${userRole}, redirecting to home`);
    return <Navigate to="/" replace />;
  }

  console.log('Route access granted');
  return children;
};

export default PrivateRoute; 