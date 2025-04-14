import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { FaMapMarkerAlt, FaPhoneAlt, FaClock } from 'react-icons/fa';
import { apiClient, getImageUrl } from '../config/api';

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
        setLoading(true);
        const response = await apiClient.get('/api/clinics/public');
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }
        setClinics(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching clinics:', err);
        setError(err.response?.data?.message || err.message || 'Nu s-au putut încărca clinicile');
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8 bg-red-50 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!clinics.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nu există clinici disponibile momentan.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div ref={sliderRef} className="keen-slider">
        {clinics.map((clinic) => (
          <div key={clinic._id} className="keen-slider__slide">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-2 h-full">
              <img
                src={clinic.image ? getImageUrl(clinic.image) : '/placeholder-clinic.jpg'}
                alt={clinic.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-clinic.jpg';
                }}
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-3">{clinic.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 flex-shrink-0" />
                    <span className="text-sm">{clinic.address}</span>
                  </div>
                  {clinic.phone && (
                    <div className="flex items-center text-gray-600">
                      <FaPhoneAlt className="mr-2 flex-shrink-0" />
                      <span className="text-sm">{clinic.phone}</span>
                    </div>
                  )}
                </div>
                <Link
                  to={`/clinic/${clinic._id}`}
                  className="mt-4 inline-block bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all"
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