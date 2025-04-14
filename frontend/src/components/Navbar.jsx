// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaCog, FaMoon, FaSun, FaUserShield, FaUserMd, FaBell } from 'react-icons/fa';
import maleProfilePicture from '../assets/male_profile_picture.png';
import femaleProfilePicture from '../assets/female_profile_picture.png';
import logo from '../assets/elysium-logo.svg';
import sun from '../assets/sun.svg';
import moon from '../assets/moon.svg';
import NotificationBell from './NotificationBell';
import { format } from 'date-fns';
import apiClient, { getImageUrl } from '../config/api';

function Navbar() {
  const { isAuthenticated, logout, userRole, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const endpoint = userRole === 'doctor' ? '/api/doctors/me' : '/api/auth/me';
          const response = await apiClient.get(endpoint);
          setUserData(response.data);
          setError(null);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated) {
        try {
          const response = await apiClient.get('/api/notifications/');
          setNotifications(response.data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          setLoading(false);
        }
      }
    };

    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUserData(null);
      setIsProfileMenuOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      default:
        return '/*';
    }
  };

  const getDashboardIcon = () => {
    switch (userRole) {
      case 'admin':
        return <FaUserShield className="mr-2" />;
      case 'doctor':
        return <FaUserMd className="mr-2" />;
      default:
        return <FaUser className="mr-2" />;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await apiClient.put(`/api/notifications/${notification._id}/read`);
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    setShowNotifications(false);
    navigate('/notifications');
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/api/notifications/read-all');
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Calculăm numărul de notificări necitite în mod sigur pentru a evita erori
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => n && !n.read).length : 0;

  return (
    <nav className="bg-[var(--background-100)] dark:bg-[var(--background-900)] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="Elysium Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)]">Elysium</h1>
            </Link>
            <div className="hidden md:flex md:ml-10 space-x-8">
              <Link
                to="/"
                className="text-[var(--text-900)] hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Acasă
              </Link>
              <Link
                to="/doctors"
                className="text-[var(--text-900)] hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Doctori
              </Link>
              <Link
                to="/about"
                className="text-[var(--text-900)] hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Despre Noi
              </Link>
              {userRole !== 'patient' && isAuthenticated && (
                <Link
                  to={getDashboardLink()}
                  className="flex items-center text-[var(--text-900)] hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {getDashboardIcon()}
                  {userRole === 'admin' ? 'Admin' : userRole === 'doctor' ? 'Doctor' : ''}
                </Link>
              )}
            </div>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationsRef}>
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FaBell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 bg-[#1F1F2E] rounded-lg shadow-lg overflow-hidden z-50 border border-gray-700">
                      {/* Mark all as read button */}
                      <div className="px-4 py-2 flex items-center text-gray-400 hover:text-white cursor-pointer border-b border-gray-700"
                           onClick={(e) => {
                             e.stopPropagation();
                             markAllAsRead();
                           }}>
                        <span className="mr-2">✓</span>
                        Marchează toate ca citite
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                          <div className="px-4 py-3 text-center text-gray-400">
                            Se încarcă...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="px-4 py-3 text-center text-gray-400">
                            Nu există notificări
                          </div>
                        ) : (
                          <div>
                            {notifications.slice(0, 5).map((notification) => (
                              <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`px-4 py-3 cursor-pointer hover:bg-[#2F2F3E] ${
                                  !notification.read ? 'bg-[#2F2F3E]' : ''
                                }`}
                              >
                                <p className="text-white text-sm font-medium">
                                  {notification.message}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                  {format(new Date(notification.createdAt), 'p')}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-gray-700">
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            navigate('/notifications');
                          }}
                          className="w-full text-center text-sm text-gray-400 hover:text-white py-3"
                        >
                          Vezi toate notificările
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="relative md:block hidden">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="relative">
                    <img
                      src={userData?.profilePicture ? getImageUrl(userData.profilePicture) : (userData?.gender === 'F' ? femaleProfilePicture : maleProfilePicture)}
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
                        <p className="text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">
                          {userData?.name || 'Utilizator'}
                        </p>
                        <p className="text-xs text-[var(--text-500)] dark:text-[var(--text-400)]">
                          {userData?.email || 'Email indisponibil'}
                        </p>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center px-4 py-2 text-sm text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {getDashboardIcon()}
                        Dashboard
                      </Link>
                      <Link
                        to="/account"
                        className="flex items-center px-4 py-2 text-sm text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaUser className="mr-3" />
                        Contul Meu
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaCog className="mr-3" />
                        Setări
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-[var(--text-600)] hover:bg-gray-100 dark:hover:bg-gray-700"
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
                  className="text-[var(--text-900)] hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
              className="md:hidden p-2 rounded-md text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
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
            className="md:hidden bg-[var(--background-100)] dark:bg-[var(--background-900)]"
          >
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-[var(--text-900)] hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Acasă
              </Link>
              <Link
                to="/doctors"
                className="block px-3 py-2 text-[var(--text-900)] hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Doctori
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-[var(--text-900)] hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Despre Noi
              </Link>
              {isAuthenticated && (
                <Link
                  to={getDashboardLink()}
                  className="flex items-center px-3 py-2 text-[var(--text-900)] hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {getDashboardIcon()}
                  {userRole === 'admin' ? 'Admin' : userRole === 'doctor' ? 'Doctor' : 'Dashboard'}
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