import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import icon from "/assets/logo.png";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    navigate('/');
  };

  // Helper function to check if current path matches
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Active button styles
  const activeStyles = "text-red-500 font-semibold";
  const inactiveStyles = "text-white hover:text-red-500 transition-colors";
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => handleNavigation('/home')}
            className="flex items-center gap-2 space-x-2"
          >
            <img src={icon} alt="MoBook Logo" className="w-[4vh]" />
            <span className="text-3xl font-bold bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
              MoBook
            </span>
          </button>
          
          {/* Desktop Menu */}
          <div className='flex flex-row gap-10 justify-center items-center'>
            <div className="hidden md:flex space-x-8">
              <button 
                onClick={() => handleNavigation('/home')} 
                className={isActivePath('/home') ? activeStyles : inactiveStyles}
              >
                Home
              </button>
              <button 
                onClick={() => handleNavigation('/movies')} 
                className={isActivePath('/movies') ? activeStyles : inactiveStyles}
              >
                Movies
              </button>
              <button 
                onClick={() => handleNavigation('/features')} 
                className={isActivePath('/features') ? activeStyles : inactiveStyles}
              >
                Features
              </button>
              <button 
                onClick={() => handleNavigation('/about')} 
                className={isActivePath('/about') ? activeStyles : inactiveStyles}
              >
                About
              </button>
              <button 
                onClick={() => handleNavigation('/contact')} 
                className={isActivePath('/contact') ? activeStyles : inactiveStyles}
              >
                Contact
              </button>
            </div>

            <div className="hidden md:flex space-x-4">
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800 mt-4">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => handleNavigation('/home')} 
                className={isActivePath('/home') ? activeStyles : "text-white hover:text-red-500 transition-colors "}
              >
                Home
              </button>
              <button 
                onClick={() => handleNavigation('/movies')} 
                className={isActivePath('/movies') ? activeStyles : "text-white hover:text-red-500 transition-colors "}
              >
                Movies
              </button>
              <button 
                onClick={() => handleNavigation('/features')} 
                className={isActivePath('/features') ? activeStyles : "text-white hover:text-red-500 transition-colors"}
              >
                Features
              </button>
              <button 
                onClick={() => handleNavigation('/about')} 
                className={isActivePath('/about') ? activeStyles : "text-white hover:text-red-500 transition-colors"}
              >
                About
              </button>
              <button 
                onClick={() => handleNavigation('/contact')} 
                className={isActivePath('/contact') ? activeStyles : "text-white hover:text-red-500 transition-colors"}
              >
                Contact
              </button>
              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={handleLogout}
                  className="w-full md:w-auto px-4 py-2 text-sm bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}