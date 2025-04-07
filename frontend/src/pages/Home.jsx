import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserMd, FaCalendarAlt, FaClinicMedical, FaHeartbeat, FaBaby, FaBone, FaAllergies } from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import clinic from '../assets/clinic.jpg';
import doctorsImg from '../assets/doctors.jpg';
import pacients from '../assets/pacients.jpg';
import { useTheme } from '../context/ThemeContext';
import DoctorsSlider from '../components/DoctorsSlider';
import ClinicsSlider from '../components/ClinicsSlider';

// Imagini pentru carusel
const carouselImages = [clinic, doctorsImg, pacients];

// Date pentru domenii medicale
const domains = [
  { 
    name: 'Cardiologie', 
    description: 'Îngrijire specializată pentru afecțiunile inimii.',
    icon: <FaHeartbeat className="w-12 h-12" />
  },
  { 
    name: 'Pediatrie', 
    description: 'Servicii medicale pentru copii de toate vârstele.',
    icon: <FaBaby className="w-12 h-12" />
  },
  { 
    name: 'Ortopedie', 
    description: 'Tratament pentru afecțiunile oaselor și articulațiilor.',
    icon: <FaBone className="w-12 h-12" />
  },
  { 
    name: 'Dermatologie', 
    description: 'Îngrijirea pielii și tratamente pentru afecțiuni dermatologice.',
    icon: <FaAllergies className="w-12 h-12" />
  },
];

// Date pentru caracteristici
const features = [
  {
    icon: <FaUserMd className="w-8 h-8" />,
    title: "Medici Specialiști",
    description: "Acces la cei mai buni medici specialiști din diverse domenii medicale."
  },
  {
    icon: <FaCalendarAlt className="w-8 h-8" />,
    title: "Programări Online",
    description: "Sistem simplu și rapid de programări online, disponibil 24/7."
  },
  {
    icon: <FaClinicMedical className="w-8 h-8" />,
    title: "Clinici Moderne",
    description: "Rețea de clinici moderne, dotate cu echipamente de ultimă generație."
  }
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
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] text-[var(--text-800)] dark:text-[var(--text-200)]">
      {/* Hero Section cu Carusel */}
      <section className="relative w-full h-[calc(100vh-100px)] sm:h-[calc(100vh-80px)] overflow-hidden">
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
        {/* Overlay cu text */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              Elysium Medical
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8"
            >
              Îngrijire medicală de calitate, la un click distanță
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link 
                to="/doctors" 
                className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white font-bold py-3 px-8 rounded-full transition-colors duration-300"
              >
                Programează-te Acum
              </Link>
            </motion.div>
          </div>
        </div>
        {/* Indicatori carusel */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-[var(--primary-500)] w-8'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Secțiunea de caracteristici */}
      <section className="py-16 bg-[var(--background-100)] dark:bg-[var(--background-900)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-[var(--background-50)] dark:bg-[var(--background-800)] shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-[var(--primary-500)] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--text-600)] dark:text-[var(--text-400)]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Domenii medicale */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Domenii Medicale
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {domains.map((domain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-1"
              >
                <div className="text-[var(--primary-500)] mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {domain.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{domain.name}</h3>
                <p className="text-[var(--text-600)] dark:text-[var(--text-400)]">
                  {domain.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Caruselele existente */}
      <section className="py-16 bg-[var(--background-100)] dark:bg-[var(--background-900)]">
        <div className="container mx-auto px-4">
          
          <DoctorsSlider />
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <ClinicsSlider />
        </div>
      </section>
    </div>
  );
}

export default Home;