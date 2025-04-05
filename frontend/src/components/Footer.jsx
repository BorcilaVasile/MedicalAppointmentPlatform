import { FaHeart, FaTwitter, FaGithub, FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white p-6 mt-auto shadow-lg">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Secțiunea principală */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Elysium Medical
          </h3>
          <p className="text-gray-300 text-sm">
            © {new Date().getFullYear()} Elysium Medical Clinics Platform. 
            All rights reserved. Made with <FaHeart className="inline text-red-500 animate-pulse" />
          </p>
        </div>

        {/* Link-uri utile */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-lg font-semibold mb-2 text-blue-300">Quick Links</h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a href="/about" className="hover:text-blue-400 transition-colors duration-300">About Us</a>
            </li>
            <li>
              <a href="/services" className="hover:text-blue-400 transition-colors duration-300">Services</a>
            </li>
            <li>
              <a href="/contact" className="hover:text-blue-400 transition-colors duration-300">Contact</a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-center md:items-end">
          <h4 className="text-lg font-semibold mb-2 text-blue-300">Follow Us</h4>
          <div className="flex space-x-4">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transform hover:scale-110 transition-all duration-300"
            >
              <FaTwitter size={24} />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-200 transform hover:scale-110 transition-all duration-300"
            >
              <FaGithub size={24} />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-700 transform hover:scale-110 transition-all duration-300"
            >
              <FaLinkedin size={24} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-500 transform hover:scale-110 transition-all duration-300"
            >
              <FaInstagram size={24} />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transform hover:scale-110 transition-all duration-300"
            >
              <FaFacebook size={24} />
            </a>
          </div>
        </div>
      </div>

      {/* Linie decorativă */}
      <div className="mt-6 border-t border-gray-700 pt-4 text-center text-gray-500 text-sm">
        <p>
          Designed with passion for healthcare innovation | 
          <span className="animate-pulse"> Powered by xAI</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;