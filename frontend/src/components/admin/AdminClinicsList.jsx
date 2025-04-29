import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaHospital, FaMapMarkerAlt, FaPhone, FaPlus, FaEye, FaEdit, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AddClinicModal from './AddClinicModal';
import { apiClient, getImageUrl } from '../../config/api';
import EditClinicModal from './EditClinicModal';

const ITEMS_PER_PAGE = 10;

const AdminClinicsList = ({ onRefresh }) => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalClinics, setTotalClinics] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const { token } = useAuth();


  const fetchClinics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/admin/clinics?page=${page}&limit=${ITEMS_PER_PAGE}`);
      
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
      await apiClient.delete(`/api/admin/clinics/${clinicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
    });
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

  const handleEditClinic = (clinic) => {
    setSelectedClinic(clinic);
    setIsEditModalOpen(true);
  };
  
  const handleClinicUpdated = (updatedClinic) => {
    setClinics(clinics.map(clinic => 
      clinic._id === updatedClinic._id ? updatedClinic : clinic
    ));
    if (onRefresh) {
      onRefresh();
    }
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white rounded-lg hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] transition-all"
        >
          <FaPlus />
          <span>Add Clinic</span>
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
          There are no clinics available.
        </div>
      ) : (
        <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[var(--background-200)] dark:border-[var(--background-700)]">
            <div className="flex justify-between items-center">
              <div className="text-sm text-[var(--text-500)]">
                Total: {totalClinics} clinics
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
              <thead className="bg-[var(--background-50)] dark:bg-[var(--background-900)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                    Phone number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                    Doctors
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                    Actions
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
                        <Link
                          to={`/clinics/${clinic._id}`}
                          className="text-[var(--primary-500)] hover:text-[var(--primary-700)] dark:text-[var(--primary-400)] dark:hover:text-[var(--primary-300)] transition-colors duration-200"
                          title="View Clinic Profile"
                        >
                          <FaEye />
                        </Link>
                        <button
                          onClick={() => handleEditClinic(clinic)}
                          className="text-[var(--secondary-500)] hover:text-[var(--secondary-700)] dark:text-[var(--secondary-400)] dark:hover:text-[var(--secondary-300)] transition-colors duration-200"
                          title="Edit Clinic"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClinic(clinic._id)}
                          className="text-[var(--error-500)] hover:text-[var(--error-700)] dark:text-[var(--error-400)] dark:hover:text-[var(--error-300)] transition-colors duration-200"
                          title="Delete Clinic"
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

      <EditClinicModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClinic(null);
        }}
        onSuccess={handleClinicUpdated}
        clinic={selectedClinic}
      />
    </div>
  );
};

export default AdminClinicsList; 