import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/api';

function AddDoctor() {
  const navigate = useNavigate();
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

  // Încarcă lista de clinici
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

    fetchClinics();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', formData.name);
    formData.append('email', formData.email);
    formData.append('clinicId', formData.clinic);
    formData.append('description', formData.description);

    try {
      await apiClient.post('/api/admin/doctors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/admin/doctors');
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

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-[var(--background-900)] rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-[var(--text-900)] dark:text-[var(--text-100)]">
          Adaugă Doctor Nou
        </h2>
        
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-200">
            Notă: Creați contul inițial al doctorului și asociați-l cu o clinică. 
            Doctorul își va completa restul informațiilor la prima autentificare.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">
              Nume Complet
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] dark:bg-[var(--background-800)] dark:border-gray-700"
              placeholder="Dr. Nume Prenume"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] dark:bg-[var(--background-800)] dark:border-gray-700"
              placeholder="doctor@example.com"
            />
          </div>

          <div>
            <label htmlFor="clinic" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">
              Clinică
            </label>
            <select
              id="clinic"
              name="clinic"
              required
              value={formData.clinic}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] dark:bg-[var(--background-800)] dark:border-gray-700"
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
            <label htmlFor="description" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">
              Scurtă Descriere
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] dark:bg-[var(--background-800)] dark:border-gray-700"
              placeholder="O scurtă descriere inițială a doctorului..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-500)] hover:bg-[var(--primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Se creează contul...' : 'Creează Cont Doctor'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddDoctor;