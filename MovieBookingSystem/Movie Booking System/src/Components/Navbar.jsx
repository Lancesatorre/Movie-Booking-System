import React, { useState } from 'react';
import icon from "/assets/logo.png";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="bg-black/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800 w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 space-x-2">
            <img src={icon} alt="Exequeue Logo" className="w-[4vh]" />
            <span className="text-3xl font-bold bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
              MoBook
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 text-white">
            <a href="#movies" className="hover:text-red-500 transition-colors">Movies</a>
            <a href="#features" className="hover:text-red-500 transition-colors">Features</a>
            <a href="#about" className="hover:text-red-500 transition-colors">About</a>
            <a href="#contact" className="hover:text-red-500 transition-colors">Contact</a>
          </div>

          <div className="hidden md:flex space-x-4">
            <button className="px-4 py-2 text-sm bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
              Logout
            </button>
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
              <a href="#movies" className="hover:text-red-500 transition-colors">Movies</a>
              <a href="#features" className="hover:text-red-500 transition-colors">Features</a>
              <a href="#about" className="hover:text-red-500 transition-colors">About</a>
              <a href="#contact" className="hover:text-red-500 transition-colors">Contact</a>
              <div className="flex space-x-4 pt-4">
                <button className="flex-1 px-4 py-2 text-sm border border-gray-600 rounded-lg hover:border-red-500 transition-colors">
                  Login
                </button>
                <button className="flex-1 px-4 py-2 text-sm bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}