import React, { useState, useEffect } from 'react';
import { Film, Ticket, Users, DollarSign, Play, TrendingUp, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // Sample data
  const stats = [
    {
      icon: Film,
      label: 'Total Movies',
      value: '156',
      changeLabel: 'from last month',
      color: 'from-red-600 to-red-700',
      bgGlow: 'bg-black',
    },
    {
      icon: Ticket,
      label: 'Total Bookings Today',
      value: '2,847',
      changeLabel: 'from yesterday',
      color: 'from-orange-600 to-red-600',
      bgGlow: 'bg-black',
    },
    {
      icon: Users,
      label: 'Total Users',
      value: '48,392',
      changeLabel: 'new users',
      color: 'from-purple-600 to-red-600',
      bgGlow: 'bg-black',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: '₱892,450',
      changeLabel: 'from last week',
      color: 'from-green-600 to-emerald-600',
      bgGlow: 'bg-black',
    },
  ];

  const currentMovies = [
    {
      id: 1,
      title: 'Dune: Part Two',
      genre: 'Sci-Fi, Adventure',
      showings: 8,
      bookings: 456,
      revenue: '₱128,400',
    },
    {
      id: 2,
      title: 'Oppenheimer',
      genre: 'Biography, Drama',
      showings: 6,
      bookings: 389,
      revenue: '₱109,520',
    },
    {
      id: 3,
      title: 'Spider-Man: Into the Spider-Verse',
      genre: 'Animation, Action',
      showings: 10,
      bookings: 512,
      revenue: '₱144,160',
    },
    {
      id: 4,
      title: 'The Batman',
      genre: 'Action, Crime',
      showings: 7,
      bookings: 423,
      revenue: '₱119,040',
    },
    {
      id: 5,
      title: 'Barbie',
      genre: 'Comedy, Fantasy',
      showings: 9,
      bookings: 498,
      revenue: '₱140,220',
    },
    // Add more movies for testing scroll
    {
      id: 6,
      title: 'Avatar: The Way of Water',
      genre: 'Sci-Fi, Adventure',
      showings: 12,
      bookings: 612,
      revenue: '₱172,340',
    },
    {
      id: 7,
      title: 'Top Gun: Maverick',
      genre: 'Action, Drama',
      showings: 11,
      bookings: 587,
      revenue: '₱165,280',
    },
    {
      id: 8,
      title: 'Black Panther: Wakanda Forever',
      genre: 'Action, Adventure',
      showings: 9,
      bookings: 534,
      revenue: '₱150,420',
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8 pt-15">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-400 flex items-center gap-2">
          <Calendar size={14} className="md:size-[16px]" />
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`relative bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border border-red-900/30 rounded-xl md:rounded-2xl p-4 md:p-6 overflow-hidden group hover:scale-105 transition-all duration-300 ${
              animateCards ? 'animate-slide-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Glow effect */}
            <div className={`absolute -top-10 -right-10 w-24 h-24 md:w-32 md:h-32 ${stat.bgGlow} rounded-full blur-2xl md:blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className='flex flex-row gap-2 items-center'> 
                  <div className={`w-10 h-10 md:w-10 md:h-10 bg-gradient-to-br ${stat.color} rounded-lg md:rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="text-white" size={20} /> 
                  </div>    
                  
                  <h3 className="text-gray-400 text-sm md:text-lg mb-1 md:mb-2 truncate">{stat.label}</h3>
                  
                </div>
              </div>
              
             
              <p className="text-xl md:text-2xl lg:text-4xl text-left font-bold text-white mb-1 mt-6 md:mt-8 truncate">{stat.value}</p>
              <p className="text-xs md:text-sm text-left text-gray-500 truncate">{stat.changeLabel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Movies Currently Showing */}
      <div className="bg-gradient-to-br from-gray-500/20 to-black/95 backdrop-blur-md border border-red-900/30 rounded-xl md:rounded-2xl p-4 md:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2">
          <h2 className="text-xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3 truncate">
            <Play size={18} className="md:size-[24px] flex-shrink-0" />
            Movies Currently Showing
          </h2>
          <span className="text-xs md:text-sm text-gray-400 bg-red-900/20 px-3 py-1 md:px-4 md:py-2 rounded-lg border border-red-900/30 truncate">
            {currentMovies.length} Active Movies
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <div className="max-h-[403px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 border-r border-l border-red-900/30 bg-black z-10">
                  <tr className="border-b border-red-900/30">
                    <th className="text-center py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-400 min-w-[50px]">#</th>
                    <th className="text-left py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-400 min-w-[200px] max-w-[250px]">Movie Title</th>
                    <th className="text-center py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-400 min-w-[120px] max-w-[150px]">Genre</th>
                    <th className="text-center py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-400 min-w-[100px]">Showings</th>
                    <th className="text-center py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-400 min-w-[100px]">Bookings</th>
                    <th className="text-right py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-400 min-w-[120px]">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMovies.map((movie, index) => (
                    <tr
                      key={movie.id}
                      className={`border-b border-red-900/20 hover:bg-red-900/10 transition-all duration-200 ${
                        animateCards ? 'animate-fade-in' : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${400 + index * 80}ms` }}
                    >
                      <td className="py-3 md:py-4 px-3 md:px-4">
                        <span className="text-gray-500 font-medium text-sm md:text-base">{index + 1}</span>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="font-semibold text-white text-sm truncate max-w-[300px]" title={movie.title}>
                            {movie.title}
                          </span>   
                        </div>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4">
                        <span className="text-gray-400 text-xs md:text-sm text-left truncate max-w-[200px] block mx-auto" title={movie.genre}>
                          {movie.genre}
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <span className="bg-purple-900/30 text-purple-300 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium border border-purple-900/50 truncate inline-block max-w-[100px]">
                          {movie.showings} shows
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <span className="text-white font-semibold text-sm md:text-base truncate max-w-[80px] inline-block" title={movie.bookings}>
                          {movie.bookings}
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-right">
                        <span className="text-green-400 font-bold text-sm md:text-base truncate max-w-[120px] inline-block" title={movie.revenue}>
                          {movie.revenue}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tablet Table */}
        <div className="hidden md:block lg:hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full min-w-[600px]">
                <thead className="sticky top-0 bg-gradient-to-br from-gray-500/20 to-black/95 z-10">
                  <tr className="border-b border-red-900/30">
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-400 min-w-[180px]">Movie Title</th>
                    <th className="text-center py-3 px-3 text-sm font-semibold text-gray-400 min-w-[100px] max-w-[120px]">Genre</th>
                    <th className="text-center py-3 px-3 text-sm font-semibold text-gray-400 min-w-[80px]">Showings</th>
                    <th className="text-center py-3 px-3 text-sm font-semibold text-gray-400 min-w-[80px]">Bookings</th>
                    <th className="text-right py-3 px-3 text-sm font-semibold text-gray-400 min-w-[100px]">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMovies.map((movie, index) => (
                    <tr
                      key={movie.id}
                      className={`border-b border-red-900/20 hover:bg-red-900/10 transition-all duration-200 ${
                        animateCards ? 'animate-fade-in' : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${400 + index * 80}ms` }}
                    >
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-left  truncate max-w-[200px]" title={movie.title}>
                            {movie.title}
                          </span>
                          <span className="text-gray-500 text-xs mt-1 truncate max-w-[180px]">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-gray-400 text-sm truncate max-w-[100px] block mx-auto" title={movie.genre}>
                          {movie.genre}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full text-sm font-medium border border-purple-900/50 truncate inline-block max-w-[60px]">
                          {movie.showings}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-white font-semibold truncate max-w-[60px] inline-block" title={movie.bookings}>
                          {movie.bookings}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-green-400 font-bold truncate max-w-[100px] inline-block" title={movie.revenue}>
                          {movie.revenue}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Cards - Always scrollable */}
        <div className="md:hidden">
          <div className="max-h-[500px] overflow-y-auto pr-2">
            <div className="space-y-4">
              {currentMovies.map((movie, index) => (
                <div
                  key={movie.id}
                  className={`bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-sm border border-red-900/30 rounded-lg p-4 hover:bg-red-900/10 transition-all duration-200 ${
                    animateCards ? 'animate-fade-in' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${400 + index * 80}ms` }}
                >
                  <div className="flex justify-between text-left items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500 text-sm font-medium truncate">#{index + 1}</span>
                      </div>
                      <h3 className="text-white text-2xl font-bold text-center truncate" title={movie.title}>
                        {movie.title}
                      </h3>
                      <p className="text-gray-400 text-sm text-center mt-1 mb-5 truncate" title={movie.genre}>
                        {movie.genre}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1 truncate">Showings</p>
                      <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full text-xs font-medium border border-purple-900/50 truncate inline-block max-w-full">
                        {movie.showings} shows
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1 truncate">Bookings</p>
                      <span className="text-white font-semibold text-sm truncate inline-block max-w-full" title={movie.bookings}>
                        {movie.bookings}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-red-900/30">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1 truncate">Revenue</p>
                      <span className="text-green-400 font-bold text-base truncate inline-block max-w-full" title={movie.revenue}>
                        {movie.revenue}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
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
          animation: slide-up 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        /* Custom scrollbar for table */
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(220, 38, 38, 0.5);
          border-radius: 3px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(220, 38, 38, 0.7);
        }

        /* Custom scrollbar for vertical overflow */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(220, 38, 38, 0.5);
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(220, 38, 38, 0.7);
        }
      `}</style>
    </div>
  );
}