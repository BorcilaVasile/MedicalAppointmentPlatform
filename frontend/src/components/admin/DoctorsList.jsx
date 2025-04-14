import React, { useState, useEffect } from 'react';
import { FaTrash, FaUserMd } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import maleProfilePicture from '../../assets/male_profile_picture.png';
import femaleProfilePicture from '../../assets/female_profile_picture.png';
import { apiClient, getImageUrl } from '../../config/api';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/api/admin/doctors');
      setDoctors(response.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/admin/doctors/${doctorId}`);
      setDoctors(doctors.filter(doctor => doctor._id !== doctorId));
    } catch (err) {
      console.error('Error deleting doctor:', err);
      setError('Failed to delete doctor');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-500)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)]">
          Listă Doctori
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-[var(--error-50)] dark:bg-[var(--error-900)] text-[var(--error-600)] dark:text-[var(--error-200)]">
          {error}
        </div>
      )}

      {doctors.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-600)] dark:text-[var(--text-400)]">
          Nu există doctori înregistrați.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] dark:text-[var(--text-400)] uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] dark:text-[var(--text-400)] uppercase tracking-wider">
                  Specializare
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] dark:text-[var(--text-400)] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] dark:text-[var(--text-400)] uppercase tracking-wider">
                  Experiență
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] dark:text-[var(--text-400)] uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
              {doctors.map(doctor => (
                <tr 
                  key={doctor._id}
                  className="hover:bg-[var(--background-50)] dark:hover:bg-[var(--background-800)] transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={getImageUrl(doctor.image) || '/default-doctor.jpg'}
                        alt={`${doctor.name}'s profile`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">
                          {doctor.name}
                        </div>
                        <div className="text-sm text-[var(--text-500)] dark:text-[var(--text-400)]">
                          {doctor.gender}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                    {doctor.specialty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                    {doctor.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                    {doctor.experience} ani
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeleteDoctor(doctor._id)}
                      className="text-[var(--error-500)] hover:text-[var(--error-600)] dark:text-[var(--error-400)] dark:hover:text-[var(--error-300)] transition-colors"
                      title="Șterge doctor"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorsList; 