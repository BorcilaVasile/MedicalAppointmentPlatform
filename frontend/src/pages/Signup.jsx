import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Stare pentru confirmarea parolei
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Funcția pentru verificarea parolei
  const checkPassword = (confirmValue) => {
    setConfirmPassword(confirmValue); // Actualizează starea confirmPassword
    if (password && confirmValue && password !== confirmValue) {
      setError('Passwords do not match');
    } else {
      setError(''); // Resetează eroarea dacă parolele se potrivesc
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Verifică dacă parolele se potrivesc înainte de a trimite cererea
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role: 'patient' }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Sign up failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] transition-colors">
      <div className="w-full max-w-md p-6 bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-lg shadow-md">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-6 text-[var(--text-800)] dark:text-[var(--text-200)]">
          Sign Up
        </h1>

        {/* Error Message */}
        {error && (
          <p className="text-center mb-4 text-[var(--accent-500)] dark:text-[var(--accent-600)] font-medium">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
              placeholder="Enter your name"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)] mb-1"
            >
              Confirm password
            </label>
            <input
              type="password"
              id="confirm_password" // Corectăm id-ul
              value={confirmPassword} // Folosim confirmPassword
              onChange={(e) => checkPassword(e.target.value)} // Apelăm checkPassword
              className="w-full p-2 border border-[var(--text-400)] dark:border-[var(--text-600)] rounded-md bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] dark:focus:ring-[var(--primary-600)] transition-colors"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[var(--primary-500)] text-[var(--text-50)] dark:bg-[var(--primary-600)] dark:text-[var(--text-950)] font-semibold rounded-md hover:bg-[var(--primary-600)] dark:hover:bg-[var(--primary-700)] transition-colors"
          >
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-4 text-[var(--text-600)] dark:text-[var(--text-400)]">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-[var(--primary-500)] dark:text-[var(--primary-600)] hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;