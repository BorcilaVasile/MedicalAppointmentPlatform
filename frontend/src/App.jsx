import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DoctorProfile from './pages/DoctorProfile';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import AddDoctor from './pages/AddDoctor';
import AdminDashboard from './pages/AdminDashboard';
import Doctors from './pages/Doctors';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  const location = useLocation();

  // Ascunde navbar-ul pentru paginile de login și signup
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          {!hideNavbar && <Navbar />}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/account" element={<Account />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/admin/add-doctor" element={<AddDoctor />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;