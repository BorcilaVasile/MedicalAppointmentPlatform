import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaUserMd } from 'react-icons/fa';
import apiClient, { getImageUrl } from '../config/api';
import { FaStar, FaFilter, FaTimes } from 'react-icons/fa';
import maleProfilePicture from '../assets/male_profile_picture.png';
import femaleProfilePicture from '../assets/female_profile_picture.png'

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] =useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ 
    gender: '',
    specialty: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await apiClient.get('/api/doctors');
        setDoctors(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch doctors');
        setLoading(false);
      }
    };

    const fetchSpecialties = async () => {
      try {
        const response = await apiClient.get('/api/specialties');
        setSpecialties(response.data);
      }catch(err){
        setError(err.response?.data?.message || 'Failed to fetch specialties');
      }
    }

    fetchSpecialties();
    fetchDoctors();
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = !filters.gender || doctor.gender === filters.gender;
    const matchesSpecialty = !filters.specialty || 
                          (doctor.specialty && doctor.specialty.name === filters.specialty);

    return matchesSearch  && matchesGender && matchesSpecialty;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-500)]"></div>
    </div>
  );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] flex items-center justify-center">
        <div className="text-[var(--error-500)] text-center">
          <p className="text-xl font-semibold">Failed to fetch data</p>
          <p className="mt-2">{error}</p>
        </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)]">
      <div className="w-full px-4 py-8">
        {/* Header and Search */}
        <div className="text-center mb-12">
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              placeholder="Caută după nume sau specializare..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-12 py-4 rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-400)]" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-[2000px] mx-auto px-4">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-[var(--text-900)] dark:text-[var(--text-100)] mb-6">
                Filters
              </h2>
                {/* Gender Filter */}
              <div className="mb-6">
                <h3 className="text-[var(--text-700)] dark:text-[var(--text-300)] mb-3">Gen</h3>
                  <div className="space-y-2">
                    {['Male', 'Female', 'Other'].map((gender) => (
                    <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                        <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={filters.gender === gender}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                        className="form-radio text-[var(--primary-500)]"
                        />
                      <span className="text-[var(--text-600)] dark:text-[var(--text-400)]">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Specialty Filter */}
                <div>
                <h3 className="text-[var(--text-700)] dark:text-[var(--text-300)] mb-3">Specialty</h3>
                <select
                  value={filters.specialty}
                  onChange={(e) => handleFilterChange('specialty', e.target.value)}
                  className="w-full p-2 rounded-md bg-[var(--background-50)] dark:bg-[var(--background-900)] text-[var(--text-900)] dark:text-[var(--text-100)] border border-[var(--border-color)]"
                >
                  <option value="">All specialties</option>
                  {specialties.map((specialty) => (
                    <option value={specialty.name}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <Link
                    key={doctor._id}
                  to={`/doctors/${doctor._id}`}
                  className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="relative">
                        <img
                      src={doctor.profilePicture ? getImageUrl(doctor.profilePicture) : 
                        doctor.gender== 'Male' ?  maleProfilePicture : femaleProfilePicture}
                      alt={doctor.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < doctor.rating ? 'text-yellow-400' : 'text-gray-400'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-white text-sm">
                          ({doctor.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[var(--text-900)] dark:text-[var(--text-100)] mb-2">
                          {doctor.firstName} {doctor.lastName}
                        </h3>
                    <p className="text-[var(--text-600)] dark:text-[var(--text-400)] mb-4">
                          {doctor.specialty.name}
                        </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--primary-500)] font-medium">
                        See profile
                      </span>
                      <span className="text-[var(--text-500)] text-sm">
                        {doctor.availableSlots || 16} available slots
                          </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
              </div>
        </div>
      </div>
    </div>
  );
};

export default Doctors;