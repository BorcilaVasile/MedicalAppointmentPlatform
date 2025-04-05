import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import maleProfilePicture from '../assets/male_profile_picture.png';
import femaleProfilePicture from '../assets/female_profile_picture.png';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Setări optimizate pentru carusel
const doctorSliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  arrows: true,
  centerPadding: '0px',
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
      },
    },
  ],
};

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
        className={i <= Math.round(rating) ? 'text-[var(--accent-500)] dark:text-[var(--accent-600)]' : 'text-[var(--text-400)] dark:text-[var(--text-600)]'}
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

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/doctors');
        if (!response.ok) {
          throw new Error('Nu s-au putut încărca doctorii');
        }
        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Ajustează setările slider-ului în funcție de numărul de doctori
  const adjustedSliderSettings = {
    ...doctorSliderSettings,
    infinite: doctors.length > 1, // Permite infinite doar dacă sunt mai mult de 1 doctor
    slidesToShow: Math.min(doctors.length, doctorSliderSettings.slidesToShow),
  };

  return (
    <section className="py-12 sm:py-16 bg-[var(--background-50)] dark:bg-[var(--background-950)] transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-[var(--text-800)] dark:text-[var(--text-200)]">
          Doctorii Noștri
        </h2>
        {loading ? (
          <p className="text-center text-lg sm:text-xl text-[var(--text-600)] dark:text-[var(--text-400)]">
            Se încarcă doctorii...
          </p>
        ) : error ? (
          <p className="text-center text-lg sm:text-xl text-[var(--accent-500)] dark:text-[var(--accent-600)]">
            {error}
          </p>
        ) : doctors.length > 0 ? (
          <Slider {...adjustedSliderSettings} className="relative mx-auto max-w-[1200px]">
            {doctors.map((doctor) => {
              const averageRating = calculateAverageRating(doctor.reviews);
              return (
                <div key={doctor._id} className="px-2">
                  <div className="p-6 bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-lg shadow-md text-center h-full flex flex-col justify-between transition-transform hover:scale-105">
                    <img
                      src={doctor.image ? `http://localhost:5000${doctor.image}` : 
                      doctor.gender == 'Masculin' ? maleProfilePicture : femaleProfilePicture}
                      alt={`Dr. ${doctor.name}`}
                      className="w-full h-48 sm:h-56 object-cover rounded-md mb-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = femaleProfilePicture;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-[var(--text-800)] dark:text-[var(--text-200)]">
                        {doctor.name}
                      </h3>
                      <p className="text-base sm:text-lg mb-2 text-[var(--text-700)] dark:text-[var(--text-300)]">
                        {doctor.specialty}
                      </p>
                      <p className="text-sm sm:text-base mb-4 text-[var(--text-600)] dark:text-[var(--text-400)] line-clamp-2">
                        {doctor.description}
                      </p>
                      <div className="flex justify-center items-center mb-4">
                        {renderStars(averageRating)}
                        <span className="ml-2 text-sm sm:text-base text-[var(--text-600)] dark:text-[var(--text-400)]">
                          ({averageRating})
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/doctors/${doctor._id}`}
                      className="inline-block py-2 px-4 sm:py-2.5 sm:px-6 bg-[var(--primary-500)] text-[var(--text-50)] dark:bg-[var(--primary-600)] dark:text-[var(--text-950)] rounded-md text-base sm:text-lg font-medium hover:bg-[var(--primary-600)] dark:hover:bg-[var(--primary-700)] transition-colors"
                      aria-label={`Vezi profilul doctorului ${doctor.name}`}
                    >
                      Vezi Profil
                    </Link>
                  </div>
                </div>
              );
            })}
          </Slider>
        ) : (
          <p className="text-center text-lg sm:text-xl text-[var(--text-600)] dark:text-[var(--text-400)]">
            Nu există doctori disponibili.
          </p>
        )}
      </div>
    </section>
  );
}

export default DoctorsSlider;