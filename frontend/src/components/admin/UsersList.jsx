import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaTrash } from 'react-icons/fa';
import { apiClient } from '../../config/api';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

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
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] bg-clip-text text-transparent">
          Lista Utilizatori
        </h2>
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
    </div>
  );
};

export default UsersList; 