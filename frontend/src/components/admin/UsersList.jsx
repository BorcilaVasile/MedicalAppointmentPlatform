import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { apiClient } from '../../config/api';

const ITEMS_PER_PAGE = 10;

const UsersList = ({ onRefresh }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const { token } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/users?page=${page}&limit=${ITEMS_PER_PAGE}`);
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, page]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  if (loading) return (
    <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
      <div className="text-center text-[var(--text-600)] dark:text-[var(--text-400)]">Loading users...</div>
    </div>
  );
  
  if (error) return (
    <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
      <div className="text-[var(--error-500)]">Error: {error}</div>
    </div>
  );

  return (
    <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-[var(--background-200)] dark:border-[var(--background-700)]">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] bg-clip-text text-transparent">
            Lista Utilizatori
          </h2>
          <div className="text-sm text-[var(--text-500)]">
            Total: {totalUsers} utilizatori
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
          <thead className="bg-[var(--background-50)] dark:bg-[var(--background-900)]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                Nume
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--background-100)] dark:bg-[var(--background-800)] divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-[var(--background-200)] dark:hover:bg-[var(--background-700)] transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[var(--text-600)] dark:text-[var(--text-400)]">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-gradient-to-r from-[var(--primary-100)] to-[var(--primary-200)] dark:from-[var(--primary-900)] dark:to-[var(--primary-800)] text-[var(--primary-800)] dark:text-[var(--primary-200)]'
                      : 'bg-gradient-to-r from-[var(--secondary-100)] to-[var(--secondary-200)] dark:from-[var(--secondary-900)] dark:to-[var(--secondary-800)] text-[var(--secondary-800)] dark:text-[var(--secondary-200)]'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-[var(--error-500)] hover:text-[var(--error-700)] dark:text-[var(--error-400)] dark:hover:text-[var(--error-300)] transition-colors duration-200"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--background-200)] dark:border-[var(--background-700)]">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-[var(--text-900)] dark:text-[var(--text-100)] bg-white dark:bg-[var(--background-800)] disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-[var(--text-900)] dark:text-[var(--text-100)] bg-white dark:bg-[var(--background-800)] disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[var(--text-500)]">
              Showing <span className="font-medium">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * ITEMS_PER_PAGE, totalUsers)}</span> of{' '}
              <span className="font-medium">{totalUsers}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[var(--background-300)] dark:border-[var(--background-600)] bg-white dark:bg-[var(--background-800)] text-sm font-medium text-[var(--text-500)] hover:bg-[var(--background-50)] disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <FaChevronLeft className="h-5 w-5" />
              </button>
              {/* Page numbers */}
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setPage(idx + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border border-[var(--background-300)] dark:border-[var(--background-600)] text-sm font-medium ${
                    page === idx + 1
                      ? 'z-10 bg-[var(--primary-50)] border-[var(--primary-500)] text-[var(--primary-600)]'
                      : 'bg-white dark:bg-[var(--background-800)] text-[var(--text-500)] hover:bg-[var(--background-50)]'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[var(--background-300)] dark:border-[var(--background-600)] bg-white dark:bg-[var(--background-800)] text-sm font-medium text-[var(--text-500)] hover:bg-[var(--background-50)] disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <FaChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersList; 