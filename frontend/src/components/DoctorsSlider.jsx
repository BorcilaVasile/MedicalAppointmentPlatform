import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import apiClient, { getImageUrl } from '../config/api';
import { FaUserMd, FaHospital, FaCalendar } from 'react-icons/fa';
import maleProfilePicture from '../assets/male_profile_picture.png';
import femaleProfilePicture from '../assets/female_profile_picture.png';

// Helper functions
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviews.length).toFixed(1);
};

const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`text-lg ${
          i <= Math.round(rating)
            ? 'text-[var(--accent-500)]'
            : 'text-[var(--text-300)]'
        }`}
      >
        ★
      </span>
    );
  }
  return stars;
};

function DoctorsSlider() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sliderRef] = useKeenSlider({
    loop: true,
    mode: 'free-snap',
    slides: {
      perView: 3,
      spacing: 15,
    },
    breakpoints: {
      '(max-width: 1024px)': {
        slides: {
          perView: 2,
          spacing: 15,
        },
      },
      '(max-width: 640px)': {
        slides: {
          perView: 1,
          spacing: 15,
        },
      },
    },
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/doctors');
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }
    
        const doctorsData = response.data;
    
        const doctorsWithReviews = await Promise.all(
          doctorsData.map(async (doctor) => {
            try {
              const reviewsResponse = await apiClient.get(`/api/reviews/${doctor._id}`);
              const reviews = reviewsResponse.data || [];
    
              const averageRating = reviews.length > 0
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                : 0;
    
              return {
                ...doctor,
                reviews,
                averageRating,
              };
            } catch (reviewError) {
              console.error(`Error fetching reviews for doctor ${doctor._id}:`, reviewError);
              return {
                ...doctor,
                reviews: [],
                averageRating: 0,
              };
            }
          })
        );
    
        setDoctors(doctorsWithReviews);
        setError(null);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err.response?.data?.message || 'Doctors couldn\'t be loaded');
      } finally {
        setLoading(false);
      }
    };
    

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-500)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-[var(--error-500)] py-8 bg-[var(--error-50)] rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!doctors.length) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--text-500)]">There are no available doctors at the moment.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div ref={sliderRef} className="keen-slider">
        {doctors.map((doctor) => {
          const averageRating = calculateAverageRating(doctor.reviews);

          return doctor.active ? (
            <div key={doctor._id} className="keen-slider__slide">
              <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden mx-2 h-full">
                <img
                  src={
                    doctor.profilePicture
                      ? getImageUrl(doctor.profilePicture)
                      : doctor.gender === 'Male'
                      ? maleProfilePicture
                      : femaleProfilePicture
                  }
                  alt={`${doctor.firstName} ${doctor.lastName}`}
                  className="w-32 h-32 object-contain rounded-full mx-auto mt-4"
                  onError={(e) => {
                    e.target.src =
                      doctor.gender === 'Male' ? maleProfilePicture : femaleProfilePicture;
                  }}
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-300 text-center">
                    {doctor.firstName} {doctor.lastName}
                  </h3>
                  <div className="flex justify-center mt-2">
                    {renderStars(averageRating)}
                    <span className="ml-2 text-[var(--text-600)] text-sm">
                      ({averageRating})
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-gray-400">
                      <FaUserMd className="mr-2 flex-shrink-0" />
                      <span className="text-sm">{doctor.specialty?.name || 'Specialty not specified'}</span>
                    </div>
                    {doctor.clinic && (
                      <div className="flex items-center text-gray-400">
                        <FaHospital className="mr-2 flex-shrink-0" />
                        <span className="text-sm">{doctor.clinic.name}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-400">
                      <FaCalendar className="mr-2 flex-shrink-0" />
                      <span className="text-sm">{doctor.availability || 'Program flexibil'}</span>
                    </div>
                  </div>
                  <Link
                    to={`/doctors/${doctor._id}`}
                    className="mt-4 inline-block bg-[var(--primary-500)] text-white px-4 py-2 rounded hover:bg-[var(--primary-600)] transition-colors w-full text-center"
                  >
                    See profile
                  </Link>
                </div>
              </div>
            </div>
          ): null ;
        })}
      </div>
    </div>
  );
}

export default DoctorsSlider;