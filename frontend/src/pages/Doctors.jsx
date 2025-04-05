import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import maleProfilePicture from '../assets/male_profile_picture.png';
import femaleProfilePicture from '../assets/female_profile_picture.png';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ gender: [], specialty: [] }); // Filtre multiple
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/doctors');
        if (!response.ok) {
          throw new Error('Eroare la preluarea doctorilor');
        }
        const data = await response.json();
        setDoctors(data);
        setFilteredDoctors(data); // Inițial, lista filtrată este aceeași cu lista completă
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Actualizează lista filtrată pe baza termenului de căutare și a filtrelor
  useEffect(() => {
    let results = doctors;

    // Aplică filtrele de gen
    if (filters.gender.length > 0) {
      results = results.filter((doctor) => filters.gender.includes(doctor.gender));
    }

    // Aplică filtrele de specializare
    if (filters.specialty.length > 0) {
      results = results.filter((doctor) =>
        filters.specialty.map((s) => s.trim().toLowerCase()).includes(doctor.specialty.trim().toLowerCase())
      );
    }

    // Aplică căutarea
    results = results.filter((doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredDoctors(results);
  }, [searchTerm, filters, doctors]);

  const handleCheckboxChange = (category, value) => {
    setFilters((prevFilters) => {
      const updatedCategory = prevFilters[category].includes(value)
        ? prevFilters[category].filter((item) => item !== value) // Deselectează
        : [...prevFilters[category], value]; // Selectează

      return { ...prevFilters, [category]: updatedCategory };
    });
  };

  if (loading) return <p className="text-center text-lg">Se încarcă doctorii...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Caută doctori după nume sau specializare..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
        />
      </div>

      <div className="flex">
        {/* Panou de filtrare */}
        <aside className="w-1/4 pr-4">
          <div className="bg-[var(--background-100)] dark:bg-[var(--background-900)] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Filtre</h2>

            {/* Filtru după gen */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Gen</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.gender.includes('Masculin')}
                    onChange={() => handleCheckboxChange('gender', 'Masculin')}
                    className="mr-2"
                  />
                  Masculin
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.gender.includes('Feminin')}
                    onChange={() => handleCheckboxChange('gender', 'Feminin')}
                    className="mr-2"
                  />
                  Feminin
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.gender.includes('Altul')}
                    onChange={() => handleCheckboxChange('gender', 'Altul')}
                    className="mr-2"
                  />
                  Altul
                </label>
              </div>
            </div>

            {/* Filtru după specializare */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Specializare</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.specialty.includes('Cardiologie')}
                    onChange={() => handleCheckboxChange('specialty', 'Cardiologie')}
                    className="mr-2"
                  />
                  Cardiologie
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.specialty.includes('Pediatrie')}
                    onChange={() => handleCheckboxChange('specialty', 'Pediatrie')}
                    className="mr-2"
                  />
                  Pediatrie
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.specialty.includes('Dermatologie')}
                    onChange={() => handleCheckboxChange('specialty', 'Dermatologie')}
                    className="mr-2"
                  />
                  Dermatologie
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Lista doctorilor */}
        <main className="w-3/4">
          <ul className="space-y-6">
            {filteredDoctors.map((doctor) => (
              <li
                key={doctor._id}
                className="flex items-center bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-lg shadow-md p-4"
              >
                {/* Imaginea doctorului */}
                <img
                  src={
                    doctor.image
                      ? `http://localhost:5000${doctor.image}`
                      : doctor.gender === 'Masculin'
                      ? maleProfilePicture
                      : femaleProfilePicture
                  }
                  alt={`Dr. ${doctor.name}`}
                  className="w-24 h-24 object-cover rounded-md mr-4"
                />
                {/* Detalii doctor */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{doctor.name}</h3>
                  <p className="text-base text-[var(--text-600)] dark:text-[var(--text-400)]">
                    {doctor.specialty}
                  </p>
                </div>
                {/* Buton Vezi Profil */}
                <Link
                  to={`/doctors/${doctor._id}`}
                  className="px-4 py-2 bg-[var(--primary-500)] text-white rounded-md hover:bg-[var(--primary-600)] transition-colors"
                >
                  Vezi Profil
                </Link>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}

export default Doctors;