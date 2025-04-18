import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import apiClient, { getImageUrl } from '../config/api';
import maleProfilePicture from '../assets/male_profile_picture.png';
import femaleProfilePicture from '../assets/female_profile_picture.png';
import DoctorProfileAppointments from '../components/DoctorProfileAppointments';
import DoctorProfileReviews from '../components/DoctorProfileReviews';

function DoctorProfile() {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Fetch doctor data
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await apiClient.get(`/api/doctors/${id}`);
        setDoctor(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        setError('Failed to fetch doctor data');
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await apiClient.get(`/api/reviews/${id}`);
        setDoctor(prevDoctor => ({ ...prevDoctor, reviews: response.data }));
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchDoctorData();
    fetchReviews();
  }, [id]);

  // Handle adding a new review
  const handleReviewAdded = (newReview) => {
    setDoctor(prevDoctor => ({
      ...prevDoctor,
      reviews: [newReview, ...(prevDoctor.reviews || [])]
    }));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-500)]"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500 text-xl">{error}</p>
    </div>
  );

  if (!doctor) return (
    <div className="text-center py-12">
      <p className="text-lg text-[var(--text-600)]">Doctorul nu a fost găsit.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={doctor.profilePicture ? getImageUrl(doctor.profilePicture) :
                doctor.gender=='Male' ? maleProfilePicture : femaleProfilePicture}
                alt={`${doctor.firstName} ${doctor.lastName}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="p-6 md:w-2/3">
              <div className="flex flex-wrap items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-2">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h1>
                  <p className="text-lg text-[var(--text-600)] dark:text-[var(--text-400)] mb-4">
                    {doctor.specialty.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-[var(--text-600)] dark:text-[var(--text-400)]">
                  <FaMapMarkerAlt className="w-5 h-5 text-[var(--primary-500)]" />
                  <span>{doctor.clinic.name || 'No available location'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-600)] dark:text-[var(--text-400)]">
                  <FaPhone className="w-5 h-5 text-[var(--primary-500)]" />
                  <span>{doctor.phone || 'No available phone number'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-600)] dark:text-[var(--text-400)]">
                  <FaEnvelope className="w-5 h-5 text-[var(--primary-500)]" />
                  <span>{doctor.email || 'No available email address'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-600)] dark:text-[var(--text-400)]">
                  <FaClock className="w-5 h-5 text-[var(--primary-500)]" />
                  <span>Luni - Vineri, 09:00 - 17:00</span>
                </div>
              </div>

              <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                {doctor.description || 'No available description'}
              </p>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="p-4 rounded-lg bg-[var(--error-50)] text-[var(--error-600)] dark:bg-[var(--error-900)] dark:text-[var(--error-200)] mb-8">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="p-4 rounded-lg bg-[var(--success-50)] text-[var(--success-600)] dark:bg-[var(--success-900)] dark:text-[var(--success-200)] mb-8">
            {submitSuccess}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Appointments Section */}
          <DoctorProfileAppointments 
            doctorId={id} 
            token={token} 
            isAuthenticated={isAuthenticated} 
          />

          {/* Reviews Section */}
          <DoctorProfileReviews 
            doctorId={id} 
            doctor={doctor} 
            isAuthenticated={isAuthenticated} 
            token={token}
            onReviewAdded={handleReviewAdded}
          />
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;