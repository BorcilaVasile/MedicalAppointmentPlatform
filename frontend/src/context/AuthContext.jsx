// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRole = localStorage.getItem('userRole');
      
      if (storedToken && storedRole) {
        try {
          // Verify token by making a request to the backend
          const response = await apiClient.get('/api/auth/me');
          
          if (response.status === 200) {
            setToken(storedToken);
            setUserRole(storedRole);
            setIsAuthenticated(true);
          } else {
            // If token is invalid, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            setToken(null);
            setUserRole(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          // If request fails, token is invalid
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          setToken(null);
          setUserRole(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    setToken(token);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setToken(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};