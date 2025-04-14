import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaHospital, FaMapMarkerAlt, FaPhone, FaPlus, FaEye } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AddClinicModal from './AddClinicModal';
import { apiClient, getImageUrl } from '../../config/api';

const ClinicsList = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await apiClient.get('/api/admin/clinics');
      setClinics(response.data);
    } catch (err) {
      console.error('Error fetching clinics:', err);
      setError('Failed to fetch clinics');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClinic = async (clinicId) => {
    if (!window.confirm('Are you sure you want to delete this clinic?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/admin/clinics/${clinicId}`);
      setClinics(clinics.filter(clinic => clinic._id !== clinicId));
    } catch (err) {
      console.error('Error deleting clinic:', err);
      setError('Failed to delete clinic');
    }
  };

  const handleClinicAdded = (newClinic) => {
    setClinics([...clinics, newClinic]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-500)]"></div>
      </div>
    );
  }

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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] dark:text-[var(--text-400)] uppercase tracking-wider">
                  Clinică
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] dark:text-[var(--text-400)] uppercase tracking-wider">
                  Adresă
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] dark:text-[var(--text-400)] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] dark:text-[var(--text-400)] uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
              {clinics.map(clinic => (
                <tr 
                  key={clinic._id}
                  className="hover:bg-[var(--background-50)] dark:hover:bg-[var(--background-800)] transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[var(--primary-100)] dark:bg-[var(--primary-900)] rounded-lg flex items-center justify-center">
                        <img
                          src={getImageUrl(clinic.image) || '/default-clinic.jpg'}
                          alt={`${clinic.name}`}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">
                          {clinic.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      <FaMapMarkerAlt className="h-4 w-4 text-[var(--primary-500)] mr-2" />
                      {clinic.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      <FaPhone className="h-4 w-4 text-[var(--primary-500)] mr-2" />
                      {clinic.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex justify-end space-x-3">
                      <Link
                        to={`/clinics/${clinic._id}`}
                        className="text-[var(--primary-500)] hover:text-[var(--primary-600)] dark:text-[var(--primary-400)] dark:hover:text-[var(--primary-300)]"
                        title="Vezi clinica"
                      >
                        <FaEye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClinic(clinic._id)}
                        className="text-[var(--error-500)] hover:text-[var(--error-600)] dark:text-[var(--error-400)] dark:hover:text-[var(--error-300)]"
                        title="Șterge clinica"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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