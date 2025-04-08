import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaMapMarkerAlt, FaPhoneAlt, FaClock } from 'react-icons/fa';

// Setări pentru slider
const clinicSliderSettings = {
  dots: true,
  infinite: true,
  speed: 700,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  arrows: true,
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

function ClinicsSlider() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/clinics');
        if (!response.ok) {
          throw new Error('Nu s-au putut încărca clinicile');
        }
        const data = await response.json();
        setClinics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  // Ajustează setările slider-ului în funcție de numărul de clinici
  const adjustedSliderSettings = {
    ...clinicSliderSettings,
    infinite: clinics.length > 1,
    slidesToShow: Math.min(clinics.length, clinicSliderSettings.slidesToShow),
  };

  return (
    <div className="py-4">
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[var(--secondary-200)] dark:bg-[var(--secondary-900)]"></div>
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
      ) : clinics.length > 0 ? (
        <Slider {...adjustedSliderSettings} className="clinic-slider">
          {clinics.map((clinic) => (
            <div key={clinic._id} className="px-3 py-2">
              <div className="group h-full flex flex-col overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg bg-gradient-to-b from-[var(--background-50)] to-[var(--background-100)] dark:from-[var(--background-800)] dark:to-[var(--background-900)]">
                <div className="relative overflow-hidden">
                  <img
                    src={`http://localhost:5000${clinic.image}`}
                    alt={clinic.name}
                    className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=Clinică';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-24"></div>
                </div>
                
                <div className="flex-1 p-5 flex flex-col">
                  <h3 className="text-xl font-semibold mb-2 text-[var(--text-900)] dark:text-[var(--text-50)]">
                    {clinic.name}
                  </h3>
                  
                  <div className="flex items-start gap-2 mb-2">
                    <FaMapMarkerAlt className="text-[var(--secondary-500)] dark:text-[var(--secondary-400)] mt-1 flex-shrink-0" />
                    <p className="text-[var(--text-600)] dark:text-[var(--text-300)] text-sm">
                      {clinic.address}
                    </p>
                  </div>
                  
                  {clinic.schedule && (
                    <div className="flex items-start gap-2 mb-4">
                      <FaClock className="text-[var(--secondary-500)] dark:text-[var(--secondary-400)] mt-1 flex-shrink-0" />
                      <p className="text-[var(--text-600)] dark:text-[var(--text-300)] text-sm">
                        {clinic.schedule}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-auto">
                    <Link
                      to={`/clinics/${clinic._id}`}
                      className="inline-block w-full py-2.5 px-4 bg-[var(--secondary-600)] hover:bg-[var(--secondary-700)] text-white text-center font-medium rounded-full transition-all duration-300"
                    >
                      Vezi Detalii
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="text-center py-12 bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-2xl">
          <p className="text-lg text-[var(--text-600)] dark:text-[var(--text-300)]">
            Nu există clinici disponibile momentan.
          </p>
        </div>
      )}
    </div>
  );
}

export default ClinicsSlider;