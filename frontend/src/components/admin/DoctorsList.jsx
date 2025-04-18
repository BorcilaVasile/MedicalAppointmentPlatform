import React, { useState, useEffect, useCallback } from 'react';
import { FaTrash, FaEdit, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import maleProfilePicture from '../../assets/male_profile_picture.png';
import femaleProfilePicture from '../../assets/female_profile_picture.png';
import { apiClient, getImageUrl } from '../../config/api';

const ITEMS_PER_PAGE = 10;

const DoctorsList = ({ onRefresh }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const { token } = useAuth();

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/doctors?page=${page}&limit=${ITEMS_PER_PAGE}`);
      
      // Check if response has the expected structure
      if (!response.data || !Array.isArray(response.data.doctors)) {
        throw new Error('Invalid response format from server');
      }

      setDoctors(response.data.doctors);
      setTotalDoctors(response.data.total);
      setError('');
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch doctors');
      setDoctors([]);
      setTotalDoctors(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors, page]);

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/doctors/${doctorId}`);
      setDoctors(doctors.filter(doctor => doctor._id !== doctorId));
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error deleting doctor:', err);
      setError('Failed to delete doctor');
    }
  };

  const totalPages = Math.ceil(totalDoctors / ITEMS_PER_PAGE);

  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
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
            Lista Doctori
          </h2>
          <div className="text-sm text-[var(--text-500)]">
            Total: {totalDoctors} doctori
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
                Specialitate
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                Clinică
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--background-100)] dark:bg-[var(--background-800)] divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
            {doctors.map((doctor) => (
              <tr key={doctor._id} className="hover:bg-[var(--background-200)] dark:hover:bg-[var(--background-700)] transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">{doctor.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[var(--text-600)] dark:text-[var(--text-400)]">{doctor.specialty}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[var(--text-600)] dark:text-[var(--text-400)]">{doctor.clinic?.name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDeleteDoctor(doctor._id)}
                      className="text-[var(--error-500)] hover:text-[var(--error-700)] dark:text-[var(--error-400)] dark:hover:text-[var(--error-300)] transition-colors duration-200"
                    >
                      <FaTrash />
                    </button>
                  </div>
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
              <span className="font-medium">{Math.min(page * ITEMS_PER_PAGE, totalDoctors)}</span> of{' '}
              <span className="font-medium">{totalDoctors}</span> results
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

export default DoctorsList; 