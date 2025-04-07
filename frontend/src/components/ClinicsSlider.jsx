import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Setări pentru slider
const clinicSliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
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

  return (
    <section className="py-12 sm:py-16 bg-[var(--background-50)] dark:bg-[var(--background-950)] transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-[var(--text-800)] dark:text-[var(--text-200)]">
          Clinicile Noastre
        </h2>
        {loading ? (
          <p className="text-center text-lg sm:text-xl text-[var(--text-600)] dark:text-[var(--text-400)]">
            Se încarcă clinicile...
          </p>
        ) : error ? (
          <p className="text-center text-lg sm:text-xl text-[var(--accent-500)] dark:text-[var(--accent-600)]">
            {error}
          </p>
        ) : clinics.length > 0 ? (
          <Slider {...clinicSliderSettings} className="relative mx-auto max-w-[1200px]">
            {clinics.map((clinic) => (
              <div key={clinic._id} className="px-2">
                <div className="p-6 bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-lg shadow-md text-center h-full flex flex-col justify-between transition-transform hover:scale-105">
                  <img
                    src={`http://localhost:5000${clinic.image}`}
                    alt={clinic.name}
                    className="w-full h-48 sm:h-56 object-cover rounded-md mb-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-[var(--text-800)] dark:text-[var(--text-200)]">
                      {clinic.name}
                    </h3>
                    <p className="text-base sm:text-lg mb-2 text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {clinic.address}
                    </p>
                  </div>
                  <Link
                    to={`/clinics/${clinic._id}`}
                    className="inline-block py-2 px-4 sm:py-2.5 sm:px-6 bg-[var(--primary-500)] text-[var(--text-50)] dark:bg-[var(--primary-600)] dark:text-[var(--text-950)] rounded-md text-base sm:text-lg font-medium hover:bg-[var(--primary-600)] dark:hover:bg-[var(--primary-700)] transition-colors"
                  >
                    Vezi Detalii
                  </Link>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-center text-lg sm:text-xl text-[var(--text-600)] dark:text-[var(--text-400)]">
            Nu există clinici disponibile.
          </p>
        )}
      </div>
    </section>
  );
}

export default ClinicsSlider;