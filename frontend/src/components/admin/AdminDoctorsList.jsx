import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaTrash, FaChevronLeft, FaChevronRight, FaPlus, FaUser, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/api';
import AddDoctorModal from './AddDoctorModal';
import EditDoctorModal from './EditDoctorModal';

const ITEMS_PER_PAGE = 10;

const AdminDoctorsList = ({ onRefresh }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/admin/doctors?page=${page}&limit=${ITEMS_PER_PAGE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
  }, [page, token]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleDeleteDoctor = async (doctorId) => {
   const doctor = doctors.find(d => d._id === doctorId);
   if (!doctor) {
     setError('Doctor not found');
     return;
   }
 
   // Verifică dacă doctorul este activ
    if (doctor.active) {
      alert('Cannot delete an active doctor. Please set the doctor as inactive first.');
      return;
    }
 
   // Afișează confirmarea doar dacă doctorul este inactiv
   if (!window.confirm('Are you sure you want to delete this doctor?')) {
     return;
   }

    try {
      await apiClient.delete(`/api/admin/doctors/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(doctors.filter(doctor => doctor._id !== doctorId));
      setTotalDoctors(totalDoctors - 1);
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error deleting doctor:', err);
      setError(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const handleViewProfile = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setIsEditModalOpen(true);
  };

  const handleDoctorAdded = (newDoctor) => {
    setDoctors([...doctors, newDoctor]);
    setTotalDoctors(totalDoctors + 1);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleDoctorUpdated = (updatedDoctor) => {
    setDoctors(doctors.map(doctor => (doctor._id === updatedDoctor._id ? updatedDoctor : doctor)));
    setIsEditModalOpen(false);
    setSelectedDoctor(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  const totalPages = Math.ceil(totalDoctors / ITEMS_PER_PAGE);

  if (loading) return (
    <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
      <div className="text-center text-[var(--text-600)] dark:text-[var(--text-400)]">Loading doctors...</div>
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
          <span>Add Doctor</span>
        </button>
      </div>

      <AddDoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleDoctorAdded}
      />

      <EditDoctorModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDoctor(null);
        }}
        onSuccess={handleDoctorUpdated}
        doctor={selectedDoctor}
      />

      {doctors.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-600)] dark:text-[var(--text-400)]">
          There are no doctors available.
        </div>
      ) : (
        <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[var(--background-200)] dark:border-[var(--background-700)]">
            <div className="flex justify-between items-center">
              <div className="text-sm text-[var(--text-500)]">
                Total: {totalDoctors} doctors
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
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-600)] dark:text-[var(--text-400)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background-100)] dark:bg-[var(--background-800)] divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
                {doctors.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-[var(--background-200)] dark:hover:bg-[var(--background-700)] transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-left font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">{doctor.firstName} {doctor.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-left text-[var(--text-600)] dark:text-[var(--text-400)]">{doctor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doctor.gender === 'Male'
                            ? 'bg-gradient-to-r from-[var(--primary-100)] to-[var(--primary-200)] dark:from-[var(--primary-900)] dark:to-[var(--primary-800)] text-[var(--primary-800)] dark:text-[var(--primary-200)]'
                            : 'bg-gradient-to-r from-[var(--secondary-100)] to-[var(--secondary-200)] dark:from-[var(--secondary-900)] dark:to-[var(--secondary-800)] text-[var(--secondary-800)] dark:text-[var(--secondary-200)]'
                        }`}
                      >
                        {doctor.gender || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            doctor.active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {doctor.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                      <button
                        onClick={() => handleViewProfile(doctor._id)}
                        className="text-[var(--primary-500)] hover:text-[var(--primary-700)] dark:text-[var(--primary-400)] dark:hover:text-[var(--primary-300)] transition-colors duration-200"
                        title="View Profile"
                      >
                        <FaUser />
                      </button>
                      <button
                        onClick={() => handleEditDoctor(doctor)}
                        className="text-[var(--secondary-500)] hover:text-[var(--secondary-700)] dark:text-[var(--secondary-400)] dark:hover:text-[var(--secondary-300)] transition-colors duration-200"
                        title="Edit Doctor"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor._id)}
                        className="text-[var(--error-500)] hover:text-[var(--error-700)] dark:text-[var(--error-400)] dark:hover:text-[var(--error-300)] transition-colors duration-200"
                        title="Delete Doctor"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
      )}
    </div>
  );
};

export default AdminDoctorsList;