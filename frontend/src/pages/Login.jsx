// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CompanyInfo from '../components/CompanyInfo';
import apiClient from '../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Entered login function")
      console.log('Sending request to backend: ', { email, password });
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      console.log('Received response from backend: ', response.data);
      await login(response.data.token, response.data.userType);
      console.log('Passed login stage...');
      // Redirect based on role
      if (response.data.userType === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Stânga: Formular */}
      <div className="w-full md:w-1/2 bg-[var(--background-50)] dark:bg-[var(--background-900)] p-8 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-[var(--background-100)] dark:bg-[var(--background-950)] rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-6 text-[var(--text-800)] dark:text-[var(--text-200)]">
            Login
          </h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
                placeholder="Enter your email"
                //required
              />
            </div>
            <div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
                placeholder="Enter your password"
                //required
              />  
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-[var(--text-50)] dark:from-[var(--primary-600)] dark:to-[var(--secondary-600)] dark:text-[var(--text-950)] font-semibold rounded-lg hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] dark:hover:from-[var(--primary-700)] dark:hover:to-[var(--secondary-700)] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-102"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          {/* Separator */}
          <div className="my-6 flex items-center">
            <hr className="flex-grow border-[var(--text-300)] dark:border-[var(--text-700)]" />
            <span className="px-3 text-[var(--text-600)] dark:text-[var(--text-400)]">or</span>
            <hr className="flex-grow border-[var(--text-300)] dark:border-[var(--text-700)]" />
          </div>

          {/* Social Login Buttons */}
          <p className="text-center mt-4 text-[var(--text-600)] dark:text-[var(--text-400)]">
            Don't have an account?{' '}
            <a
              href="/signup"
              className="text-[var(--primary-500)] dark:text-[var(--primary-600)] hover:underline"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
      <CompanyInfo />
    </div>
  );
};

export default Login;