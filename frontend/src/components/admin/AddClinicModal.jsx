import React, { useState } from 'react';
import { FaTimes, FaHospital, FaMapMarkerAlt, FaImage } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../config/api';

const AddClinicModal = ({ isOpen, onClose, onSuccess }) => {
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
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.address || !formData.phone || !formData.image) {
      setError('Name, address, phone, and image are required');
      setLoading(false);
      return;
    }

    const requestData = new FormData();
    requestData.append('name', formData.name);
    requestData.append('address', formData.address);
    requestData.append('phone', formData.phone);
    requestData.append('description', formData.description);
    if (formData.image) {
      requestData.append('image', formData.image);
    }

    console.log('Form data:', formData);
    console.log('Request data:', requestData);
    try {
      await apiClient.post('/api/admin/clinics', requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      onClose();
      onSuccess();
    } catch (err) {
      console.error('Error adding clinic:', err);
      setError(err.response?.data?.message || 'Failed to add clinic');
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
              Add a new clinic
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
                  Clinic name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaHospital className="h-5 w-5 text-[var(--primary-500)]" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                    placeholder="Insert clinic's name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-[var(--primary-500)]" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                    placeholder="Insert clinic's address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                  placeholder="Insert phone numbers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                  placeholder="Insert a description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
                  Image
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaImage className="h-5 w-5 text-[var(--primary-500)]" />
                  </div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleChange}
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white bg-[var(--primary-500)] rounded-md hover:bg-[var(--primary-600)] transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create clinic'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClinicModal; 