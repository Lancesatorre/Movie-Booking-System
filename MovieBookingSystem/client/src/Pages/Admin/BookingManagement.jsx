// BookingManagement.jsx
import React, { useState, useEffect } from 'react';
import { Film, Users, Calendar, MapPin, ChevronDown, ChevronUp, X, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function BookingManagement() {
  const [animateCards, setAnimateCards] = useState(false);
  const [expandedMovie, setExpandedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedScreen, setSelectedScreen] = useState('all');

  // ✅ bookings must exist BEFORE any filter logic runs
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // ✅ correct endpoint (php)
        const res = await fetch("http://localhost/mobook_api/get_booking_management.php");
        const data = await res.json();

        if (data.success) {
          // ✅ always normalize to array
          const safeBookings = Array.isArray(data.bookings) ? data.bookings : [];
          setBookings(safeBookings);
        } else {
          console.error(data.message || "Failed to load bookings");
          setBookings([]);
        }
      } catch (err) {
        console.error("Bookings fetch error:", err);
        setBookings([]);
      }
    };

    fetchBookings();
  }, []);

  // Get all unique screens from all movies
  const allScreens = Array.from(
    new Set(
      bookings.flatMap(movie => Array.isArray(movie.screens) ? movie.screens : [])
    )
  ).sort();

  const toggleMovie = (movieId) => {
    setExpandedMovie(expandedMovie === movieId ? null : movieId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className="text-emerald-400" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const movieTitle = String(booking.movieTitle || "").toLowerCase();
    const details = Array.isArray(booking.bookingDetails) ? booking.bookingDetails : [];

    const matchesSearch =
      movieTitle.includes(searchQuery.toLowerCase()) ||
      details.some(detail =>
        String(detail.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(detail.email || "").toLowerCase().includes(searchQuery.toLowerCase())
      );

    // ✅ selectedScreen is string like "Screen 1"
    const screens = Array.isArray(booking.screens) ? booking.screens : [];
    const matchesScreen = selectedScreen === 'all' || screens.includes(selectedScreen);

    if (filterStatus === 'all') {
      return matchesSearch && matchesScreen;
    }

    const hasMatchingStatus = details.some(detail => detail.status === filterStatus);
    return matchesSearch && matchesScreen && hasMatchingStatus;
  });

  const totalBookings = bookings.reduce((sum, movie) => sum + (movie.totalBookings || 0), 0);

  const confirmedBookings = bookings.reduce((sum, movie) =>
    sum + (Array.isArray(movie.bookingDetails)
      ? movie.bookingDetails.filter(b => b.status === 'confirmed').length
      : 0), 0);

  const cancelledBookings = bookings.reduce((sum, movie) =>
    sum + (Array.isArray(movie.bookingDetails)
      ? movie.bookingDetails.filter(b => b.status === 'cancelled').length
      : 0), 0);

  const totalRevenue = bookings.reduce((sum, movie) =>
    sum + (Array.isArray(movie.bookingDetails)
      ? movie.bookingDetails
          .filter(b => b.status === 'confirmed')
          .reduce((bookingSum, b) => bookingSum + Number(b.totalAmount || 0), 0)
      : 0), 0);

  const stats = [
    { label: 'Total Bookings', value: totalBookings, color: 'from-red-600 via-red-500 to-pink-600', icon: Calendar, glow: 'shadow-red-500/50' },
    { label: 'Confirmed', value: confirmedBookings, color: 'from-emerald-600 via-green-500 to-teal-600', icon: CheckCircle, glow: 'shadow-emerald-500/50' },
    { label: 'Cancelled', value: cancelledBookings, color: 'from-orange-600 via-amber-500 to-yellow-600', icon: XCircle, glow: 'shadow-orange-500/50' },
    { label: 'Revenue', value: `₱ ${totalRevenue.toLocaleString()}`, color: 'from-blue-600 via-cyan-500 to-sky-600', icon: Film, glow: 'shadow-blue-500/50' },
  ];

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-6">
      {/* Header */}
      <div className="mb-8 md:mb-12 pt-15 animate-slide-down">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
          <h1 className="text-left text-4xl lg:text-5xl pb-2 font-black text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-orange-600/20">
            Bookings
          </h1>
        </div>
        <p className="text-left text-xs xs:text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl">
          View and manage all customer bookings across all movies and screens
        </p>
      </div>

      {/* Stats Cards - Responsive grid */}
      <div className="grid text-left grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 md:mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`relative bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border border-red-900/30 rounded-lg sm:rounded-xl md:rounded-2xl p-3 xs:p-4 sm:p-4 md:p-5 lg:p-6 overflow-hidden group hover:scale-105 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg md:hover:shadow-2xl ${stat.glow} ${
                animateCards ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="absolute -top-5 -right-5 xs:-top-6 xs:-right-6 sm:-top-6 sm:-right-6 md:-top-8 md:-right-8 lg:-top-12 lg:-right-12 w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-22 md:h-22 lg:w-28 lg:h-28 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1 xs:mb-2 sm:mb-2 md:mb-3 lg:mb-4">
                  <div className='flex flex-row items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 flex-1 min-w-0'>
                    <Icon className="text-gray-500 group-hover:text-red-400 transition-colors duration-300 flex-shrink-0 w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                    <p className="text-gray-400 text-xs xs:text-xs sm:text-sm md:text-base lg:text-lg font-medium truncate">
                      {stat.label}
                    </p>
                  </div>
                  <div className={`w-1.5 h-1.5 xs:w-2 sm:w-2 xs:h-2 sm:h-10 rounded-full bg-gradient-to-r ${stat.color} animate-pulse flex-shrink-0 ml-1 xs:ml-2`}></div>
                </div>
                <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 group-hover:from-red-400 group-hover:to-pink-400 transition-all duration-300 leading-tight">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters - Responsive layout */}
      <div className="bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border border-red-900/30 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 shadow-xl hover:border-red-500/30 transition-all duration-300">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 md:gap-6 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-red-400 transition-colors duration-300 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by movie, user name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-lg sm:rounded-xl md:rounded-xl pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 sm:gap-3 md:gap-4 w-full sm:w-auto">
            <div className="relative flex-1 xs:flex-initial group">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none w-4 h-4 sm:w-5 sm:h-5" />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none w-3 h-3 sm:w-4 sm:h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-lg sm:rounded-xl md:rounded-xl pl-9 sm:pl-12 pr-8 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer hover:bg-black/80"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="relative flex-1 xs:flex-initial group">
              <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none w-4 h-4 sm:w-5 sm:h-5" />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none w-3 h-3 sm:w-4 sm:h-4" />
              <select
                value={selectedScreen}
                onChange={(e) => setSelectedScreen(e.target.value)}
                className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-lg sm:rounded-xl md:rounded-xl pl-9 sm:pl-12 pr-8 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer hover:bg-black/80"
              >
                <option value="all">All Screens</option>
                {allScreens.map(screen => (
                  <option key={screen} value={screen}>{screen}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Movies List */}
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {filteredBookings.map((movie, index) => {
          const isExpanded = expandedMovie === movie.movieId;
          let visibleBookings = Array.isArray(movie.bookingDetails) ? movie.bookingDetails : [];
          
          // Apply screen filter to individual bookings
          if (selectedScreen !== 'all') {
            visibleBookings = visibleBookings.filter(booking => booking.screen === selectedScreen);
          }
          
          // Apply status filter
          if (filterStatus !== 'all') {
            visibleBookings = visibleBookings.filter(booking => booking.status === filterStatus);
          }

          return (
            <div
              key={movie.movieId}
              className={`bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border-2 border-red-900/30 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-500 ${
                animateCards ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${400 + index * 80}ms` }}
            >
              {/* Movie Header - Responsive layout */}
              <button
                onClick={() => toggleMovie(movie.movieId)}
                className="cursor-pointer w-full p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/5 transition-colors duration-300 gap-3 sm:gap-0"
              >
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
                  <img 
                    src={movie.movieImage} 
                    alt={movie.movieTitle}
                    className="w-14 h-20 xs:w-16 xs:h-24 sm:w-18 sm:h-26 md:w-20 md:h-28 object-cover rounded sm:rounded-lg shadow-lg flex-shrink-0"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="text-lg xs:text-xl sm:text-2xl md:text-2xl font-black text-white mb-1 sm:mb-2 truncate">{movie.movieTitle}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs xs:text-sm text-gray-400">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Film size={14} className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                        <span className="truncate">
                          {movie.screens.length === 1 
                            ? movie.screens[0]
                            : `${movie.screens.length} Screens`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Users size={14} className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                        <span>{visibleBookings.length} {visibleBookings.length === 1 ? 'Booking' : 'Bookings'}</span>
                      </div>
                    </div>
                    {/* Display screens badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {movie.screens.map((screen, idx) => (
                        <span 
                          key={idx}
                          className={`text-xs px-2 py-0.5 rounded-full ${selectedScreen === 'all' || selectedScreen === screen 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}
                        >
                          {screen}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                  <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-lg sm:rounded-xl border border-red-500/30">
                    <span className="text-lg sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                      {movie.totalBookings}
                    </span>
                    <span className="text-xs text-gray-400 ml-1 sm:ml-2">Total</span>
                  </div>
                  <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} className="text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </button>

              {/* Booking Details - Responsive layout */}
              {isExpanded && (
                <div className="border-t border-gray-700/50 animate-slide-down">
                  {visibleBookings.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center text-gray-400 text-sm sm:text-base">
                      No {filterStatus === 'all' ? '' : filterStatus} bookings found 
                      {selectedScreen !== 'all' ? ` on ${selectedScreen}` : ''} for this movie
                    </div>
                  ) : (
                    <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                      {visibleBookings.map((booking, idx) => (
                        <div
                          key={booking.id}
                          className="bg-black/40 rounded-lg sm:rounded-xl md:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-800/50 hover:border-red-500/30 transition-all duration-300 animate-fade-in"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
                            {/* User Info */}
                            <div className="flex-1 min-w-0 text-base md:text-left">
                              <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between mb-3 gap-2 xs:gap-0">
                                <div className="min-w-0">
                                  <h4 className="text-base md:text-left sm:text-lg font-bold text-white mb-1 truncate">{booking.userName}</h4>
                                  <p className="text-xs sm:text-sm text-gray-400 truncate">{booking.email}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                  <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border ${getStatusColor(booking.status)} self-start xs:self-auto`}>
                                    {getStatusIcon(booking.status)}
                                    <span className="text-xs font-semibold capitalize">{booking.status}</span>
                                  </div>
                                  <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 self-start xs:self-auto`}>
                                    <Film size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="text-xs font-semibold">{booking.screen}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4 text-left">
                                <div>
                                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">
                                    <Calendar size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="font-semibold">Showtime</span>
                                  </div>
                                  <p className="text-white font-medium text-sm sm:text-base">{booking.dateTime}</p>
                                </div>

                                <div>
                                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">
                                    <MapPin size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="font-semibold">Location</span>
                                  </div>
                                  <p className="text-white font-medium text-sm sm:text-base truncate">{booking.location}</p>
                                </div>

                                <div>
                                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">
                                    <Users size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="font-semibold">Seats</span>
                                  </div>
                                  <p className="text-white font-medium text-sm sm:text-base">
                                    {booking.seats.join(', ').length > 20 ? 
                                      `${booking.seats.join(', ').substring(0, 20)}...` : 
                                      booking.seats.join(', ')} 
                                    ({booking.totalSeats} {booking.totalSeats === 1 ? 'seat' : 'seats'})
                                  </p>
                                </div>

                                <div>
                                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">
                                    <Clock size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="font-semibold">Booked On</span>
                                  </div>
                                  <p className="text-white font-medium text-sm sm:text-base">{booking.bookingDate}</p>
                                </div>
                              </div>
                            </div>

                            {/* Amount */}
                            <div className="lg:border-l lg:border-gray-700/50 lg:pl-5 md:pl-6 pt-3 sm:pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-700/50">
                              <div className="text-center lg:text-right">
                                <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Amount</p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                  ₱ {booking.totalAmount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 truncate">ID: {booking.id}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 sm:py-16 md:py-20 animate-fade-in">
          <div className="inline-block p-4 sm:p-6 bg-gradient-to-br from-gray-900/90 to-black/90 rounded-xl sm:rounded-2xl md:rounded-3xl border-2 border-gray-800/50 mb-4 sm:mb-6">
            <Film size={60} className="text-gray-700 mx-auto w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20" />
          </div>
          <p className="text-gray-400 text-lg sm:text-xl md:text-2xl font-bold">No bookings found</p>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-1 sm:mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
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

        .animate-slide-up {
          animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Custom breakpoints for extra small devices */
        @media (min-width: 475px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        /* Ensure text doesn't overflow on very small screens */
        @media (max-width: 320px) {
          .text-2xl {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
