import React, { useState } from 'react';
import { FaTimes, FaHospital, FaMapMarkerAlt, FaImage } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AddClinicModal = ({ isOpen, onClose, onClinicAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    image: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('description', formData.description);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch('http://localhost:5000/api/admin/clinics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Eroare la adăugarea clinicii');
      }

      const newClinic = await response.json();
      onClinicAdded(newClinic);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        
        <div className="relative bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-xl shadow-xl transform transition-all w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b border-[var(--background-200)] dark:border-[var(--background-700)]">
            <h3 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)]">
              Adaugă Clinică Nouă
            </h3>
            <button
              onClick={onClose}
              className="text-[var(--text-500)] hover:text-[var(--text-700)] dark:text-[var(--text-400)] dark:hover:text-[var(--text-200)] transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-[var(--error-50)] dark:bg-[var(--error-900)] text-[var(--error-600)] dark:text-[var(--error-200)]">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
                  Nume Clinică
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaHospital className="h-5 w-5 text-[var(--primary-500)]" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                    placeholder="Introdu numele clinicii"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
                  Adresă
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-[var(--primary-500)]" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                    placeholder="Introdu adresa clinicii"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                  placeholder="Introdu numărul de telefon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
                  Descriere
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                  placeholder="Introdu o descriere pentru clinică"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
                  Imagine
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaImage className="h-5 w-5 text-[var(--primary-500)]" />
                  </div>
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    required
                    accept="image/*"
                    className="w-full pl-10 pr-4 py-2 border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--text-900)] dark:hover:text-[var(--text-100)] transition-colors"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Se procesează...' : 'Adaugă Clinică'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClinicModal; 