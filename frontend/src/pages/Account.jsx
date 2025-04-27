import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoutIcon from '../assets/logout.svg';
import maleProfilePicture from '../assets/male_profile_picture.png';
import femaleProfilePicture from '../assets/female_profile_picture.png';
import { FaEdit, FaSave, FaTimes, FaLock, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaUserMd, FaHospital, FaBriefcase } from 'react-icons/fa';
import apiClient, { getImageUrl } from '../config/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Account() {
  const { logout, userRole } = useAuth();
  const [ showCurrentPassword, setShowCurrentPassword]=useState(false);
  const [ showNewPassword, setShowNewPassword ]=useState(false);
  const [ showConfirmPassword, setShowConfirmPassword ]= useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePicture: '',
    registrationDate: '',
    gender: '',
  });
  const [doctorData, setDoctorData] = useState({
    firstName: '',
    lastName: '',
    specialty: '',
    clinic: '',
    experience: '',
    description: '',
    profilePicture: '',
    phone: '',
    gender: '',
    registrationDate: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const navigate = useNavigate();
  const isDoctor = userRole === 'Doctor';
  const isAdmin = userRole === 'Admin';

  // Fetch user data on page load
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log('Fetching user data...');
        
        // Different endpoint based on user type
        let endpoint = '/api/patient';
        
        if (isDoctor) {
          endpoint = '/api/doctor';
        } else if (isAdmin) {
          endpoint = '/api/admin';
        }
        
        const response = await apiClient.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('User data fetched:', response.data);
        
        // For doctor, adjust data to fit our structure
        if (isDoctor) {
          setUserData({
            name: `${response.data.firstName} ${response.data.lastName}`,
            email: response.data.email || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            specialty: response.data.specialty?.name || '',
            clinic: response.data.clinic?.name || '',
            experience: response.data.experience || '',
            gender: response.data.gender || '',
            profilePicture: response.data.profilePicture || '',
            createdAt: response.data.createdAt || ''
          });
          setFormData({
            name: `${response.data.firstName} ${response.data.lastName}`,
            email: response.data.email || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            specialty: response.data.specialty?.name || '',
            clinic: response.data.clinic?.name || '',
            experience: response.data.experience || '',
            gender: response.data.gender || '',
            profilePicture: response.data.profilePicture || '',
            createdAt: response.data.createdAt || ''
          });
        } else if (isAdmin) {
          // For admin, handle data similar to doctor but with Admin model fields
          setUserData({
            name: `${response.data.firstName} ${response.data.lastName}`,
            email: response.data.email || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            profilePicture: response.data.profilePicture || '',
            createdAt: response.data.createdAt || ''
          });
          setFormData({
            name: `${response.data.firstName} ${response.data.lastName}`,
            email: response.data.email || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            createdAt: response.data.createdAt || ''
          });
        } else {
          // For patient, use data as is
          setUserData(response.data);
          setFormData({
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone || '',
            address: response.data.address || '',
            gender: response.data.gender || '',
            profilePicture: response.data.profilePicture || '',
            createdAt: response.data.createdAt || ''
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Eroare la preluarea datelor utilizatorului');
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [logout, navigate, isDoctor, isAdmin]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes to user data
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
  
    if (!formData.name || !formData.email) {
      setError('Numele și emailul sunt obligatorii');
      setLoading(false);
      return;
    }
  
    try {
      const formDataToSend = new FormData();
      
      // Append only changed fields to optimize payload
      if (formData.name) {
        // For doctor and admin, split name into firstName and lastName
        if (isDoctor || isAdmin) {
          const nameParts = formData.name.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          formDataToSend.append('firstName', firstName);
          formDataToSend.append('lastName', lastName);
        } else {
          formDataToSend.append('name', formData.name);
        }
      }
      
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      if (formData.address) formDataToSend.append('address', formData.address);
      
      if (profilePicture instanceof File) {
        formDataToSend.append('profilePicture', profilePicture);
      }
      
      // Different endpoint based on user type
      let endpoint = '/api/patient';
      
      if (isDoctor) {
        endpoint = '/api/doctor';
      } else if (isAdmin) {
        endpoint = '/api/admin';
      }
      
      const response = await apiClient.put(endpoint, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      // Update state based on user type
      if (isDoctor || isAdmin) {
        const userData = response.data.doctor || response.data.admin || response.data;
        setUserData({
          ...userData,
          name: `${userData.firstName} ${userData.lastName}`
        });
      } else {
        setUserData(response.data.patient || response.data);
      }
      
      setIsEditing(false);
      setSuccess('Datele au fost actualizate cu succes!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'A apărut o eroare la actualizarea datelor'
      );
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (isDoctor) {
      setFormData({
        name: `${userData.firstName || ''} ${userData.lastName || ''}`,
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        specialty: userData.specialty?.name || '',
        clinic: userData.clinic?.name || '',
        experience: userData.experience || ''
      });
    } else {
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address || '',
      });
    }
    setProfilePicture(null);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('Password don\'t match!');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('The password needs to be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Different endpoint based on user type
      let endpoint = '/api/patient/password';
      
      if (isDoctor) {
        endpoint = '/api/doctor/password';
      } else if (isAdmin) {
        endpoint = '/api/admin/password';
      }
      
      await apiClient.put(endpoint, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess('Password was changed succesfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing the password');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setError('Failed to log out. Please try again.');
    }
  };

  const toggleCurrentPasswordVisibility = () => {
    if(showCurrentPassword)
      setShowCurrentPassword(false);
    else 
      setShowCurrentPassword(true);
  };

  const toggleNewPasswordVisibility = () => {
    if(showNewPassword)
      setShowNewPassword(false);
    else 
      setShowNewPassword(true);
  };

  const toggleConfirmPasswordVisibility = () => {
    if(showConfirmPassword)
      setShowConfirmPassword(false);
    else 
      setShowConfirmPassword(true);
  };


  // Renderizare condiționată pentru câmpurile specifice doctorului
  const renderDoctorSpecificFields = () => {
    if (!isDoctor) return null;
    
    return (
      <>
        {!isEditing ? (
          <>
            <div className="bg-gray-50 dark:bg-[var(--background-800)] p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <FaUserMd className="text-[var(--primary-500)]" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specialitate</label>
              </div>
              <p className="text-gray-900 dark:text-white">
                {userData.specialty?.name || userData.specialty || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-[var(--background-800)] p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <FaHospital className="text-[var(--primary-500)]" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Clinică</label>
              </div>
              <p className="text-gray-900 dark:text-white">
                {userData.clinic?.name || userData.clinic || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-[var(--background-800)] p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <FaBriefcase className="text-[var(--primary-500)]" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Experiență</label>
              </div>
              <p className="text-gray-900 dark:text-white">{userData.experience ? `${userData.experience} ani` : 'N/A'}</p>
            </div>
          </>
        ) : null /* În modul de editare nu adăugăm aceste câmpuri deoarece specialitatea și clinica se setează din altă parte */}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--background-50)] to-[var(--background-200)] dark:from-[var(--background-950)] dark:to-[var(--background-800)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white dark:bg-[var(--background-900)] rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] p-6 text-white">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Account informations</h1>
              <motion.button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={logoutIcon} alt="Logout" className="h-5 w-5" />
                <span>Disconnect</span>
              </motion.button>
            </div>
          </div>

          <div className="p-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                   src={userData?.profilePicture
                        ? getImageUrl(userData.profilePicture)
                        : userData?.gender === 'Female' 
                        ? femaleProfilePicture
                        : maleProfilePicture
                  }
                  alt="Profile picture"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-[var(--background-800)] shadow-lg"
                />
                {isEditing && (
                  <label
                    htmlFor="profilePicture"
                    className="absolute bottom-0 right-0 bg-[var(--primary-500)] text-white p-2 rounded-full cursor-pointer hover:bg-[var(--primary-600)] transition-colors"
                  >
                    <FaCamera />
                    <input
                      type="file"
                      id="profilePicture"
                      name="profilePicture"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                )}
              </motion.div>
            </div>

            {/* Success/Error Messages */}
            <AnimatePresence>
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-6 p-4 rounded-lg ${
                    error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {error || success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  activeTab === 'personal'
                    ? 'text-[var(--primary-500)] border-b-2 border-[var(--primary-500)]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[var(--primary-500)]'
                }`}
              >
                Personal informations
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  activeTab === 'password'
                    ? 'text-[var(--primary-500)] border-b-2 border-[var(--primary-500)]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[var(--primary-500)]'
                }`}
              >
                Change password
              </button>
            </div>

            {/* Personal Info Tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {!isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-[var(--background-800)] p-4 rounded-lg">
                          <div className="flex items-center space-x-3 mb-2">
                            <FaUser className="text-[var(--primary-500)]" />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                          </div>
                          <p className="text-gray-900 dark:text-white">
                           {userData.name}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-[var(--background-800)] p-4 rounded-lg">
                          <div className="flex items-center space-x-3 mb-2">
                            <FaEnvelope className="text-[var(--primary-500)]" />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                          </div>
                          <p className="text-gray-900 dark:text-white">{userData.email}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-[var(--background-800)] p-4 rounded-lg">
                          <div className="flex items-center space-x-3 mb-2">
                            <FaPhone className="text-[var(--primary-500)]" />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone number</label>
                          </div>
                          <p className="text-gray-900 dark:text-white">{userData.phone || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-[var(--background-800)] p-4 rounded-lg">
                          <div className="flex items-center space-x-3 mb-2">
                            <FaMapMarkerAlt className="text-[var(--primary-500)]" />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                          </div>
                          <p className="text-gray-900 dark:text-white">{userData.address || 'N/A'}</p>
                        </div>
                        {!isAdmin && renderDoctorSpecificFields()}
                      </div>
                      <div className="flex justify-center">
                        <motion.button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white rounded-lg hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaEdit />
                          <span>Edit details</span>
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[var(--background-800)] text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[var(--background-800)] text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone number
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[var(--background-800)] text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[var(--background-800)] text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex justify-center space-x-4">
                        <motion.button
                          type="submit"
                          disabled={loading}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white rounded-lg hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] transition-all disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaSave />
                          <span>{loading ? 'Se salvează...' : 'Salvează'}</span>
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={handleCancel}
                          disabled={loading}
                          className="flex items-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaTimes />
                          <span>Anulează</span>
                        </motion.button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center w-full"
                >
                  <form onSubmit={handleChangePassword} className="space-y-6 w-full max-w-xl">
                  <div className="grid grid-cols-1 gap-6">
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[var(--background-800)] text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                          placeholder='Enter your current password'
                          required
                        />
                        <button
                          type="button"
                          onClick={toggleCurrentPasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-600)] dark:text-[var(--text-400)] hover:text-[var(--primary-500)] dark:hover:text-[var(--primary-600)]"
                          >
                          {showCurrentPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                          </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[var(--background-800)] text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                          placeholder='Enter your new password'
                          required
                        />
                        <button
                          type="button"
                          onClick={toggleNewPasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-600)] dark:text-[var(--text-400)] hover:text-[var(--primary-500)] dark:hover:text-[var(--primary-600)]"
                          >
                          {showNewPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                          </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmNewPassword"
                          value={passwordData.confirmNewPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[var(--background-800)] text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                          placeholder='Confirm your new password'
                          required
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-600)] dark:text-[var(--text-400)] hover:text-[var(--primary-500)] dark:hover:text-[var(--primary-600)]"
                          >
                          {showConfirmPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                          </button>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white rounded-lg hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] transition-all disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaLock />
                        <span>{loading ? 'Saving changes...' : 'Change password'}</span>
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Registration Date */}
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Registration date: {new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Account;