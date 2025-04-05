// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaCog, FaMoon, FaSun } from 'react-icons/fa';
import maleProfilePicture from '../assets/male_profile_picture.png';
import femaleProfilePicture from '../assets/female_profile_picture.png';
import logo from '../assets/elysium-logo.svg';
import sun from '../assets/sun.svg';
import moon from '../assets/moon.svg';

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token not found');
          return;
        }

        try {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const data = await response.json();
          setUserData(data);
          setError(null);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError(error.message);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      setUserData(null);
      setIsProfileMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    }
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <nav className="bg-gray-50 dark:bg-[var(--background-900)] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="Elysium Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
              <h1 className="text-3xl sm:text-4xl font-bold light:text-black dark:text-white">Elysium</h1>
            </Link>
            <div className="hidden md:flex md:ml-10 space-x-8">
              <Link
                to="/"
                className="text-gray-900 dark:text-gray-300 hover:text-[var(--primary-600)] dark:hover:text-[var(--primary-400)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Acasă
              </Link>
              <Link
                to="/doctors"
                className="text-gray-900 dark:text-gray-300 hover:text-[var(--primary-600)] dark:hover:text-[var(--primary-400)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Doctori
              </Link>
              <Link
                to="/about"
                className="text-gray-900 dark:text-gray-300 hover:text-[var(--primary-600)] dark:hover:text-[var(--primary-400)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Despre Noi
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-gray-900 dark:text-gray-300 hover:text-[var(--primary-600)] dark:hover:text-[var(--primary-400)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="relative">
                    <img
                      src={
                        userData?.profilePicture
                          ? `http://localhost:5000${userData.profilePicture}`
                          : userData?.gender === 'Masculin'
                          ? maleProfilePicture
                          : femaleProfilePicture
                      }
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[var(--primary-500)]"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-[var(--background-800)] rounded-md shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {userData?.name || 'Utilizator'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {userData?.email || 'Email indisponibil'}
                        </p>
                      </div>
                      <Link
                        to="/account"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaUser className="mr-3" />
                        Contul Meu
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaCog className="mr-3" />
                        Setări
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FaSignOutAlt className="mr-3" />
                        Deconectare
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-900 dark:text-gray-300 hover:text-[var(--primary-600)] dark:hover:text-[var(--primary-400)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Autentificare
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white px-4 py-2 rounded-md text-sm font-medium hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] transition-all"
                >
                  Înregistrare
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-50 dark:bg-[var(--background-900)]"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-gray-300 hover:text-[var(--primary-600)] dark:hover:text-[var(--primary-400)]"
                onClick={() => setIsMenuOpen(false)}
              >
                Acasă
              </Link>
              <Link
                to="/doctors"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-gray-300 hover:text-[var(--primary-600)] dark:hover:text-[var(--primary-400)]"
                onClick={() => setIsMenuOpen(false)}
              >
                Doctori
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-gray-300 hover:text-[var(--primary-600)] dark:hover:text-[var(--primary-400)]"
                onClick={() => setIsMenuOpen(false)}
              >
                Despre Noi
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-gray-300 hover:text-[var(--primary-600)] dark:hover:text-[var(--primary-400)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;