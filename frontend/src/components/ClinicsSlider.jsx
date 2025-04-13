import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { FaMapMarkerAlt, FaPhoneAlt, FaClock } from 'react-icons/fa';

function ClinicsSlider() {
  const [clinics, setClinics] = useState([]);
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
    const fetchClinics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/clinics');
        if (!response.ok) {
          throw new Error('Nu s-au putut încărca clinicile');
        }
        const data = await response.json();
        setClinics(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  if (loading) return <div className="text-center py-8">Se încarcă...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="py-8">
      <div ref={sliderRef} className="keen-slider">
        {clinics.map((clinic) => (
          <div key={clinic._id} className="keen-slider__slide">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-2">
              <img
                src={clinic.image || 'https://via.placeholder.com/400x300'}
                alt={clinic.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{clinic.name}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{clinic.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaPhoneAlt className="mr-2" />
                    <span>{clinic.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaClock className="mr-2" />
                    <span>{clinic.workingHours}</span>
                  </div>
                </div>
                <Link
                  to={`/clinic/${clinic._id}`}
                  className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Vezi detalii
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClinicsSlider;