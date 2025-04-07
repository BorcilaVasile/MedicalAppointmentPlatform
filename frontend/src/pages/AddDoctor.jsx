import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AddDoctor() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    clinic: '',
    description: ''
  });
  const [clinics, setClinics] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Încarcă lista de clinici
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/clinics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Eroare la încărcarea clinicilor');
        }

        const data = await response.json();
        setClinics(data);
      } catch (err) {
        console.error('Eroare la încărcarea clinicilor:', err);
        setError('Nu s-au putut încărca clinicile. Vă rugăm să încercați din nou.');
      }
    };

    fetchClinics();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Generăm o parolă temporară pentru contul inițial
      const tempPassword = Math.random().toString(36).slice(-8);
      
      const response = await fetch('http://localhost:5000/api/admin/doctors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          password: tempPassword,
          isFirstLogin: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la adăugarea doctorului');
      }

      // Afișăm credențialele într-o alertă
      alert(
        'Cont creat cu succes!\n\n' +
        'Vă rugăm să transmiteți doctorului următoarele credențiale:\n\n' +
        `Email: ${formData.email}\n` +
        `Parolă temporară: ${tempPassword}\n\n` +
        'Doctorul va trebui să își schimbe parola și să își completeze profilul la prima autentificare.'
      );

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
      console.error('Error adding doctor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-[var(--background-900)] rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-[var(--text-900)] dark:text-[var(--text-100)]">
          Adaugă Doctor Nou
        </h2>
        
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-200">
            Notă: Creați contul inițial al doctorului și asociați-l cu o clinică. 
            Doctorul își va completa restul informațiilor la prima autentificare.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">
              Nume Complet
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] dark:bg-[var(--background-800)] dark:border-gray-700"
              placeholder="Dr. Nume Prenume"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] dark:bg-[var(--background-800)] dark:border-gray-700"
              placeholder="doctor@example.com"
            />
          </div>

          <div>
            <label htmlFor="clinic" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">
              Clinică
            </label>
            <select
              id="clinic"
              name="clinic"
              required
              value={formData.clinic}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] dark:bg-[var(--background-800)] dark:border-gray-700"
            >
              <option value="">Selectează clinica</option>
              {clinics.map(clinic => (
                <option key={clinic._id} value={clinic._id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)]">
              Scurtă Descriere
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] dark:bg-[var(--background-800)] dark:border-gray-700"
              placeholder="O scurtă descriere inițială a doctorului..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-500)] hover:bg-[var(--primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Se creează contul...' : 'Creează Cont Doctor'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddDoctor;