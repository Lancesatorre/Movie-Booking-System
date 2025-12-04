import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import icon from "/assets/logo.png";
import ConfirmationModal from '../Modal/ConfimationModal';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user has booking in progress (simpler approach)
  const hasBookingInProgress = () => {
    return localStorage.getItem('bookingInProgress') === 'true';
  };

  const handleNavigation = (path) => {
    // If user has booking in progress and trying to navigate away from checkout
    const isCurrentlyInCheckout = location.pathname.includes('/movies-checkout');
    
    if (hasBookingInProgress() && isCurrentlyInCheckout && path !== location.pathname) {
      setPendingNavigation(() => () => {
        setMobileMenuOpen(false);
        // Clear booking data
        localStorage.removeItem('bookingInProgress');
        localStorage.removeItem('bookingStep');
        localStorage.removeItem('bookingData');
        navigate(path);
      });
      setShowConfirmModal(true);
    } else {
      setMobileMenuOpen(false);
      navigate(path);
    }
  };

  const handleLogout = () => {
    const doLogout = () => {
      console.log("Logging out...");

      //clear booking data
      localStorage.removeItem("bookingInProgress");
      localStorage.removeItem("bookingStep");
      localStorage.removeItem("bookingData");

      //clear auth data (this is the important part)
      localStorage.removeItem("user");
      localStorage.removeItem("mobook_user");

      //if you ever used sessionStorage for auth
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("mobook_user");

      //close mobile menu + go to login
      setMobileMenuOpen(false);
      navigate("/", { replace: true });
    };

    if (hasBookingInProgress()) {
      setPendingNavigation(() => doLogout);
      setShowConfirmModal(true);
    } else {
      doLogout();
    }
  };


  const confirmNavigation = () => {
    if (pendingNavigation) {
      pendingNavigation();
    }
    setShowConfirmModal(false);
    setPendingNavigation(null);
  };

  const cancelNavigation = () => {
    setShowConfirmModal(false);
    setPendingNavigation(null);
  };

  const isActivePath = (path) => {
    const currentPath = location.pathname;
    
    if (currentPath === '/' || currentPath === '') {
      return path === '/Home';
    }
    
    return currentPath === path;
  };

  const activeStyles = "text-red-500 font-semibold";
  const inactiveStyles = "text-white hover:text-red-500 transition-colors";
  
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => handleNavigation('/Home')}
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
                  onClick={() => handleNavigation('/Home')} 
                  className={isActivePath('/Home') ? activeStyles : inactiveStyles}
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
                  onClick={() => handleNavigation('/Home')} 
                  className={isActivePath('/Home') ? activeStyles : "text-white hover:text-red-500 transition-colors "}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
        title="Leave Booking Process?"
        message="You have an ongoing booking. Are you sure you want to leave? Your progress will be lost."
        confirmText="Confirm"
        cancelText="Back"
      />
    </>
  );
}