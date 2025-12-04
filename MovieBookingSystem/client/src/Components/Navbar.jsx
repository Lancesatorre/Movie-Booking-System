import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import icon from "/assets/logo.png";
import ConfirmationModal from '../Modal/ConfimationModal';
import LoadingState from './LoadingState';// Import the loading component

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [pendingLogout, setPendingLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // New state for loading
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
    // Show logout confirmation modal
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Check if there's a booking in progress
    if (hasBookingInProgress()) {
      setPendingLogout(true);
      setShowLogoutModal(false);
      setShowConfirmModal(true);
    } else {
      // No booking in progress, proceed with logout directly
      performLogout();
    }
  };

  const performLogout = () => {
    setIsLoggingOut(true); // Show loading state
    
    // Simulate some processing time (e.g., API call, cleanup)
    setTimeout(() => {
      console.log("Logging out...");

      // Clear booking data
      localStorage.removeItem("bookingInProgress");
      localStorage.removeItem("bookingStep");
      localStorage.removeItem("bookingData");

      // Clear auth data
      localStorage.removeItem("user");
      localStorage.removeItem("mobook_user");

      // If you ever used sessionStorage for auth
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("mobook_user");

      // Close mobile menu
      setMobileMenuOpen(false);
      
      // Reset states
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      
      // Navigate to login page
      navigate("/", { replace: true });
    }, 1500); // 1.5 second delay to show loading state
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const confirmNavigation = () => {
    if (pendingLogout && pendingNavigation) {
      // This is for logout with booking in progress
      setPendingLogout(false);
      setShowConfirmModal(false);
      performLogout(); // Call logout with loading state
    } else if (pendingNavigation) {
      // This is for regular navigation with booking in progress
      pendingNavigation();
      setShowConfirmModal(false);
    }
    setPendingNavigation(null);
  };

  const cancelNavigation = () => {
    setShowConfirmModal(false);
    setPendingNavigation(null);
    if (pendingLogout) {
      // If they cancel navigation while trying to logout, show logout modal again
      setShowLogoutModal(true);
      setPendingLogout(false);
    }
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
                  disabled={isLoggingOut}
                  className="px-4 py-2 text-sm bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              disabled={isLoggingOut}
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
                  className={isActivePath('/Home') ? activeStyles : "text-white hover:text-red-500 transition-colors"}
                  disabled={isLoggingOut}
                >
                  Home
                </button>
                <button 
                  onClick={() => handleNavigation('/movies')} 
                  className={isActivePath('/movies') ? activeStyles : "text-white hover:text-red-500 transition-colors"}
                  disabled={isLoggingOut}
                >
                  Movies
                </button>
                <button 
                  onClick={() => handleNavigation('/features')} 
                  className={isActivePath('/features') ? activeStyles : "text-white hover:text-red-500 transition-colors"}
                  disabled={isLoggingOut}
                >
                  Features
                </button>
                <button 
                  onClick={() => handleNavigation('/contact')} 
                  className={isActivePath('/contact') ? activeStyles : "text-white hover:text-red-500 transition-colors"}
                  disabled={isLoggingOut}
                >
                  Contact
                </button>
                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full md:w-auto px-4 py-2 text-sm bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Loading State Overlay */}
      {isLoggingOut && (
        <LoadingState message="Logging you out..." />
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
        confirmText="Confirm"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-700"
        disableButtons={isLoggingOut}
      />

      {/* Navigation Confirmation Modal (for booking in progress) */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
        title={pendingLogout ? "Logout with Active Booking" : "Leave Booking Process?"}
        message={
          pendingLogout 
            ? "You have an ongoing booking. Logging out will cancel your booking. Are you sure you want to logout?"
            : "You have an ongoing booking. Are you sure you want to leave? Your progress will be lost."
        }
        confirmText={pendingLogout ? "Yes, Logout Anyway" : "Confirm"}
        cancelText={pendingLogout ? "Continue Booking" : "Back"}
        confirmColor={pendingLogout ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
        disableButtons={isLoggingOut}
      />
    </>
  );
}