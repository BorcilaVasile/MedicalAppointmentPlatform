// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import logo from '../assets/elysium-logo.svg';
import { useState } from 'react';
import sun from '../assets/sun.svg';
import moon from '../assets/moon.svg';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, userRole } = useAuth(); // Folosește userRole din AuthContext
  const { isDarkMode, toggleTheme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-background-50 dark:bg-background-900 text-text-900 dark:text-text-100 p-4 sm:p-4 shadow-md">
      <div className="container mx-auto flex items-center">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Elysium Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
          <h1 className="text-3xl sm:text-4xl font-bold">Elysium</h1>
        </div>

        <div className="hidden lg:flex lg:flex-grow"></div>

        {/* Meniu principal (desktop) */}
        <div className="hidden lg:flex lg:items-center lg:space-x-8">
          <Link to="/" className="text-lg sm:text-xl hover:text-primary-500 transition-colors">
            Home
          </Link>
          <Link to="/about" className="text-lg sm:text-xl hover:text-primary-500 transition-colors">
            About
          </Link>
          {isAuthenticated && userRole === 'admin' && (
            <Link
              to="/admin"
              className="text-lg sm:text-xl hover:text-primary-500 transition-colors"
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden lg:flex lg:flex-grow"></div>

        {/* Partea dreapta (desktop) */}
        <div className="hidden lg:flex lg:items-center lg:space-x-6">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleTheme}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-background-200 dark:bg-background-700 rounded-full peer peer-checked:bg-primary-500 transition-colors">
              <div
                className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                } flex items-center justify-center`}
              >
                <img
                  src={isDarkMode ? sun : moon}
                  alt={isDarkMode ? 'Sun' : 'Moon'}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
              </div>
            </div>
          </label>
          {isAuthenticated ? (
            <Link
              to="/account"
              className="text-lg sm:text-xl hover:text-primary-500 transition-colors"
            >
              My Account
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-lg sm:text-xl hover:text-primary-500 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-lg sm:text-xl hover:text-primary-500 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;