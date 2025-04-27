import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyInfo from '../components/CompanyInfo'; 
import googleLogo from '../assets/google-icon.png'; 
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] =useState(false);
  const [showConfirmPassword, setShowConfirmPassword]= useState(false);
  const [gender, setGender] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkPassword = (confirmValue) => {
    setConfirmPassword(confirmValue);
    if (password && confirmValue && password !== confirmValue) {
      setError('Passwords do not match');
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const formData = { name, email, password, gender };

    try {
      const response = await apiClient.post('/api/patients', formData);
      console.log('Registration response:', response);
      if (response.status !== 201) {
        setError('Registration failed');
        return;
      }
      await register(response.data.token, response.data.userType);
      navigate('/', { 
        state: { message: 'Welcome! You are now logged in.' }
      });
    } catch (err) {
      console.log('🔥 Catch error:', err);
      setError(err.response?.data?.message || 'An error has ocurred at registration.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    if(showPassword)
      setShowPassword(false);
    else 
      setShowPassword(true);
  };

  const toggleConfirmPasswordVisibility = () => {
    if(showConfirmPassword)
      setShowConfirmPassword(false);
    else 
      setShowConfirmPassword(true);
  }
  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Stânga: Formular */}
      <div className="w-full md:w-1/2 bg-[var(--background-50)] dark:bg-[var(--background-900)] p-8 md:p-12 flex items-center justify-center">
      <div className="w-full max-w-md bg-[var(--background-100)] dark:bg-[var(--background-950)] rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-center mb-6 text-[var(--text-800)] dark:text-[var(--text-200)] bg-clip-text bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)]">
          Get Started Now
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-[var(--accent-100)] dark:bg-[var(--accent-200)] text-[var(--accent-700)] dark:text-[var(--accent-600)] rounded-md text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-[var(--text-300)] dark:border-[var(--text-700)] rounded-lg bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-all duration-200 placeholder-[var(--text-400)] dark:placeholder-[var(--text-600)]"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
        
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-[var(--text-300)] dark:border-[var(--text-700)] rounded-lg bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-all duration-200 placeholder-[var(--text-400)] dark:placeholder-[var(--text-600)]"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-[var(--text-300)] dark:border-[var(--text-700)] rounded-lg bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-all duration-200 placeholder-[var(--text-400)] dark:placeholder-[var(--text-600)]"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/3 transform -translate-y-1/2 text-[var(--text-600)] dark:text-[var(--text-400)] hover:text-[var(--primary-500)] dark:hover:text-[var(--primary-600)]"
              >
              {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </button>
          </div>

          <div className="space-y-2 relative">
           
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm_password"
              value={confirmPassword}
              onChange={(e) => checkPassword(e.target.value)}
              className="w-full p-3 border border-[var(--text-300)] dark:border-[var(--text-700)] rounded-lg bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-all duration-200 placeholder-[var(--text-400)] dark:placeholder-[var(--text-600)]"
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/3 transform -translate-y-1/2 text-[var(--text-600)] dark:text-[var(--text-400)] hover:text-[var(--primary-500)] dark:hover:text-[var(--primary-600)]"
              >
              {showConfirmPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </button>
          </div>

          <div className="space-y-2">
           
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 border border-[var(--text-300)] dark:border-[var(--text-700)] rounded-lg bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-all duration-200 placeholder-[var(--text-400)] dark:placeholder-[var(--text-600)]"
              required
            >
              <option value="" hidden>
                Select your gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-[var(--text-50)] dark:from-[var(--primary-600)] dark:to-[var(--secondary-600)] dark:text-[var(--text-950)] font-semibold rounded-lg hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] dark:hover:from-[var(--primary-700)] dark:hover:to-[var(--secondary-700)] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-102"
          >
            Sign Up
          </button>
        </form>

        {/* Separator */}
        <div className="my-6 flex items-center">
          <hr className="flex-grow border-[var(--text-300)] dark:border-[var(--text-700)]" />
          <span className="px-3 text-[var(--text-600)] dark:text-[var(--text-400)]">or</span>
          <hr className="flex-grow border-[var(--text-300)] dark:border-[var(--text-700)]" />
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-[var(--text-600)] dark:text-[var(--text-400)]">
          Have an account?{' '}
          <a
            href="/login"
            className="text-[var(--primary-500)] dark:text-[var(--primary-600)] hover:text-[var(--primary-600)] dark:hover:text-[var(--primary-700)] font-medium transition-colors duration-200"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>

      {/* Dreapta: Logo și citat */}
      <CompanyInfo/>
    </div>
  );
}

export default Signup;