import React from 'react';
import companyLogo from '../assets/elysium-logo.svg';
import backgroundImage from '../assets/background-image.jpg';

function CompanyInfo() {
  return (
    <div
      className="hidden md:flex md:w-1/2 flex-col items-center justify-center text-center md:p-12 relative overflow-hidden text-white"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Conținut */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                flex flex-col items-center px-10 py-12 backdrop-blur-md bg-white/10 
                rounded-2xl shadow-xl border border-white/30 z-10 w-[90%] max-w-xl">
        {/* Logo animat */}
        <img
            src={companyLogo}
            alt="Elysium Medical Logo"
            className="w-28 h-28 mb-6 transition-transform duration-700 hover:scale-110"
        />

        {/* Slogan */}
        <blockquote className="text-2xl md:text-3xl italic font-bold text-[var(--text-400)] text-center mb-4 relative group">
            <span className="relative z-10">
            Your health is our priority.
            <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full"></span>
            </span>
        </blockquote>

        {/* Subtext */}
        <p className="text-sm md:text-base text-[var(--text-500)] text-center max-w-md leading-relaxed">
            At Elysium Medical, we are committed to providing top-notch healthcare services with care and compassion.
        </p>
        </div>


      {/* Animație de fundal mai fină */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-[var(--primary-500)]/30 to-transparent animate-[pulse_6s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
}

export default CompanyInfo;
