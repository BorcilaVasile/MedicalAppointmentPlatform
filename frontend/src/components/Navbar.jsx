// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaCog, FaMoon, FaSun, FaUserShield, FaUserMd, FaBell, FaCalendarAlt, FaNotesMedical } from 'react-icons/fa';
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
  const lastFetchRef = useRef(0);

  useEffect(() => {
    const fetchUserData = async () => {

      if (isAuthenticated && !userData) {
        try {
          const endpoint = userRole === 'Admin'
          ? '/api/admin'
          : userRole === 'Doctor'
            ? '/api/doctor'
            : '/api/patient';

          const response = await apiClient.get(endpoint, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          console.log('User data in navbar:', response.data);
          setUserData(response.data);
          setError(null);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, userRole, userData]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return;

      // Verificăm dacă au trecut cel puțin 10 secunde de la ultima verificare
      const now = Date.now();
      if (now - lastFetchRef.current < 10000) return;

      try {
        // Endpoint diferit în funcție de tipul utilizatorului
        const endpoint = userRole === 'Doctor'
          ? '/api/notifications/doctor'
          : '/api/notifications';

        const response = await apiClient.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setNotifications(response.data);
        setLoading(false);
        lastFetchRef.current = now;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();

    // Poll pentru notificări la fiecare 30 secunde, dar doar dacă tab-ul este activ
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 30000);

    // Adăugăm event listener pentru vizibilitatea paginii
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, userRole]);

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
    console.log('User role:', userRole);
    // Case-insensitive role check 
    if (userRole && userRole.toLowerCase() === 'admin') {
      return '/admin/dashboard';
    } else if (userRole && userRole.toLowerCase() === 'doctor') {
      return '/doctor/dashboard';
    } else {
      return '/*';
    }
  };

  const getDashboardIcon = () => {
    // Case-insensitive role check
    if (userRole && userRole.toLowerCase() === 'admin') {
      return <FaUserShield className="mr-2" />;
    } else if (userRole && userRole.toLowerCase() === 'doctor') {
      return <FaUserMd className="mr-2" />;
    } else {
      return <FaUser className="mr-2" />;
    }
  };

  // Helper function for consistent role checking
  const hasRole = (role) => {
    return userRole && userRole.toLowerCase() === role.toLowerCase();
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        // Endpoint diferit în funcție de tipul utilizatorului
        const endpoint = userRole === 'Doctor'
          ? `/api/notifications/doctor/${notification._id}/read`
          : `/api/notifications/${notification._id}/read`;

        await apiClient.put(endpoint);
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
      // Endpoint diferit în funcție de tipul utilizatorului
      const endpoint = userRole === 'Doctor'
        ? '/api/notifications/doctor/read-all'
        : '/api/notifications/read-all';

      await apiClient.put(endpoint);
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
    <nav className="light:bg-[var(--background-100)] 
                    dark:bg-[var(--background-900)] 
                    light:text-[var(--text-900)]
                    dark:text-[var(--text-100)]
                    shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="Elysium Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
              <h1 className="text-3xl sm:text-4xl font-bold">Elysium</h1>
            </Link>
            <div className="hidden md:flex md:ml-10 space-x-8">
              <Link
                to="/"
                className="light:hover:text-[var(--primary-600)
                    dark:hover:text-[var(--primary-400)]
                    px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/doctors"
                className="light:hover:text-[var(--primary-600)
                    dark:hover:text-[var(--primary-400)]
                    px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Doctors
              </Link>
              <Link
                to="/about"
                className="light:hover:text-[var(--primary-600)
                    dark:hover:text-[var(--primary-400)]
                px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About us
              </Link>
              {userRole !== 'Patient' && isAuthenticated && (
                <Link
                  to={getDashboardLink()}
                  className="light:hover:text-[var(--primary-600)
                    dark:hover:text-[var(--primary-400)]
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {getDashboardIcon()}
                  {hasRole('admin') ? 'Admin' : hasRole('doctor') ? 'Doctor' : ''}
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
                    className="p-2 rounded-full light:hover:bg-[var(--secondary-200)] dark:hover:bg-[var(--secondary-800)] transition-colors"
                  >
                    <FaBell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 bg-white light:bg-white dark:bg-[#1F1F2E] rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 light:border-gray-200 dark:border-gray-700">
                      {/* Mark all as read button */}
                      <div className="px-4 py-2 flex items-center text-gray-600 light:text-gray-600 dark:text-gray-400 hover:text-gray-900 light:hover:text-gray-900 dark:hover:text-white cursor-pointer border-b border-gray-200 light:border-gray-200 dark:border-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAllAsRead();
                        }}>
                        <span className="mr-2">✓</span>
                        Mark all as read
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                          <div className="px-4 py-3 text-center text-gray-600 light:text-gray-600 dark:text-gray-400">
                            Loading...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="px-4 py-3 text-center text-gray-600 light:text-gray-600 dark:text-gray-400">
                            No notifications available
                          </div>
                        ) : (
                          <div>
                            {notifications.slice(0, 5).map((notification) => (
                              <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`px-4 py-3 cursor-pointer hover:bg-gray-100 light:hover:bg-gray-100 dark:hover:bg-[#2F2F3E] ${!notification.read ? 'bg-gray-50 light:bg-gray-50 dark:bg-[#2F2F3E]' : ''
                                  }`}
                              >
                                <p className="text-gray-900 light:text-gray-900 dark:text-white text-sm font-medium">
                                  {notification.message}
                                </p>
                                <p className="text-gray-600 light:text-gray-600 dark:text-gray-400 text-xs mt-1">
                                  {format(new Date(notification.createdAt), 'p')}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-gray-200 light:border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            navigate('/notifications');
                          }}
                          className="w-full text-center text-sm text-gray-600 light:text-gray-600 dark:text-gray-400 hover:text-gray-900 light:hover:text-gray-900 dark:hover:text-white py-3"
                        >
                          See all notifications
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
              className="p-2 rounded-full text-[var(--text-900)] light:text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-gray-100 light:hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                      src={userData?.profilePicture
                          ? getImageUrl(userData.profilePicture)
                            : userData?.gender === 'Female'
                            ? femaleProfilePicture
                            : maleProfilePicture
                      }
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[var(--primary-500)]"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white light:border-white dark:border-gray-800"></div>
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white light:bg-white dark:bg-[var(--background-800)] rounded-md shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-200 light:border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-[var(--text-900)] light:text-[var(--text-900)] dark:text-[var(--text-100)]">
                          {hasRole('doctor')
                            ? userData ? `${userData.firstName || ''} ${userData.lastName || ''}` : 'Doctor'
                            : userData?.name || 'Utilizator'
                          }
                        </p>
                        <p className="text-xs text-[var(--text-500)] light:text-[var(--text-500)] dark:text-[var(--text-400)]">
                          {userData?.email || 'Email indisponibil'}
                        </p>
                      </div>
                      <Link
                        to="/account"
                        className="flex items-center px-4 py-2 text-sm text-[var(--text-900)] light:text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-gray-100 light:hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaUser className="mr-3" />
                        My account
                      </Link>
                      <Link
                        to="/appointments"
                        className="flex items-center px-4 py-2 text-sm text-[var(--text-900)] light:text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-gray-100 light:hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaCalendarAlt className="mr-3" />
                        My appointments
                      </Link>
                      {userRole !== 'Doctor' && (
                        <Link
                          to="/medical-history"
                          className="flex items-center px-4 py-2 text-sm text-[var(--text-900)] light:text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-gray-100 light:hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <FaNotesMedical className="mr-3" />
                          Medical history
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-[var(--text-600)] light:text-[var(--text-600)] hover:bg-gray-100 light:hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FaSignOutAlt className="mr-3" />
                        Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-[var(--text-900)] light:text-[var(--text-900)] hover:text-[var(--primary-600)] light:hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white px-4 py-2 rounded-md text-sm font-medium hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-[var(--text-900)] light:text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-gray-100 light:hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
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
            className="md:hidden bg-[var(--background-100)] light:bg-[var(--background-100)] dark:bg-[var(--background-900)]"
          >
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-[var(--text-900)] light:text-[var(--text-900)] hover:text-[var(--primary-600)] light:hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/doctors"
                className="block px-3 py-2 text-[var(--text-900)] light:text-[var(--text-900)] hover:text-[var(--primary-600)] light:hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Doctors
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-[var(--text-900)] light:text-[var(--text-900)] hover:text-[var(--primary-600)] light:hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About us
              </Link>
              {isAuthenticated && !hasRole('doctor') && (
                <Link
                  to="/medical-history"
                  className="inline-flex items-center px-3 py-2 text-[var(--text-900)] light:text-[var(--text-900)] hover:text-[var(--primary-600)] light:hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaNotesMedical className="mr-3" />
                  Medical History
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/appointments"
                  className="inline-flex items-center px-3 py-2 text-[var(--text-900)] light:text-[var(--text-900)] hover:text-[var(--primary-600)] light:hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaCalendarAlt className="mr-3" />
                  My Appointments
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center px-3 py-2 text-[var(--text-900)] light:text-[var(--text-900)] hover:text-[var(--primary-600)] light:hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {getDashboardIcon()}
                  {hasRole('admin') ? 'Admin' : hasRole('doctor') ? 'Doctor' : 'Dashboard'}
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/account"
                  className="inline-flex items-center px-3 py-2 text-[var(--text-900)] light:text-[var(--text-900)] hover:text-[var(--primary-600)] light:hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}>
                  <FaUser className="mr-3" />
                  My account
                </Link>)}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-[var(--text-900)] light:text-[var(--text-900)] hover:text-[var(--primary-600)] light:hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium">
                  <FaSignOutAlt className="mr-3" />Disconnect
                </button>
              )}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="block px-3 py-2 text-[var(--text-900)] light:text-[var(--text-900)] hover:text-[var(--primary-600)] light:hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium"
                >
                  Login
                </Link>
              )}
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-[var(--text-900)] light:text-[var(--text-900)] hover:text-[var(--primary-600)] light:hover:text-[var(--primary-600)] dark:text-[var(--text-50)] dark:hover:text-[var(--primary-400)] rounded-md text-base font-medium">
                  Sign Up
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