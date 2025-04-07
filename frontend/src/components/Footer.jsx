import { 
  FaHeart, 
  FaTwitter, 
  FaGithub, 
  FaLinkedin, 
  FaInstagram, 
  FaFacebook,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaUserMd,
  FaCalendarAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[var(--background-900)] text-[var(--text-200)] mt-auto">
      {/* Top section with main content */}
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-400)] to-[var(--primary-600)]">
              Elysium Medical
            </h3>
            <p className="text-[var(--text-400)] text-sm leading-relaxed">
              Platformă medicală dedicată facilitării programărilor și gestionării relației dintre pacienți și medici.
              Oferim acces rapid la cei mai buni specialiști din domeniul medical.
            </p>
            <div className="flex items-center space-x-2 text-[var(--text-400)]">
              <FaClock className="text-[var(--primary-500)]" />
              <span className="text-sm">Program: Luni - Vineri, 8:00 - 20:00</span>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[var(--primary-400)]">Servicii</h4>
            <ul className="space-y-2 text-[var(--text-400)]">
              <li className="flex items-center space-x-2">
                <FaUserMd className="text-[var(--primary-500)]" />
                <Link to="/doctors" className="hover:text-[var(--primary-400)] transition-colors duration-300">
                  Găsește un Doctor
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <FaCalendarAlt className="text-[var(--primary-500)]" />
                <Link to="/appointments" className="hover:text-[var(--primary-400)] transition-colors duration-300">
                  Programări Online
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-[var(--primary-500)]" />
                <Link to="/clinics" className="hover:text-[var(--primary-400)] transition-colors duration-300">
                  Clinicile Noastre
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[var(--primary-400)]">Contact</h4>
            <ul className="space-y-3 text-[var(--text-400)]">
              <li className="flex items-center space-x-2">
                <FaPhone className="text-[var(--primary-500)]" />
                <a href="tel:+40123456789" className="hover:text-[var(--primary-400)] transition-colors duration-300">
                  +40 123 456 789
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <FaEnvelope className="text-[var(--primary-500)]" />
                <a href="mailto:contact@elysium.ro" className="hover:text-[var(--primary-400)] transition-colors duration-300">
                  contact@elysium.ro
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-[var(--primary-500)]" />
                <span>Strada Exemplu, Nr. 123, București</span>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[var(--primary-400)]">Social Media</h4>
            <div className="grid grid-cols-3 gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center h-12 w-12 rounded-lg bg-[var(--background-800)] hover:bg-[var(--background-700)] text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-all duration-300"
              >
                <FaFacebook size={24} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center h-12 w-12 rounded-lg bg-[var(--background-800)] hover:bg-[var(--background-700)] text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-all duration-300"
              >
                <FaInstagram size={24} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center h-12 w-12 rounded-lg bg-[var(--background-800)] hover:bg-[var(--background-700)] text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-all duration-300"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section with copyright */}
      <div className="border-t border-[var(--background-700)] bg-[var(--background-800)]">
        <div className="container mx-auto py-4 px-8 flex flex-col md:flex-row justify-between items-center text-sm text-[var(--text-400)]">
          <p>
            © {new Date().getFullYear()} Elysium Medical. Toate drepturile rezervate.
          </p>
          <div className="flex items-center mt-2 md:mt-0">
            <span>Realizat cu</span>
            <FaHeart className="mx-1 text-red-500 animate-pulse" />
            <span>pentru sănătatea ta</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;