import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import maleProfilePicture from '../assets/male_profile_picture.png';
import femaleProfilePicture from '../assets/female_profile_picture.png';
import { useTheme } from '../context/ThemeContext';

function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/doctors/${id}`);
        if (!response.ok) {
          throw new Error('Eroare la preluarea doctorului');
        }
        const data = await response.json();
        setDoctor(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) return <p>Se încarcă...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!doctor) return <p>Doctorul nu a fost găsit.</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{doctor.name}</h1>
      <img
        src={doctor.image ? `http://localhost:5000${doctor.image}` 
            : (doctor.gender === 'Masculin' ? maleProfilePicture : femaleProfilePicture)}
        alt={`Dr. ${doctor.name}`}
        className="w-1/2 h-64 object-cover rounded-md mb-6"
      />
      <p className="text-lg mb-2"><strong>Specializare:</strong> {doctor.specialty}</p>
      <p className="text-lg mb-4">{doctor.description}</p>
      <h2 className="text-2xl font-semibold mb-4">Review-uri</h2>
      {doctor.reviews.map((review, index) => (
        <div key={index} className="mb-4 p-4 border rounded-md">
          <p className="italic">"{review.comment}"</p>
          <p className="text-sm">Rating: {review.rating}/5</p>
        </div>
      ))}
    </div>
  );
}

export default DoctorProfile;