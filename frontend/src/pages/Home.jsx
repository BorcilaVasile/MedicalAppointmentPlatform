import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserMd, FaCalendarAlt, FaClinicMedical, FaHeartbeat, FaBaby, FaBone, FaAllergies, FaArrowRight } from 'react-icons/fa';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
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
    name: 'Cardiology', 
    description: 'Specialized care for heart conditions',
    icon: <FaHeartbeat className="w-10 h-10" />
  },
  { 
    name: 'Pediatrics', 
    description: 'Medical services for children of all ages',
    icon: <FaBaby className="w-10 h-10" />
  },
  { 
    name: 'Orthopedics', 
    description: 'Treatment for bone and joint disorders',
    icon: <FaBone className="w-10 h-10" />
  },
  { 
    name: 'Dermatology', 
    description: 'Skin care and treatment for dermatological conditions',
    icon: <FaAllergies className="w-10 h-10" />
  }
];

// Date pentru caracteristici
const features = [
  {
    icon: <FaUserMd className="w-8 h-8" />,
    title: "Medical specialists",
    description: "Access to top specialist doctors across multiple medical fields."
  },
  {
    icon: <FaCalendarAlt className="w-8 h-8" />,
    title: "Online appointments",
    description: "Seamless 24/7 scheduling with just a few clicks."
  },
  {
    icon: <FaClinicMedical className="w-8 h-8" />,
    title: "Advanced medical centers",
    description: "A premium network of contemporary medical facilities with advanced diagnostic technology."
  }
];

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isDarkMode } = useTheme();
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    loop: true,
    mode: "free-snap",
    slides: {
      perView: 1,
      spacing: 15,
    },
  });

  const goToSlide = (index) => {
    instanceRef.current?.moveToIdx(index);
  };

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-50)]">
      {/* Hero Section cu Carusel */}
      <section className="relative w-full h-[calc(100vh-5rem)] overflow-hidden">
        <div ref={sliderRef} className="keen-slider h-full">
          {carouselImages.map((image, index) => (
            <div key={index} className="keen-slider__slide h-full">
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-[2500ms] ease-out transform scale-105 filter brightness-[0.85]"
                style={{
                  transform: currentSlide === index ? 'scale(1.00)' : 'scale(1.05)'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Overlay cu text */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 flex items-center justify-center">
          <div className="relative z-10 text-center text-white p-6 max-w-4xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Personalized medical care tailored for you. 
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-10 font-light"
            >
              Your gateway to Romania's finest healthcare professionals.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link 
                to="/doctors" 
                className="bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-white font-medium py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                Find a doctor
                <FaArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/about" 
                className="bg-transparent hover:bg-white/20 text-white border border-white font-medium py-3 px-8 rounded-full transition-all duration-300"
              >
                About us
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Indicatori carusel */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-white w-10 transform scale-100'
                  : 'bg-white/50 hover:bg-white/75 transform scale-90'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Secțiunea intro cu call-to-action */}
      <section className="py-16 bg-gradient-to-b from-[var(--background-50)] to-[var(--background-100)] dark:from-[var(--background-800)] dark:to-[var(--background-900)]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--text-900)] dark:text-[var(--text-50)]">Exceptional medical expertise</h2>
            <p className="text-lg text-[var(--text-700)] dark:text-[var(--text-200)] leading-relaxed">
            Elysium Medical is committed to delivering excellence in patient care through access to leading medical specialists and premium healthcare facilities.
            </p>
          </div>

          {/* Caracteristici principale */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-[var(--background-50)] dark:bg-[var(--background-700)] shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="text-[var(--primary-500)] dark:text-[var(--primary-400)] mb-5 bg-[var(--primary-100)] dark:bg-[var(--primary-900)]/30 p-4 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[var(--text-900)] dark:text-[var(--text-50)]">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-600)] dark:text-[var(--text-300)]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Domenii medicale */}
      <section className="py-16 bg-[var(--background-50)] dark:bg-[var(--background-950)]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-6 text-[var(--text-900)] dark:text-[var(--text-50)]"
            >
              Areas of specialization
            </motion.h2>
            <p className="text-lg text-[var(--text-700)] dark:text-[var(--text-200)] leading-relaxed">
              Our comprehensive medical services span numerous specialties to address all your healthcare requirements.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {domains.map((domain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl shadow-md text-center group hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-gradient-to-b from-[var(--background-50)] to-[var(--background-100)] dark:from-[var(--background-800)] dark:to-[var(--background-900)]"
              >
                <div className="inline-flex justify-center items-center mb-5 text-[var(--accent-500)] dark:text-[var(--accent-400)] bg-[var(--accent-100)] dark:bg-[var(--accent-900)]/30 p-4 rounded-full transform group-hover:scale-110 transition-transform duration-300">
                  {domain.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[var(--text-900)] dark:text-[var(--text-50)]">
                  {domain.name}
                </h3>
                <p className="text-[var(--text-600)] dark:text-[var(--text-300)]">
                  {domain.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Caruselul doctorilor */}
      <section className="py-16 bg-gradient-to-b from-[var(--background-100)] to-[var(--background-50)] dark:from-[var(--background-900)] dark:to-[var(--background-800)]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--text-900)] dark:text-white">
              Our leading medical specialists
            </h2>
            <p className="text-lg text-[var(--text-700)] dark:text-[var(--text-100)] leading-relaxed mb-10">
              Highly skilled and experienced specialists committed to excellence in their fields
            </p>
          </div>
          <DoctorsSlider />
        </div>
      </section>

      {/* Caruselul clinicilor */}
      <section className="py-16 bg-[var(--background-50)] dark:bg-[var(--background-900)]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--text-900)] dark:text-white">
              Modern clinics and advanced techonlogy
            </h2>
            <p className="text-lg text-[var(--text-700)] dark:text-[var(--text-100)] leading-relaxed mb-10">
              Our network of clinics is equipped with the most modern infrastructure and medical technology.
            </p>
          </div>
          <ClinicsSlider />
        </div>
      </section>

      {/* Call to action final */}
      <section className="py-16 bg-gradient-to-r from-[var(--primary-700)] to-[var(--primary-500)] dark:from-[var(--primary-800)] dark:to-[var(--primary-600)]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to take your healthcare to the next level?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Make an appointment today and start the journey to a better health.
            </p>
            <Link 
              to="/doctors" 
              className="inline-block bg-white text-[var(--primary-700)] dark:text-[var(--primary-800)] font-medium py-3 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-[var(--background-50)] text-lg"
            >
              Make an appointment now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;