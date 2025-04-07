import React from 'react';
import { motion } from 'framer-motion';
import { FaUserMd, FaHospital, FaCalendarAlt, FaChartLine, FaShieldAlt, FaMobileAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const About = () => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FaUserMd className="w-12 h-12" />,
      title: "Doctori Verificați",
      description: "Toți medicii din platforma noastră sunt verificați și acreditați, cu experiență în domeniul lor de specialitate."
    },
    {
      icon: <FaCalendarAlt className="w-12 h-12" />,
      title: "Programări Ușoare",
      description: "Sistemul nostru de programare online vă permite să găsiți și să programați vizite la medic în câteva clicuri."
    },
    {
      icon: <FaHospital className="w-12 h-12" />,
      title: "Clinicile Parteneri",
      description: "Colaborăm cu cele mai bune clinici și spitale din țară pentru a vă oferi acces la servicii medicale de calitate."
    },
    {
      icon: <FaShieldAlt className="w-12 h-12" />,
      title: "Securitate și Confidențialitate",
      description: "Datele dumneavoastră sunt protejate și confidențiale, conform cu cele mai recente standarde de securitate."
    },
    {
      icon: <FaChartLine className="w-12 h-12" />,
      title: "Istoric Medical Digital",
      description: "Păstrați și gestionați cu ușurință istoricul medical, diagnosticelor și tratamentelor într-un singur loc."
    },
    {
      icon: <FaMobileAlt className="w-12 h-12" />,
      title: "Accesibil Oricând",
      description: "Platforma este accesibilă de pe orice dispozitiv, oferind o experiență optimă atât pe desktop cât și pe mobil."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--background-50)] to-[var(--background-200)] dark:from-[var(--background-950)] dark:to-[var(--background-800)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-6">
              Despre Elysium
            </h1>
            <p className="text-xl text-[var(--text-700)] dark:text-[var(--text-300)] max-w-3xl mx-auto">
              Platforma noastră medicală conectează pacienții cu cei mai buni doctori și clinici, oferind o experiență completă de gestionare a sănătății.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-[var(--background-800)] rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-6 text-center">
            Misiunea Noastră
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-lg text-[var(--text-700)] dark:text-[var(--text-300)]">
                La Elysium, ne dedicăm transformării modului în care oamenii interacționează cu sistemul medical. 
                Credem că fiecare persoană merită acces la servicii medicale de calitate, într-un mod simplu și eficient.
              </p>
              <p className="text-lg text-[var(--text-700)] dark:text-[var(--text-300)]">
                Platforma noastră a fost creată pentru a elimina barierele dintre pacienți și furnizorii de servicii medicale, 
                oferind un sistem integrat care simplifică procesul de programare, urmărire și gestionare a sănătății.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-lg text-[var(--text-700)] dark:text-[var(--text-300)]">
                Prin tehnologie inovatoare și o abordare centrată pe utilizator, ne propunem să:
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg text-[var(--text-700)] dark:text-[var(--text-300)]">
                <li>Simplificăm procesul de programare la medic</li>
                <li>Îmbunătățim accesul la informații medicale relevante</li>
                <li>Promovăm comunicarea eficientă între pacienți și doctori</li>
                <li>Asigurăm confidențialitatea și securitatea datelor medicale</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-4">
            De ce să alegi Elysium?
          </h2>
          <p className="text-xl text-[var(--text-700)] dark:text-[var(--text-300)] max-w-3xl mx-auto">
            Oferim o experiență completă de gestionare a sănătății, cu toate instrumentele necesare pentru o îngrijire medicală eficientă.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-[var(--primary-500)] mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-[var(--text-900)] dark:text-[var(--text-100)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] rounded-2xl shadow-xl p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">1000+</div>
              <div className="text-white/80">Doctori Verificați</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-white/80">Clinicile Parteneri</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">10k+</div>
              <div className="text-white/80">Pacienți Mulțumiți</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-6">
            {isAuthenticated ? 'Explorați platforma noastră' : 'Începeți călătoria spre o sănătate mai bună'}
          </h2>
          <p className="text-xl text-[var(--text-700)] dark:text-[var(--text-300)] mb-8 max-w-3xl mx-auto">
            {isAuthenticated 
              ? 'Descoperiți toate funcționalitățile platformei și găsiți medicul potrivit pentru nevoile dumneavoastră.'
              : 'Alăturați-vă comunității noastre și beneficiați de toate avantajele unei platforme medicale moderne și eficiente.'}
          </p>
          <div className="flex justify-center space-x-4">
            {!isAuthenticated && (
              <a
                href="/signup"
                className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Înregistrare
              </a>
            )}
            <a
              href="/doctors"
              className="bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] px-8 py-3 rounded-lg text-lg font-semibold border border-[var(--primary-500)] hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-900)] transition-colors"
            >
              Găsește un Doctor
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;