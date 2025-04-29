import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaCheck, FaCheckDouble, FaBell } from 'react-icons/fa';
import { format } from 'date-fns';
import apiClient from '../config/api';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    window.dispatchEvent(new Event('notifications-updated'));
    fetchNotifications();
  }, []);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    document.title = unreadCount > 0 
      ? `(${unreadCount}) Notificări - Elysium` 
      : `Notificări - Elysium`;
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/notifications');
      setNotifications(response.data);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await apiClient.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await apiClient.delete('/api/notifications/delete-all');
      setNotifications([]);
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete all');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center">
                <FaBell className="h-5 w-5 text-blue-500 mr-2" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-blue-500 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
                  >
                    <FaCheckDouble className="mr-2" /> Mark all as read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAllNotifications}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition"
                  >
                    <FaTrash className="mr-2" /> Delete all
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 border-l-4 border-red-500">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Notifications */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 sm:p-6 ${
                    !notification.read
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white flex items-center">
                        {notification.message}
                        {!notification.read && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full">
                            New
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(notification.createdAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="flex space-x-2 justify-end">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                          title="Mark as read"
                        >
                          <FaCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                        title="Delete notification"
                      >
                        <FaTrash className="h-4 w-4" />
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
