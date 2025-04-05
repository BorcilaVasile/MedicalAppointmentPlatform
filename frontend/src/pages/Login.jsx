// src/pages/Login.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.token); // Actualizează starea globală
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] transition-colors">
      <div className="w-full max-w-md p-6 bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-[var(--text-800)] dark:text-[var(--text-200)]">
          Login
        </h1>
        {error && (
          <p className="text-center mb-4 text-[var(--accent-500)] dark:text-[var(--accent-600)] font-medium">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[var(--primary-500)] text-[var(--text-50)] dark:bg-[var(--primary-600)] dark:text-[var(--text-950)] font-semibold rounded-md hover:bg-[var(--primary-600)] dark:hover:bg-[var(--primary-700)] transition-colors"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-4 text-[var(--text-600)] dark:text-[var(--text-400)]">
          Don’t have an account?{' '}
          <a
            href="/signup"
            className="text-[var(--primary-500)] dark:text-[var(--primary-600)] hover:underline"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;