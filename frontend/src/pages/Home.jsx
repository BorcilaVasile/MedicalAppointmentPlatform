import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import clinic from '../assets/clinic.jpg';
import doctorsImg from '../assets/doctors.jpg';
import pacients from '../assets/pacients.jpg';
import { useTheme } from '../context/ThemeContext';
import maleProfilePicture from '../assets/male_profile_picture.png';
import femaleProfilePicture from '../assets/female_profile_picture.png';
import DoctorsSlider from '../components/DoctorsSlider';
import ClinicsSlider from '../components/ClinicsSlider';

// Imagini pentru carusel
const carouselImages = [clinic, doctorsImg, pacients];

// Date pentru domenii medicale
const domains = [
  { name: 'Cardiologie', description: 'Îngrijire specializată pentru afecțiunile inimii.' },
  { name: 'Pediatrie', description: 'Servicii medicale pentru copii de toate vârstele.' },
  { name: 'Ortopedie', description: 'Tratament pentru afecțiunile oaselor și articulațiilor.' },
  { name: 'Dermatologie', description: 'Îngrijirea pielii și tratamente pentru afecțiuni dermatologice.' },
];

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)] transition-colors">
      {/* Carusel imagini */}
      <section
        className="relative w-full h-[calc(100vh-100px)] sm:h-[calc(100vh-80px)] overflow-hidden"
      >
        {carouselImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-colors ${
                index === currentSlide
                  ? 'bg-[var(--primary-500)]'
                  : 'bg-[var(--background-200)] dark:bg-[var(--background-700)]'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Domenii medicale */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">
            Domenii Medicale
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {domains.map((domain, index) => (
              <div
                key={index}
                className="p-6 bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-lg shadow-md text-center"
              >
                <h3 className="text-xl sm:text-2xl font-semibold mb-3">{domain.name}</h3>
                <p className="text-base sm:text-lg text-[var(--text-600)] dark:text-[var(--text-400)]">
                  {domain.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DoctorsSlider />
      <ClinicsSlider />
    </div>
  );
}

export default Home;