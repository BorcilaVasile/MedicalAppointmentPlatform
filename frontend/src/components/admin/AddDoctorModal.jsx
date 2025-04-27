import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../config/api';

function AddDoctorModal({ isOpen, onClose, onSuccess }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    password: '',
    phone: '',
    address: ' ',
    clinic: '',
    description: '',
    image: null, // Initialize image as null for file input
  });
  const [clinics, setClinics] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await apiClient.get('/api/admin/clinics', 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      const clinicsData = response.data.clinics || [];
      setClinics(Array.isArray(clinicsData) ? clinicsData : []);
      console.log('Clinics:', clinicsData);
      } catch (err) {
        console.error('Error fetching clinics:', err);
        setError('Failed to fetch clinics');
      }
    };

    const fetchSpecialties = async () => {
      try {
        const response = await apiClient.get('/api/specialties', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Response: ', response.data);
        const specialtiesData = response.data || [];
        setSpecialties(Array.isArray(specialtiesData) ? specialtiesData : []);
        console.log('Specialties:', specialtiesData);
      } catch (err) {
        console.error('Error fetching specialties:', err);
        setError('Failed to fetch specialties');
      }
    };

    if (isOpen) {
      fetchClinics();
      fetchSpecialties();
    }
  }, [isOpen, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const requestData = new FormData();
    requestData.append('firstName', formData.firstName);
    requestData.append ('lastName', formData.lastName);
    requestData.append('email', formData.email);
    requestData.append('gender', formData.gender);
    requestData.append('phone', formData.phone ? formData.phone : '');
    requestData.append('address', formData.address ? formData.address : '');
    requestData.append('password', formData.password ? formData.password : 'password123');
    requestData.append('specialization', formData.description ? formData.description : '');
    requestData.append('clinic', formData.clinic);  
    requestData.append('specialty', formData.specialty);
    requestData.append('description', formData.description);
    if (formData.image) {
      requestData.append('image', formData.image);
    }
    console.log('Form data:', formData);
    console.log('Request data:', requestData);
    try {
      await apiClient.post('/api/admin/doctors', requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
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
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[var(--background-900)] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)]">
              Add a new doctor
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
              Observation: The doctor will be able to add their own descriptions and edit their details later.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                First name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
                placeholder="First name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Last name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
                placeholder="Last name"
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
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Password (optional)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
                placeholder="Leave empty for default password"
              />
              <p className="mt-1 text-xs text-[var(--text-500)]">
                If you leave this field empty, the password will be set to "password123".
              </p>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Phone number (optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
                placeholder="07xxxxxxxx"
              />
            </div>
            <div>
              <label htmlFor="clinic" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Clinic
              </label>
              <select
                id="clinic"
                name="clinic"
                required
                value={formData.clinic}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
              >
                <option key="" value="">Select clinic</option>
                {clinics.map((clinic) => (
                  <option key={clinic._id} value={clinic._id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor='specialization' className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Specialization
              </label>
              <select
                id="specialty"
                name="specialty"
                required
                value={formData.specialty}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
              >
                <option value="">Select specialization</option>
                {specialties.map((specialty) => (
                  <option key={specialty._id} value={specialty._id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Profile Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Short description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
                placeholder="A brief description of the doctor"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--text-600)] dark:text-[var(--text-400)] hover:text-[var(--text-900)] dark:hover:text-[var(--text-100)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white bg-[var(--primary-500)] rounded-md hover:bg-[var(--primary-600)] transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddDoctorModal; 