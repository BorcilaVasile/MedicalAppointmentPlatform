import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
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
        const response = await fetch('http://localhost:5000/api/doctors');
        if (!response.ok) {
          throw new Error('Nu s-au putut încărca medicii');
        }
        const data = await response.json();
        setDoctors(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) return <div className="text-center py-8">Se încarcă...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="py-8">
      <div ref={sliderRef} className="keen-slider">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="keen-slider__slide">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-2">
              <img
                src={doctor.gender === 'M' ? maleProfilePicture : femaleProfilePicture}
                alt={doctor.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{doctor.name}</h3>
                <p className="text-gray-600">{doctor.specialization}</p>
                <div className="mt-2">
                  {renderStars(calculateAverageRating(doctor.reviews))}
                </div>
                <Link
                  to={`/doctor/${doctor._id}`}
                  className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Vezi profil
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