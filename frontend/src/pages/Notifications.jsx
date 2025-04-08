import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaTrash, FaCheck, FaCheckDouble, FaBell } from 'react-icons/fa';
import { format } from 'date-fns';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    // La prima încărcare a paginii, actualizăm numărul notificărilor și în navbar
    window.dispatchEvent(new Event('notifications-updated'));
    
    fetchNotifications();
  }, []);

  // Debugging și actualizare UI pentru numărul de notificări necitite
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    console.log('Notificări necitite:', unreadCount, notifications);
    
    // Actualizează titlul paginii cu numărul corect
    document.title = unreadCount > 0 
      ? `(${unreadCount}) Notificări - Elysium` 
      : `Notificări - Elysium`;
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/notifications/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, read: true }))
      );
      
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Actualizăm starea local (eliminăm notificarea ștearsă)
      setNotifications(prevNotifications => 
        prevNotifications.filter(notif => notif._id !== id)
      );
      
      // Declanșează un eveniment pentru a notifica alte componente
      window.dispatchEvent(new Event('notifications-updated'));
      
      console.log('Notificarea a fost ștearsă cu succes');
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await axios.delete('http://localhost:5000/api/notifications/delete-all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Actualizăm starea local (setăm un array gol)
      setNotifications([]);
      
      // Declanșează un eveniment pentru a notifica alte componente
      window.dispatchEvent(new Event('notifications-updated'));
      
      console.log('Toate notificările au fost șterse cu succes');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      setError('Failed to delete all notifications');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FaBell className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex space-x-4">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FaCheckDouble className="mr-2" />
                    Mark all as read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={deleteAllNotifications}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                  >
                    <FaTrash className="mr-2" />
                    Delete all
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 border-l-4 border-red-500">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 ${
                    !notification.read
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(notification.createdAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                          title="Mark as read"
                        >
                          <FaCheck className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                        title="Delete notification"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications; 