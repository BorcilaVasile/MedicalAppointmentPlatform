import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DoctorProfile from './pages/DoctorProfile';
import ClinicProfile from './pages/ClinicProfile';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import AddDoctor from './pages/AddDoctor';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Doctors from './pages/Doctors';
import Notifications from './pages/Notifications';
import MedicalHistory from './pages/MedicalHistory';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';
import PrivateRoute from './components/PrivateRoute';

// Configurare pentru medii diferite
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const location = useLocation();

  // Ascunde navbar-ul și footer-ul pentru paginile de login și signup
  const hideNavbarAndFooter = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          {!hideNavbarAndFooter && <Navbar />}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/account" element={<Account />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route path="/clinics/:id" element={<ClinicProfile />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/admin/add-doctor" element={<AddDoctor />} />
              <Route path="/notifications" element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              } />
              <Route path="/medical-history/:patientId" element={
                <PrivateRoute>
                  <MedicalHistory />
                </PrivateRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {!hideNavbarAndFooter && <Footer />}
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;