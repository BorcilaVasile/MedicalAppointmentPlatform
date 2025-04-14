import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaClock, FaCalendar } from 'react-icons/fa';
import apiClient, { getImageUrl } from '../config/api';

function ClinicProfile() {
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/clinics/${id}`);
        setClinic(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch clinic data');
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, [id]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await apiClient.get(`/api/clinics/${id}/doctors`);
        setDoctors(response.data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };

    if (id) {
      fetchDoctors();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-500)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[var(--error-500)] text-xl">{error}</div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[var(--text-500)]">Clinica nu a fost găsită</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)]">
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img
          src={clinic.image ? getImageUrl(clinic.image) : '/default-clinic.jpg'}
          alt={clinic.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{clinic.name}</h1>
              <p className="text-xl md:text-2xl opacity-90">{clinic.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informații principale */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-6">
                Despre Clinică
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="w-6 h-6 text-[var(--primary-500)] mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                      Adresă
                    </h3>
                    <p className="text-[var(--text-600)] dark:text-[var(--text-400)]">
                      {clinic.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaPhone className="w-6 h-6 text-[var(--primary-500)] mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                      Contact
                    </h3>
                    <p className="text-[var(--text-600)] dark:text-[var(--text-400)]">
                      {clinic.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaClock className="w-6 h-6 text-[var(--primary-500)] mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)] mb-1">
                      Program
                    </h3>
                    <div className="text-[var(--text-600)] dark:text-[var(--text-400)]">
                      <p>Luni - Vineri: 08:00 - 20:00</p>
                      <p>Sâmbătă: 09:00 - 14:00</p>
                      <p>Duminică: Închis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secțiunea de Doctori */}
            <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-6">
                Doctori
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="bg-[var(--background-50)] dark:bg-[var(--background-800)] rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={doctor.image ? getImageUrl(doctor.image) : '/default-doctor.jpg'}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">
                          Dr. {doctor.name}
                        </h3>
                        <p className="text-[var(--text-600)] dark:text-[var(--text-400)]">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar cu facilități și servicii */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-6">
                Facilități
              </h2>
              <ul className="space-y-3">
                {[
                  'Parcare gratuită',
                  'Lift',
                  'Aer condiționat',
                  'Wifi gratuit',
                  'Recepție 24/7',
                  'Sală de așteptare modernă'
                ].map((facility, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-[var(--text-600)] dark:text-[var(--text-400)]"
                  >
                    <span className="w-2 h-2 bg-[var(--primary-500)] rounded-full"></span>
                    {facility}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-6">
                Servicii
              </h2>
              <ul className="space-y-3">
                {[
                  'Consultații generale',
                  'Analize de laborator',
                  'Radiologie',
                  'Ecografie',
                  'Cardiologie',
                  'Pediatrie',
                  'Dermatologie',
                  'Oftalmologie'
                ].map((service, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-[var(--text-600)] dark:text-[var(--text-400)]"
                  >
                    <span className="w-2 h-2 bg-[var(--primary-500)] rounded-full"></span>
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClinicProfile; 