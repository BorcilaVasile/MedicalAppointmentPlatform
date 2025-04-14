import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaHospital, FaMapMarkerAlt, FaPhone, FaPlus, FaEye, FaEdit, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AddClinicModal from './AddClinicModal';
import { apiClient, getImageUrl } from '../../config/api';

const ITEMS_PER_PAGE = 10;

const ClinicsList = ({ onRefresh }) => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalClinics, setTotalClinics] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();

  const fetchClinics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/clinics?page=${page}&limit=${ITEMS_PER_PAGE}`);
      
      // Check if response has the expected structure
      if (!response.data || !Array.isArray(response.data.clinics)) {
        throw new Error('Invalid response format from server');
      }

      setClinics(response.data.clinics);
      setTotalClinics(response.data.total);
      setError('');
    } catch (err) {
      console.error('Error fetching clinics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch clinics');
      setClinics([]);
      setTotalClinics(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics, page]);

  const handleDeleteClinic = async (clinicId) => {
    if (!window.confirm('Are you sure you want to delete this clinic?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/clinics/${clinicId}`);
      setClinics(clinics.filter(clinic => clinic._id !== clinicId));
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error deleting clinic:', err);
      setError('Failed to delete clinic');
    }
  };

  const handleClinicAdded = (newClinic) => {
    setClinics([...clinics, newClinic]);
  };

  const totalPages = Math.ceil(totalClinics / ITEMS_PER_PAGE);

  if (loading) return (
    <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
      <div className="text-center text-[var(--text-600)] dark:text-[var(--text-400)]">Loading clinics...</div>
    </div>
  );
  
  if (error) return (
    <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
      <div className="text-[var(--error-500)]">Error: {error}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] bg-clip-text text-transparent">
          Lista Clinicilor
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white rounded-lg hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] transition-all"
        >
          <FaPlus />
          <span>Adaugă Clinică</span>
        </button>
      </div>

      {error && (
        <div className={`mb-4 p-4 rounded-lg ${
          error.type === 'success' 
            ? 'bg-[var(--success-50)] dark:bg-[var(--success-900)] text-[var(--success-600)] dark:text-[var(--success-200)]'
            : 'bg-[var(--error-50)] dark:bg-[var(--error-900)] text-[var(--error-600)] dark:text-[var(--error-200)]'
        }`}>
          {error.message}
        </div>
      )}

      {clinics.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-600)] dark:text-[var(--text-400)]">
          Nu există clinici înregistrate.
        </div>
      ) : (
        <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[var(--background-200)] dark:border-[var(--background-700)]">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] bg-clip-text text-transparent">
                Lista Clinici
              </h2>
              <div className="text-sm text-[var(--text-500)]">
                Total: {totalClinics} clinici
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
                    Adresă
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                    Doctori
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background-100)] dark:bg-[var(--background-800)] divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
                {clinics.map((clinic) => (
                  <tr key={clinic._id} className="hover:bg-[var(--background-200)] dark:hover:bg-[var(--background-700)] transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">{clinic.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-600)] dark:text-[var(--text-400)]">{clinic.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-600)] dark:text-[var(--text-400)]">{clinic.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-600)] dark:text-[var(--text-400)]">{clinic.doctors?.length || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDeleteClinic(clinic._id)}
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
                  <span className="font-medium">{Math.min(page * ITEMS_PER_PAGE, totalClinics)}</span> of{' '}
                  <span className="font-medium">{totalClinics}</span> results
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
      )}

      <AddClinicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClinicAdded={handleClinicAdded}
      />
    </div>
  );
};

export default ClinicsList; 