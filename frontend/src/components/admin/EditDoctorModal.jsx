import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../config/api';

function EditDoctorModal({ isOpen, onClose, onSuccess, doctor }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    lastName: '',
    password: '',
    clinic: '',
    active: true,
  });
  const [clinics, setClinics] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Precompletează formularul cu datele doctorului existent
  useEffect(() => {
    if (isOpen && doctor) {
      setFormData({
        lastName: doctor.lastName || '',
        password: '', // Parola nu se precompletează (se schimbă doar dacă se introduce una nouă)
        clinic: doctor.clinic?._id || doctor.clinic || '', // Poate fi un obiect sau ID direct
        active: doctor.active || false,
      });
    }
  }, [isOpen, doctor]);

  // Fetch lista de clinici
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await apiClient.get('/api/admin/clinics', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const clinicsData = response.data.clinics || [];
        setClinics(Array.isArray(clinicsData) ? clinicsData : []);
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

    // Construiește obiectul de date pentru cerere (doar câmpurile modificate)
    const updatedData = {
      lastName: formData.lastName,
      clinic: formData.clinic,
      active: formData.active,
    };

    // Adaugă parola doar dacă a fost introdusă una nouă
    if (formData.password) {
      updatedData.password = formData.password;
    }

    if (doctor.active && !formData.active) {
        const confirmMessage = 'Setting this doctor as inactive will cancel all their future appointments. Are you sure you want to proceed?';
        if (!window.confirm(confirmMessage)) {
          setLoading(false);
          return;
        }
      }

    try {
      const response = await apiClient.put(`/api/admin/doctors/${doctor._id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onClose();
      onSuccess(response.data); // Trimite doctorul actualizat către componenta părinte
    } catch (err) {
      console.error('Error updating doctor:', err);
      setError(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[var(--background-900)] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)]">
              Edit Doctor
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--text-400)] hover:text-[var(--text-600)] transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Last Name
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                New Password (optional)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
                placeholder="Enter new password"
              />
              <p className="mt-1 text-xs text-[var(--text-500)]">
                Leave empty to keep the current password.
              </p>
            </div>

            {/* Clinic */}
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
                <option value="">Select clinic</option>
                {clinics.map((clinic) => (
                  <option key={clinic._id} value={clinic._id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Status */}
            <div>
              <label htmlFor="active" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                Active Status
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-[var(--text-900)] dark:text-[var(--text-100)]">
                  {formData.active ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>

            {/* Submit and Cancel Buttons */}
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
                {loading ? 'Updating...' : 'Update Doctor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditDoctorModal;