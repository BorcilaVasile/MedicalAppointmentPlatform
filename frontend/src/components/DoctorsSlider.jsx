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
  speed: 700,
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
    <div className="py-4">
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-200)] dark:bg-[var(--primary-900)]"></div>
            <div className="mt-4 h-4 w-24 bg-[var(--background-200)] dark:bg-[var(--background-700)] rounded"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8 px-4">
          <p className="text-[var(--accent-600)] dark:text-[var(--accent-400)] text-lg font-medium">
            {error}
          </p>
          <p className="mt-2 text-[var(--text-500)]">Încercați să reîmprospătați pagina.</p>
        </div>
      ) : doctors.length > 0 ? (
        <Slider {...adjustedSliderSettings} className="doctor-slider">
          {doctors.map((doctor) => {
            const averageRating = calculateAverageRating(doctor.reviews);
            return (
              <div key={doctor._id} className="px-3 py-2">
                <div className="group h-full flex flex-col overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg bg-gradient-to-b from-[var(--background-50)] to-[var(--background-100)] dark:from-[var(--background-800)] dark:to-[var(--background-900)]">
                  <div className="relative overflow-hidden">
                    <img
                      src={doctor.image ? `http://localhost:5000${doctor.image}` : 
                      doctor.gender === 'Masculin' ? maleProfilePicture : femaleProfilePicture}
                      alt={`Dr. ${doctor.name}`}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = doctor.gender === 'Masculin' ? maleProfilePicture : femaleProfilePicture;
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-20"></div>
                  </div>
                  
                  <div className="flex-1 p-5 flex flex-col">
                    <h3 className="text-xl font-semibold mb-1 text-[var(--text-900)] dark:text-white">
                      Dr. {doctor.name}
                    </h3>
                    <p className="text-[var(--primary-600)] dark:text-[var(--primary-400)] font-medium mb-2">
                      {doctor.specialty}
                    </p>
                    <p className="text-[var(--text-600)] dark:text-[var(--text-100)] line-clamp-2 mb-4 text-sm">
                      {doctor.description}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center mb-4">
                        {renderStars(averageRating)}
                        <span className="ml-2 text-[var(--text-500)] dark:text-[var(--text-200)] text-sm">
                          ({doctor.reviews?.length || 0} recenzii)
                        </span>
                      </div>
                      
                      <Link
                        to={`/doctors/${doctor._id}`}
                        className="inline-block w-full py-2.5 px-4 bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-white text-center font-medium rounded-full transition-all duration-300"
                      >
                        Vezi Profil
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      ) : (
        <div className="text-center py-12 bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-2xl">
          <p className="text-lg text-[var(--text-600)] dark:text-[var(--text-300)]">
            Nu există doctori disponibili momentan.
          </p>
        </div>
      )}
    </div>
  );
}

export default DoctorsSlider;