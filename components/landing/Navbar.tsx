import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonPrimary from '../ui/ButtonPrimary';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Text color changes based on scroll state
  const textColorClass = 'text-slate-400';
  const logoColorClass = 'text-white';
  const hoverColorClass = 'hover:text-white';

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 bg-[#040608] ${isScrolled ? 'bg-[#040608]/70 backdrop-blur-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 md:gap-4">
            <img src="/header/Subtract (1).svg" alt="Shotly" className="w-6 h-6 md:w-8 md:h-8 rounded-md" />
            <span className={`text-lg md:text-xl font-medium ${logoColorClass}`}>Shotly</span>
          </div>

          <div className="flex items-center justify-between w-full">
            <div></div>
            <div className="hidden sm:flex items-center gap-8">
              <a href="#pricing" className={`${textColorClass} ${hoverColorClass} font-medium text-sm transition-colors`}>Pricing</a>
              <a href="#" className={`${textColorClass} ${hoverColorClass} font-medium text-sm transition-colors`}>Contact us</a>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                className="px-3 md:px-5 py-3 rounded-lg text-sm font-medium transition-colors border-1 border-white text-white hover:bg-white/10"
                onClick={() => navigate('/login')}
              >
                Log in
              </button>
              <ButtonPrimary className="px-3 md:px-5">Start free</ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;