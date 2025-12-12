import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Film, Ticket, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isLoggingOut, setIsLoggingOut] = useState(false); // State for logout loading

  // Set active menu based on current path
  useEffect(() => {
    const pathToMenuId = {
      '/admin/dashboard': 'dashboard',
      '/admin/movie-management': 'movies',
      '/admin/booking-management': 'bookings',
      '/settings': 'settings'
    };

    const currentPath = location.pathname;
    let foundMenu = 'dashboard';
    
    if (pathToMenuId[currentPath]) {
      foundMenu = pathToMenuId[currentPath];
    } else {
      Object.keys(pathToMenuId).forEach(path => {
        if (currentPath.startsWith(path)) {
          foundMenu = pathToMenuId[path];
        }
      });
    }

    setActiveMenu(foundMenu);
  }, [location.pathname]);

  // Notify parent when sidebar state changes
  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', path: '/admin/dashboard' },
    { icon: Film, label: 'Movies', id: 'movies', path: '/admin/movie-management' },
    { icon: Ticket, label: 'Bookings', id: 'bookings', path: '/admin/booking-management' }
  ];

  const handleMenuClick = (id, path) => {
    setActiveMenu(id);
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Logout handler with loading state
  // Updated handleLogout function - simpler and more reliable
const handleLogout = async () => {
  setIsLoggingOut(true);
  
  try {
    // Clear all user data from localStorage immediately
    localStorage.removeItem("mobook_user");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("auth_token"); // Add this if you use token
    
    // Option 1: Try API call first (if you have logout endpoint)
    try {
      const response = await fetch("http://localhost/mobook_api/logout.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token") || ""}`
        },
        credentials: 'include' // Important for session cookies
      });
      
      const result = await response.json();
      console.log("Logout API response:", result);
    } catch (apiError) {
      console.log("Logout API failed, proceeding with client-side logout:", apiError);
    }
    
    // Keep the loading state for a moment before redirecting
    setTimeout(() => {
      // Clear any remaining localStorage items
      localStorage.clear();
      
      // Redirect to home/login page
      window.location.href = "/";
    }, 1500); // Show loading for 1.5 seconds
    
  } catch (error) {
    console.error("Logout error:", error);
    
    // Even if there's an error, clear localStorage and redirect
    localStorage.clear();
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  }
};

  return (
    <>
      {/* Logout Loading Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center">
            {/* Spinner */}
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-b-4 border-transparent border-t-red-600 border-b-red-600 h-32 w-32 mx-auto"></div>
              <div className="relative animate-pulse">
                <div className="h-32 w-32 mx-auto bg-gradient-to-br from-red-600/20 to-red-600/5 rounded-full flex items-center justify-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-red-600/30 to-transparent rounded-full"></div>
                </div>
              </div>
              
              {/* Pulse effect */}
              <div className="absolute inset-0 mx-auto h-32 w-32">
                <div className="absolute inset-0 animate-ping rounded-full bg-red-600/20"></div>
                <div 
                  className="absolute inset-4 animate-ping rounded-full bg-red-600/10"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>

            {/* Loading text */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                Logging out...
              </h3>
              <p className="text-gray-400 text-sm animate-pulse">
                Please wait while we secure your session...
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center mt-6 space-x-2">
              <div 
                className="h-2 w-2 bg-red-500 rounded-full animate-bounce"
                style={{ animationDelay: '0s' }}
              ></div>
              <div 
                className="h-2 w-2 bg-red-500 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div 
                className="h-2 w-2 bg-red-500 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle Button - Outside sidebar */}
      <button
        onClick={handleToggle}
        className={`cursor-pointer fixed bg-gradient-to-br from-red-600 to-red-800 text-white p-2 rounded-xl shadow-lg hover:shadow-red-500/50 hover:scale-110 transition-all duration-300 z-50 ${
          isOpen 
            ? 'left-[285px]'
            : 'left-[5px] lg:left-[85px]'
        } top-6 transition-all duration-300`}
      >
        <img 
          src="/assets/AdminDashboard/minimize.png" 
          alt="Toggle sidebar" 
          className='w-6 h-6 transition-transform duration-300'
          style={{
            transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)'
          }}
        />
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 rounded-r-4xl h-full bg-gradient-to-b from-black/95 via-red-950/95 to-black/95 backdrop-blur-md border-r border-red-900/30 z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-70' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className={`h-full flex flex-col ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'} transition-opacity duration-300`}>
          {/* Logo */}
          <div className={`border-b border-red-900/30 ${isOpen ? 'p-4' : "py-6.5 px-3"}`}>
            <div 
              onClick={() => setIsOpen(true)}
              className={`flex items-center gap-3 ${!isOpen && 'lg:justify-center'} cursor-pointer`}
            >
              <img 
                src="/assets/logo.png" 
                alt="MoBook Logo" 
                className={`w-8 h-8 lg:w-6 lg:h-6 xl:w-7 xl:h-7 transition-all duration-300`} 
              />
              {isOpen && (
                <div className="overflow-hidden text-left">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">MoBook</h1>
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 pt-10 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id, item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  activeMenu === item.id
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 scale-105'
                    : 'cursor-pointer text-gray-300 hover:bg-red-900/30 hover:text-white hover:scale-102'
                } ${!isOpen && 'lg:justify-center lg:px-2'}`}
                style={{ 
                  animation: isOpen ? `slideIn 0.3s ease-out ${index * 50}ms both` : 'none'
                }}
              >
                <item.icon 
                  size={20} 
                  className={`flex-shrink-0 transition-transform duration-200 ${
                    activeMenu === item.id ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                />
                {isOpen && (
                  <span className="font-medium truncate">
                    {item.label}
                  </span>
                )}
                {!isOpen && (
                  <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* Profile Section */}
          <div className="p-4 border-t border-red-900/30">
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsOpen(true);
                }}
                className={ `cursor-pointer  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-red-900/30 hover:text-white group ${
                  !isOpen && 'lg:justify-center lg:px-2'
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/30">
                  <User size={16} className="text-white" />
                </div>
                {isOpen && (
                  <>
                    <span className="font-medium flex-1 text-left truncate">Admin</span>
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-200 ${
                        isProfileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </>
                )}
                {!isOpen && (
                  <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Profile
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {isProfileOpen && isOpen && (
                <div className="mt-2 space-y-1" style={{ animation: 'slideDown 0.2s ease-out' }}>
                  <button
                    onClick={() => {
                      navigate('/admin/profile');
                      setActiveMenu('settings');
                    }}
                    disabled={isLoggingOut}
                    className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-red-900/30 hover:text-white transition-all duration-200 pl-12 group ${
                      isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                     <User size={16} className="text-white" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-red-900/30 hover:text-red-400 transition-all duration-200 pl-12 ${
                      isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full"></div>
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={16} />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content spacer */}
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-70' : 'lg:ml-20'}`} />

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 200px;
          }
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        /* Custom scrollbar */
        aside::-webkit-scrollbar {
          width: 4px;
        }

        aside::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        aside::-webkit-scrollbar-thumb {
          background: rgba(220, 38, 38, 0.5);
          border-radius: 2px;
        }

        aside::-webkit-scrollbar-thumb:hover {
          background: rgba(220, 38, 38, 0.7);
        }
      `}</style>
    </>
  );
}