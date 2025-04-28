import React from 'react';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, userRole } = useAuth();
  
  console.log('PrivateRoute check:', { isAuthenticated, userRole, requiredRole });

  if (!isAuthenticated) {
    console.log('Not authenticated, showing access denied');

    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Acces interzis</h1>
        <p className="text-lg text-gray-600">Trebuie să fii autentificat pentru a accesa această pagină.</p>
      </div>
    );
  }

  if (requiredRole && userRole && userRole.toLowerCase() !== requiredRole.toLowerCase()) {
    console.log(`Role mismatch: required ${requiredRole}, have ${userRole}, showing unauthorized`);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Neautorizat</h1>
        <p className="text-lg text-gray-600">Nu ai permisiunea necesară pentru a accesa această pagină.</p>
      </div>
    );
  }

  console.log('Route access granted');
  return children;
};

export default PrivateRoute;
