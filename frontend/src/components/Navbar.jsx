// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const { isAuthenticated, logout, userRole, user, token } = useAuth();
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
          console.log('Notificări actualizate:', response.data);
          console.log('Număr notificări necitite:', response.data.filter(n => !n.read).length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const markNotificationAsRead = async (notification) => {
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
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await apiClient.put('/api/notifications/read-all');
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <nav className="bg-[var(--background-50)] dark:bg-[var(--background-900)] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src={logo}
                alt="Elysium Logo"
              />
            </Link>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-[var(--text-600)] dark:text-[var(--text-400)] hover:bg-[var(--background-200)] dark:hover:bg-[var(--background-800)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-100)] dark:focus:ring-offset-[var(--background-900)] focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)]"
                >
                  {isDarkMode ? (
                    <img src={sun} alt="Light mode" className="h-6 w-6" />
                  ) : (
                    <img src={moon} alt="Dark mode" className="h-6 w-6" />
                  )}
                </button>

                <NotificationBell />

                <div className="ml-3 relative">
                  <div>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-100)] dark:focus:ring-offset-[var(--background-900)] focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)]"
                    >
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={userData?.profilePicture ? getImageUrl(userData.profilePicture) : (userData?.gender === 'F' ? femaleProfilePicture : maleProfilePicture)}
                        alt="Profile"
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[var(--background-50)] dark:bg-[var(--background-900)] ring-1 ring-black ring-opacity-5 z-50"
                      >
                        <div
                          className="py-1"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="user-menu"
                        >
                          <Link
                            to="/account"
                            className="block px-4 py-2 text-sm text-[var(--text-700)] dark:text-[var(--text-300)] hover:bg-[var(--background-100)] dark:hover:bg-[var(--background-800)]"
                            role="menuitem"
                          >
                            <FaUser className="inline-block mr-2" />
                            Profil
                          </Link>

                          {userRole === 'admin' && (
                            <Link
                              to="/admin/dashboard"
                              className="block px-4 py-2 text-sm text-[var(--text-700)] dark:text-[var(--text-300)] hover:bg-[var(--background-100)] dark:hover:bg-[var(--background-800)]"
                              role="menuitem"
                            >
                              <FaUserShield className="inline-block mr-2" />
                              Admin Dashboard
                            </Link>
                          )}

                          {userRole === 'doctor' && (
                            <Link
                              to="/doctor/dashboard"
                              className="block px-4 py-2 text-sm text-[var(--text-700)] dark:text-[var(--text-300)] hover:bg-[var(--background-100)] dark:hover:bg-[var(--background-800)]"
                              role="menuitem"
                            >
                              <FaUserMd className="inline-block mr-2" />
                              Doctor Dashboard
                            </Link>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full text-left block px-4 py-2 text-sm text-[var(--text-700)] dark:text-[var(--text-300)] hover:bg-[var(--background-100)] dark:hover:bg-[var(--background-800)]"
                            role="menuitem"
                          >
                            <FaSignOutAlt className="inline-block mr-2" />
                            Deconectare
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-[var(--text-600)] dark:text-[var(--text-400)] hover:bg-[var(--background-200)] dark:hover:bg-[var(--background-800)] focus:outline-none"
                >
                  {isDarkMode ? (
                    <img src={sun} alt="Light mode" className="h-6 w-6" />
                  ) : (
                    <img src={moon} alt="Dark mode" className="h-6 w-6" />
                  )}
                </button>
                <Link
                  to="/login"
                  className="text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--primary-500)] dark:hover:text-[var(--primary-600)]"
                >
                  Autentificare
                </Link>
                <Link
                  to="/signup"
                  className="bg-[var(--primary-500)] dark:bg-[var(--primary-600)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-600)] dark:hover:bg-[var(--primary-700)]"
                >
                  Înregistrare
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;