import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../config/api';

function AddDoctorModal({ isOpen, onClose, onSuccess }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    clinic: '',
    description: ''
  });
  const [clinics, setClinics] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await apiClient.get('/api/admin/clinics');
        setClinics(response.data);
      } catch (err) {
        console.error('Error fetching clinics:', err);
        setError('Failed to fetch clinics');
      }
    };

    if (isOpen) {
      fetchClinics();
    }
  }, [isOpen, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', formData.name);
    formData.append('email', formData.email);
    formData.append('password', Math.random().toString(36).slice(-8));
    formData.append('specialization', formData.description);
    formData.append('clinicId', formData.clinic);
    if (formData.image) {
      formData.append('image', formData.image);
    }

    try {
      await apiClient.post('/api/admin/doctors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onClose();
      onSuccess();
    } catch (err) {
      console.error('Error adding doctor:', err);
      setError(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[var(--background-900)] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)]">
              Adaugă Doctor Nou
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--text-400)] hover:text-[var(--text-600)] transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-200">
              Notă: Creați contul inițial al doctorului și asociați-l cu o clinică. 
              Doctorul își va completa restul informațiilor la prima autentificare.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Nume Complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
                placeholder="Dr. Nume Prenume"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
                placeholder="doctor@example.com"
              />
            </div>

            <div>
              <label htmlFor="clinic" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Clinică
              </label>
              <select
                id="clinic"
                name="clinic"
                required
                value={formData.clinic}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
              >
                <option value="">Selectează clinica</option>
                {clinics.map(clinic => (
                  <option key={clinic._id} value={clinic._id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Scurtă Descriere
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
                placeholder="O scurtă descriere inițială a doctorului..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--text-600)] dark:text-[var(--text-400)] hover:text-[var(--text-900)] dark:hover:text-[var(--text-100)] transition-colors"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white bg-[var(--primary-500)] rounded-md hover:bg-[var(--primary-600)] transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Se creează...' : 'Creează Cont'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddDoctorModal; 