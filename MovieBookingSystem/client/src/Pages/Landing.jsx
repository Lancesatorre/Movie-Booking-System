import React, { useState, useEffect } from 'react';
import { ChevronDown, Ticket, Smartphone, Lock, Armchair, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import icon from "/assets/logo.png";
import ConfirmationModal from '../Modal/ConfimationModal';
import LoadingState from '../Components/LoadingState';

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [movies, setMovies] = useState([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user has booking in progress
  const hasBookingInProgress = () => {
    return localStorage.getItem('bookingInProgress') === 'true';
  };

  const handleBookTickets = () => {
    navigate('/movies');
  };
  
  const handleMyProfile = () => {
    navigate('/profile')
    setIsProfileOpen(false);
  }
  const handleMyTickets = () => {
    navigate('/my-tickets');
    setIsProfileOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    performLogout(); 
  };

  const performLogout = () => {
    setIsLoggingOut(true);
    
    setTimeout(() => {
      console.log("Logging out...");

      // Clear booking data
      localStorage.removeItem("bookingInProgress");
      localStorage.removeItem("bookingStep");
      localStorage.removeItem("bookingData");

      // Clear auth data
      localStorage.removeItem("user");
      localStorage.removeItem("mobook_user");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("mobook_user");

      setIsLoggingOut(false);
      setShowLogoutModal(false);
      setIsProfileOpen(false);
      
      navigate("/", { replace: true });
    }, 1500);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const confirmNavigation = () => {
    if (pendingLogout) {
      setPendingLogout(false);
      setShowConfirmModal(false);
      performLogout();
    }
  };

  const cancelNavigation = () => {
    setShowConfirmModal(false);
    if (pendingLogout) {
      setShowLogoutModal(true);
      setPendingLogout(false);
    }
  };

  // fethc customer details
  useEffect(() => {
    try {
      const u =
        JSON.parse(localStorage.getItem("mobook_user")) ||
        JSON.parse(localStorage.getItem("user"));

      if (u) {
        const full =
          `${u.FirstName || ""} ${u.MiddleName ? u.MiddleName + " " : ""}${u.LastName || ""}`.trim();
        setUserName(full || "Guest");
      }
    } catch {}
  }, []);

  // Fetch movies for background
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch('http://localhost/mobook_api/get_movies.php');
        const data = await res.json();
        if (data.success && data.movies) {
          setMovies(data.movies);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
      }
    };
    fetchMovies();
  }, []);

  // Auto-rotate background images
  useEffect(() => {
    if (movies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % movies.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [movies]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: "Easy Booking",
      description: "Book tickets in just a few clicks",
      icon: Ticket,
      delay: 0
    },
    {
      title: "Multiple Platforms",
      description: "Access via desktop, mobile, or theater kiosk",
      icon: Smartphone,
      delay: 100
    },
    {
      title: "Secure Payment",
      description: "Safe and reliable payment processing",
      icon: Lock,
      delay: 200
    },
    {
      title: "Real-time Seats",
      description: "View available seats in real-time",
      icon: Armchair,
      delay: 300
    }
  ];

  return (
    <div className="min-h-screen text-white overflow-hidden">
      {/* Fixed Profile Button - Lower Left */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="relative">
          {/* Dropdown Menu (appears above) */}
          {isProfileOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-64 text-left bg-black rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-red-600/20 to-orange-600/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-xl font-bold">
                    {userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{userName}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button 
                  onClick={handleMyProfile} 
                  className="cursor-pointer  w-full text-left px-4 py-3 hover:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
                  disabled={isLoggingOut}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </button>
                
                <button 
                  onClick={handleMyTickets} 
                  className="cursor-pointer w-full text-left px-4 py-3 hover:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
                  disabled={isLoggingOut}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  My Tickets
                </button>
                
                <div className="border-t border-gray-700 my-2"></div>
                
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer w-full text-left px-4 py-3 hover:bg-red-600/20 rounded-lg transition-colors flex items-center gap-3 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          )}
          
          {/* Profile Button */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            disabled={isLoggingOut}
            className="cursor-pointer flex items-center gap-3 bg-black hover:from-gray-700 hover:to-gray-800 px-4 py-3 rounded-full border border-gray-700 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-lg font-bold">
              {userName.charAt(0)}
            </div>
            <span className="font-semibold">{userName}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

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
      
      {/* Loading State Overlay */}
      {isLoggingOut && (
        <LoadingState message="Logging you out..." />
      )}

     

      {/* Hero Section with Dynamic Background */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Carousel */}
        {movies.length > 0 && (
          <div className="absolute inset-0">
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className="absolute inset-0 transition-opacity duration-3000 ease-in-out"
                style={{
                  opacity: index === currentBgIndex ? 1 : 0,
                  zIndex: index === currentBgIndex ? 1 : 0
                }}
              >
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-black/55 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            ))}
          </div>
        )}

        {/* Animated Particles Effect */}
        <div className="absolute inset-0 z-[2]">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-600 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            />
          ))}

           {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-2 bg-red-600 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mb-6 inline-block animate-fade-in-down">
            <span className="px-2 py-1 text-xs md:text-sm md:px-4 md:py-2 rounded-full bg-red-900/40 border border-red-500/50 text-red-300 font-semibold text-sm backdrop-blur-md">
              The Future of Movie Booking
            </span>
          </div>

          <h1 className="text-[40px] text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-fade-in-up">
            Your Ultimate
            <span className="block bg-gradient-to-r from-red-700  via-orange-600/20 to-orange-500 bg-clip-text text-transparent animate-gradient">
              Movie Experience
            </span>
          </h1>

          <p className="text-xs md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Book tickets, choose your seats, and enjoy the show with MoBook — the modern movie booking system designed for today's cinemas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button 
              onClick={handleBookTickets}
              className="group px-8 py-4 bg-gradient-to-r from-red-700 to-orange-600/20 rounded-lg hover:from-red-500 hover:to-orange-500 transition-all duration-300 text-lg font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transform cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                Book Tickets Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button 
              onClick={handleMyTickets}
              className="cursor-pointer px-8 py-4 border-2 border-red-500/50 rounded-lg hover:border-red-500 hover:bg-red-900/20 transition-all duration-300 text-lg font-semibold backdrop-blur-md hover:scale-105 transform"
            >
              My Tickets
            </button>
          </div>

          {/* Movie Indicators */}
          {movies.length > 0 && (
            <div className="flex justify-center gap-2 mb-8">
              {movies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBgIndex(index)}
                  className={`transition-all duration-500 rounded-full cursor-pointer ${
                    index === currentBgIndex 
                      ? 'w-8 h-2 bg-red-500' 
                      : 'w-2 h-2 bg-black border border-red-800 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <ChevronDown className="mx-auto text-red-500" size={24} />
          </div>
        </div>

        {/* Vignette Effect */}
        <div className="absolute inset-0 pointer-events-none z-[3]" style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
        }}></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative bg-transparent">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
              Why Choose <span className="bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">MoBook</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience seamless movie booking with our advanced features designed for both customers and theater staff.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((Feature, index) => {
              const IconComponent = Feature.icon;
              return (
                <div 
                  key={index}
                  className="group relative"
                  style={{ animation: `fadeInUp 0.6s ease-out ${Feature.delay}ms both` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 group-hover:border-red-500/50 transition-all duration-300 h-full transform group-hover:-translate-y-2">
                    <div className="mb-4 text-red-500 group-hover:text-orange-500 transition-colors duration-300 transform group-hover:scale-110 group-hover:rotate-6 transition-transform flex justify-center">
                      <IconComponent size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-center">{Feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-center">{Feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section with Parallax */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-transparent"></div>
        <div className="absolute inset-0" ></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Ready to Transform Your <span className="bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">Cinema Experience</span>?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of cinema-goers who've already discovered the easiest way to book tickets.
          </p>
          <button 
            onClick={handleBookTickets}
            className="cursor-pointer px-10 py-4 bg-gradient-to-r from-red-700 to-orange-600/20 rounded-lg hover:from-red-500 hover:to-orange-500 transition-all duration-300 text-lg font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transform"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-black border-t border-red-500/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className='flex flex-row gap-2 justify-center md:justify-start'>
                <img src={icon} alt="MoBook Logo" className="w-[4vh] h-[3vh]" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent mb-4">
                  MoBook
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-center md:text-left">
                Your ultimate movie booking experience
              </p>
            </div>
            
            <div className='text-center md:text-right'>
              <h4 className="text-lg font-semibold mb-4 text-red-500">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <button onClick={() => handleNavigation('/movies')} className=" cursor-pointer hover:text-red-500 transition-colors">
                    Movies
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/features')} className="cursor-pointer hover:text-red-500 transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/about')} className="cursor-pointer hover:text-red-500 transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/contact')} className="cursor-pointer hover:text-red-500 transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            
            <div className='text-center md:text-right'>
              <h4 className="text-lg font-semibold mb-4 text-red-500">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <button onClick={() => handleNavigation('/help-center')} className="cursor-pointer hover:text-red-500 transition-colors">
                    Help Center
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/faq')} className="cursor-pointer hover:text-red-500 transition-colors">
                    FAQ
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/contact')} className="cursor-pointer hover:text-red-500 transition-colors">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/privacy-policy')} className="cursor-pointer hover:text-red-500 transition-colors">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            
            <div className='text-center md:text-right'>
              <h4 className="text-lg font-semibold mb-4 text-red-500">Contact Info</h4>
              <ul className="space-y-3 text-gray-400">
                <li>MoBook@gmail.com</li>
                <li>(+63) 923 1324 213</li>
                <li>University of Cebu Main Campus</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-red-500/50 pt-8 text-center text-gray-500 space-y-2">
            <p>&copy; 2024 MoBook Movie Booking System. All rights reserved.</p>
            <p className="text-sm">Developed by: Lance Timothy B. Satorre, Euwen Aldrich D. Villarin, Yvone Bardon, Neri Sergio</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          50% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0.5;
          }
          90% {
            opacity: 0.3;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-down {
          animation: fade-in-down 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
          animation-fill-mode: both;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Landing;