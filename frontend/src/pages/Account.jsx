// src/pages/Account.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoutIcon from '../assets/logout.svg';


function Account() {
const { logout } = useAuth();
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogout = () => {
    logout(); // Apelăm funcția logout din AuthContext
    navigate('/login'); // Redirecționăm utilizatorul către pagina de login
  };
  const navigate = useNavigate();

  // Preia datele utilizatorului la încărcarea paginii
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            navigate('/login');
            return;
          }
          throw new Error('Eroare la preluarea datelor utilizatorului');
        }

        const data = await response.json();
        setUserData(data);
        setFormData({ name: data.name, email: data.email });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserData();
  }, [logout, navigate]);

  // Gestionează schimbarea datelor din formular
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestionează schimbarea parolei
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Salvează modificările
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la actualizarea datelor');
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setIsEditing(false);
      setSuccess('Datele au fost actualizate cu succes!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Anulează editarea
  const handleCancel = () => {
    setFormData({ name: userData.name, email: userData.email });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  // Schimbă parola
 // În Account.jsx, actualizează handleChangePassword
 const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
  
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('Parolele noi nu se potrivesc!');
      setLoading(false);
      return;
    }
  
    if (passwordData.newPassword.length < 6) {
      setError('Parola nouă trebuie să aibă cel puțin 6 caractere.');
      setLoading(false);
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la schimbarea parolei');
      }
  
      setSuccess('Parola a fost schimbată cu succes!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] transition-colors">
      <div className="w-full max-w-lg p-6 bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-[var(--text-800)] dark:text-[var(--text-200)]">
          Contul Meu
        </h1>

        {/* Mesaje de eroare sau succes */}
        {error && (
          <p className="text-center mb-4 text-[var(--accent-500)] dark:text-[var(--accent-600)] font-medium">
            {error}
          </p>
        )}
        {success && (
          <p className="text-center mb-4 text-green-500 dark:text-green-400 font-medium">
            {success}
          </p>
        )}

        {/* Formular date personale */}
        <div className="space-y-6">
  {/* Afișăm datele în mod read-only dacă nu suntem în modul de editare */}
  {!isEditing ? (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-1">
          Nume
        </label>
        <p className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)]">
          {userData.name}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-1">
          Email
        </label>
        <p className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)]">
          {userData.email}
        </p>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="py-2 px-4 bg-[var(--primary-500)] text-[var(--text-50)] dark:bg-[var(--primary-600)] dark:text-[var(--text-950)] font-semibold rounded-md hover:bg-[var(--primary-600)] dark:hover:bg-[var(--primary-700)] transition-colors"
        >
          Edit details 
        </button>
      </div>
    </div>
  ) : (
    /* Formularul apare doar în modul de editare */
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-1"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
          required
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-1"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
          required
        />
      </div>

      {/* Butoane pentru salvare/anulare */}
      <div className="flex justify-center space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 bg-[var(--primary-500)] text-[var(--text-50)] dark:bg-[var(--primary-600)] dark:text-[var(--text-950)] font-semibold rounded-md hover:bg-[var(--primary-600)] dark:hover:bg-[var(--primary-700)] transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="py-2 px-4 bg-[var(--background-200)] text-[var(--text-800)] dark:bg-[var(--background-700)] dark:text-[var(--text-200)] font-semibold rounded-md hover:bg-[var(--background-300)] dark:hover:bg-[var(--background-600)] transition-colors disabled:opacity-50"
        >
            Cancel 
        </button>
      </div>
    </form>
  )}
</div>

        {/* Formular schimbare parolă */}
        <div className="mt-8 border-t border-[var(--text-400)] dark:border-[var(--text-600)] pt-6">
          <h2 className="text-2xl font-semibold text-center mb-4 text-[var(--text-800)] dark:text-[var(--text-200)]">
            Change password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-1"
              >
                Current password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
                required
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-1"
              >
                New password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
                required
              />
            </div>
            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-1"
              >
                Confirm new password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
                required
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 bg-[var(--primary-500)] text-[var(--text-50)] dark:bg-[var(--primary-600)] dark:text-[var(--text-950)] font-semibold rounded-md hover:bg-[var(--primary-600)] dark:hover:bg-[var(--primary-700)] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Change password'}
              </button>
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 py-2 px-4 bg-[var(--accent-500)] text-[var(--text-50)] dark:bg-[var(--accent-600)] dark:text-[var(--text-950)] font-semibold rounded-md hover:bg-[var(--accent-600)] dark:hover:bg-[var(--accent-700)] transition-colors"
                >
                    <img src={logoutIcon} alt="Logout Icon" className="h-5 w-5" />
                    <span>Disconnect</span>
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Account;