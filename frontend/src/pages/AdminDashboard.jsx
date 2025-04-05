import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          if (data.role !== 'admin') {
            navigate('/'); // Redirecționează utilizatorii non-admin la pagina principală
            return;
          }
          setUser(data);
        } else {
          setError(data.message || 'Failed to fetch user');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
        console.error(err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  if (!user) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Welcome, {user.name}!</h2>
        <p className="text-lg">Role: {user.role}</p>
        <p className="text-lg">Email: {user.email}</p>

        {/* Buton pentru gestionarea doctorilor */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/admin/add-doctor')}
            className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Manage Doctors
          </button>
        </div>

        {/* Buton pentru gestionarea clinicilor */}
        <div className="mt-4">
          <button
            onClick={() => navigate('/admin/manage-clinics')}
            className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Manage Clinics
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          className="mt-4 bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;