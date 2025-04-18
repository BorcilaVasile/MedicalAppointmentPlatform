import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import apiClient, { getImageUrl } from '../config/api';
import { FaUserMd, FaHospital, FaCalendar } from 'react-icons/fa';
import maleProfilePicture from '../assets/male_profile_picture.png';
import femaleProfilePicture from '../assets/female_profile_picture.png';

// Funcții ajutătoare
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
        className={`text-lg ${i <= Math.round(rating) ? 'text-[var(--accent-500)] dark:text-[var(--accent-500)]' : 'text-[var(--text-300)] dark:text-[var(--text-700)]'}`}
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
    mode: "free-snap",
    slides: {
      perView: 3,
      spacing: 15,
    },
    breakpoints: {
      "(max-width: 1024px)": {
        slides: {
          perView: 2,
          spacing: 15,
        },
      },
      "(max-width: 640px)": {
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
        const response = await apiClient.get('/api/doctors');
        console.log('Doctors response:', response.data);
        setDoctors(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Doctors couldn\'t be loaded');
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="py-8">
      <div ref={sliderRef} className="keen-slider">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="keen-slider__slide">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-2">
              <img
                src={doctor.profilePicture ? getImageUrl(doctor.profilePicture) :
                  doctor.gender=='Male' ? maleProfilePicture : femaleProfilePicture}
                alt={doctor.name}
                className="w-auto h-48 object-cover flex justify-center items-center mx-auto"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{doctor.firstName} {doctor.lastName}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaUserMd className="mr-2" />
                    <span>{doctor.specialty.name}</span>
                  </div>
                  {doctor.clinic && (
                    <div className="flex items-center text-gray-600">
                      <FaHospital className="mr-2" />
                      <span>{doctor.clinic.name}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <FaCalendar className="mr-2" />
                    <span>{doctor.availability || 'Program flexibil'}</span>
                  </div>
                </div>
                <Link
                  to={`/doctors/${doctor._id}`}
                  className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  See profil
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorsSlider;