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
    <footer className="bg-[#3e7a95] dark:bg-[#394c67] text-white mt-auto">
      {/* Top section with main content */}
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-300)] to-[var(--primary-500)]">
              Elysium Medical
            </h3>
            <p className="text-gray-100 text-sm leading-relaxed">
              Platformă medicală dedicată facilitării programărilor și gestionării relației dintre pacienți și medici.
              Oferim acces rapid la cei mai buni specialiști din domeniul medical.
            </p>
            <div className="flex items-center space-x-2 text-gray-100">
              <FaClock className="text-[var(--accent-300)]" />
              <span className="text-sm">Program: Luni - Vineri, 8:00 - 20:00</span>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[var(--accent-300)]">Servicii</h4>
            <ul className="space-y-2 text-gray-100">
              <li className="flex items-center space-x-2">
                <FaUserMd className="text-[var(--accent-300)]" />
                <Link to="/doctors" className="hover:text-[var(--accent-200)] transition-colors duration-300">
                  Găsește un Doctor
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <FaCalendarAlt className="text-[var(--accent-300)]" />
                <Link to="/appointments" className="hover:text-[var(--accent-200)] transition-colors duration-300">
                  Programări Online
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-[var(--accent-300)]" />
                <Link to="/clinics" className="hover:text-[var(--accent-200)] transition-colors duration-300">
                  Clinicile Noastre
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[var(--accent-300)]">Contact</h4>
            <ul className="space-y-3 text-gray-100">
              <li className="flex items-center space-x-2">
                <FaPhone className="text-[var(--accent-300)]" />
                <a href="tel:+40123456789" className="hover:text-[var(--accent-200)] transition-colors duration-300">
                  +40 123 456 789
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <FaEnvelope className="text-[var(--accent-300)]" />
                <a href="mailto:contact@elysium.ro" className="hover:text-[var(--accent-200)] transition-colors duration-300">
                  contact@elysium.ro
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-[var(--accent-300)]" />
                <span>Strada Exemplu, Nr. 123, București</span>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[var(--accent-300)]">Social Media</h4>
            <div className="grid grid-cols-3 gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#326278] dark:bg-[#2b394e] hover:bg-[#25495a] dark:hover:bg-[#394c67] text-[var(--accent-300)] hover:text-[var(--accent-200)] transition-all duration-300"
              >
                <FaFacebook size={24} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#326278] dark:bg-[#2b394e] hover:bg-[#25495a] dark:hover:bg-[#394c67] text-[var(--accent-300)] hover:text-[var(--accent-200)] transition-all duration-300"
              >
                <FaInstagram size={24} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#326278] dark:bg-[#2b394e] hover:bg-[#25495a] dark:hover:bg-[#394c67] text-[var(--accent-300)] hover:text-[var(--accent-200)] transition-all duration-300"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section with copyright */}
      <div className="border-t border-[#326278] dark:border-[#2b394e] bg-[#326278] dark:bg-[#2b394e]">
        <div className="container mx-auto py-4 px-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-100">
          <p>
            © {new Date().getFullYear()} Elysium Medical. Toate drepturile rezervate.
          </p>
          <div className="flex items-center mt-2 md:mt-0">
            <span>Realizat cu</span>
            <FaHeart className="mx-1 text-[#e7b697] animate-pulse" />
            <span>pentru sănătatea ta</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;