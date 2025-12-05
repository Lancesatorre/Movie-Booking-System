import React, { useState, useEffect } from 'react';
import { Film, Edit2, Trash2, Search, Filter, X, Calendar, Eye, EyeOff, ChevronDown } from 'lucide-react';
import ConfirmationModal from '../../Modal/ConfimationModal';

export default function MovieManagement() {
  const [animateCards, setAnimateCards] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [publishFilter, setPublishFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  const [movies, setMovies] = useState([
    {
      id: 1,
      title: 'Altered',
      genre: 'Science Fiction, Action',
      price: 250,
      published: true,
      duration: '132 min',
      rating: 'PG-13',
      location: 'SM City Cebu',
      dateRelease: 'December 4, 2025',
      image: '/assets/Movies/altered.jpg'
    },
    {
      id: 2,
      title: 'Avengers: Endgame',
      genre: 'Adventure, Science Fiction, Action',
      price: 300,
      published: true,
      duration: '153 min',
      rating: 'R-5',
      location: 'Ayala Center Cebu',
      dateRelease: 'December 4, 2025',
      image: '/assets/Movies/avengers-endgame.jpg'
    },
    {
      id: 3,
      title: 'Frankenstein',
      genre: 'Drama, Horror, Science Fiction',
      price: 250,
      published: true,
      duration: '125 min',
      rating: 'R',
      location: 'SM Seaside City Cebu',
      dateRelease: 'December 25, 2025',
      image: '/assets/Movies/frankenstein.jpg'
    },
    {
      id: 4,
      title: 'In Your Dreams',
      genre: 'Comedy, Adventure, Animation, Fantasy, Family',
      price: 200,
      published: false,
      duration: '81 min',
      rating: 'PG-13',
      location: 'Robinson Cybergate Cebu',
      dateRelease: 'December 22, 2025',
      image: '/assets/Movies/in-your-dreams.jpg'
    },
    {
      id: 5,
      title: 'Wicked: For Good',
      genre: 'Romance, Fantasy, Adventure',
      price: 320,
      published: false,
      duration: '137 min',
      rating: 'PG-13',
      location: 'SM City Cebu',
      dateRelease: 'December 10, 2025',
      image: '/assets/Movies/wicked-for-good.jpg'
    },
  ]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseDate = (dateString) => {
    return new Date(dateString);
  };

  const isToday = (dateString) => {
    const today = new Date();
    const compareDate = parseDate(dateString);
    return today.toDateString() === compareDate.toDateString();
  };

  const isFutureDate = (dateString) => {
    const today = new Date();
    const compareDate = parseDate(dateString);
    today.setHours(0, 0, 0, 0);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
  };

  const getMovieStatus = (movie) => {
    if (!movie.published) return 'not-published';
    if (isToday(movie.dateRelease)) return 'now-showing';
    if (isFutureDate(movie.dateRelease)) return 'coming-soon';
    return 'expired';
  };

  const [formData, setFormData] = useState({
    genre: '',
    price: '',
    published: false,
    duration: '',
    rating: 'PG',
    dateRelease: ''
  });

  const ratings = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
  const statuses = [
    { value: 'now-showing', label: 'Now Showing', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', glow: 'shadow-emerald-500/30' },
    { value: 'coming-soon', label: 'Coming Soon', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', glow: 'shadow-blue-500/30' },
    { value: 'expired', label: 'Expired', color: 'bg-gray-600/20 text-gray-400 border-gray-600/40', glow: 'shadow-gray-600/30' },
    { value: 'not-published', label: 'Not Published', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40', glow: 'shadow-orange-500/30' }
  ];

  const openModal = (movie) => {
    if (movie.published) return;
    
    setSelectedMovie(movie);
    const movieData = {
      genre: movie.genre,
      price: movie.price,
      published: movie.published,
      duration: movie.duration,
      rating: movie.rating,
      dateRelease: movie.dateRelease
    };
    setFormData(movieData);
    setOriginalData(movieData);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
    setOriginalData(null);
    setIsSaving(false);
  };

  const handleSubmit = async () => {
    if (!formData.genre || !formData.price || !formData.duration || !formData.dateRelease) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMovies(movies.map(m => m.id === selectedMovie.id ? { 
      ...m, 
      genre: formData.genre,
      price: formData.price,
      published: formData.published,
      duration: formData.duration,
      rating: formData.rating,
      dateRelease: formData.dateRelease
    } : m));
    
    setIsSaving(false);
    closeModal();
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleDeleteClick = (movie) => {
    if (movie.published) return;
    
    setMovieToDelete(movie);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (movieToDelete) {
      setMovies(movies.filter(m => m.id !== movieToDelete.id));
    }
    setShowDeleteModal(false);
    setMovieToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMovieToDelete(null);
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movie.genre.toLowerCase().includes(searchQuery.toLowerCase());
    
    const movieStatus = getMovieStatus(movie);
    const matchesFilter = filterStatus === 'all' || movieStatus === filterStatus;
    
    const matchesPublish = publishFilter === 'all' || 
                          (publishFilter === 'published' && movie.published) ||
                          (publishFilter === 'not-published' && !movie.published);
    
    return matchesSearch && matchesFilter && matchesPublish;
  });

  const getStatusBadge = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj : statuses[0];
  };

  const stats = [
    { label: 'Total Movies', value: movies.length, color: 'from-red-600 via-red-500 to-pink-600', icon: Film, glow: 'shadow-red-500/50' },
    { label: 'Published', value: movies.filter(m => m.published).length, color: 'from-emerald-600 via-green-500 to-teal-600', icon: Eye, glow: 'shadow-emerald-500/50' },
    { label: 'Not Published', value: movies.filter(m => !m.published).length, color: 'from-orange-600 via-amber-500 to-yellow-600', icon: EyeOff, glow: 'shadow-orange-500/50' },
    { label: 'Now Showing', value: movies.filter(m => m.published && isToday(m.dateRelease)).length, color: 'from-blue-600 via-cyan-500 to-sky-600', icon: Film, glow: 'shadow-blue-500/50' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mb-8 md:mb-12 pt-15 animate-slide-down">
        <div className="flex items-center gap-4 mb-3">
          <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-orange-600/20">
            Movies
          </h1>
        </div>
        <p className="text-left md:text-lg text-gray-400">
          Manage your cinema's movie catalog, pricing, and availability
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
       {stats.map((stat, index) => {
    const Icon = stat.icon;
    return (
      <div
        key={stat.label}
        className={`relative bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border border-red-900/30 rounded-lg min-[480px]:rounded-xl md:rounded-2xl p-3 min-[480px]:p-4 md:p-5 lg:p-6 overflow-hidden group hover:scale-105 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg md:hover:shadow-2xl ${stat.glow} ${
          animateCards ? 'animate-slide-up' : 'opacity-0'
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
        <div className="absolute -top-5 -right-5 min-[480px]:-top-6 min-[480px]:-right-6 md:-top-8 md:-right-8 lg:-top-12 lg:-right-12 w-16 h-16 min-[480px]:w-20 min-[480px]:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32  rounded-full blur-xl min-[480px]:blur-2xl md:blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2 min-[480px]:mb-3 md:mb-4">
            <div className='flex flex-row items-center gap-1.5 min-[480px]:gap-2 md:gap-2.5 lg:gap-3 flex-1 min-w-0'>
              <Icon className="text-gray-500 group-hover:text-red-400 transition-colors duration-300 flex-shrink-0 w-4 h-4 min-[480px]:w-4 min-[480px]:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" 
                size={16}
              />
              <p className="text-gray-400 text-xs min-[480px]:text-sm md:text-base lg:text-lg font-medium truncate">
                {stat.label}
              </p>
            </div>
            <div className={`w-1.5 h-1.5 min-[480px]:w-2 min-[480px]:h-10 rounded-full bg-gradient-to-r ${stat.color} animate-pulse flex-shrink-0 ml-2`}></div>
          </div>
          <p className="text-xl text-left min-[480px]:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 group-hover:from-red-400 group-hover:to-pink-400 transition-all duration-300 leading-tight">
            {stat.value}
          </p>
        </div>
      </div>
    );
        })}
      </div>

      <div className="bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border border-red-900/30 rounded-2xl p-5 mb-8 shadow-2xl hover:border-red-500/30 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-red-400 transition-colors duration-300" size={20} />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
            />
          </div>
          
          <div className="flex gap-3 flex-wrap md:flex-nowrap">
            <div className="relative flex-1 md:flex-initial md:w-auto group">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none" size={20} />
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className=" w-full md:w-auto bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl pl-12 pr-12 py-3 text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer hover:bg-black/80"
              >
                <option value="all">All Status</option>
                <option value="now-showing">Now Showing</option>
                <option value="coming-soon">Coming Soon</option>
                <option value="expired">Expired</option>
                <option value="not-published">Not Published</option>
              </select>
            </div>

            <button
              onClick={() => setPublishFilter('published')}
              className={`cursor-pointer px-5 py-3 rounded-xl font-bold transition-all duration-300 border-2 hover:scale-105 hover:shadow-xl ${
                publishFilter === 'published'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-500/50 shadow-lg shadow-emerald-500/50'
                  : 'bg-black/60 text-gray-300 border-gray-800/50 hover:border-emerald-500/50'
              }`}
            >
              Published
            </button>
            
            <button
              onClick={() => setPublishFilter('not-published')}
              className={`cursor-pointer  px-5 py-3 rounded-xl font-bold transition-all duration-300 border-2 hover:scale-105 hover:shadow-xl ${
                publishFilter === 'not-published'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-500/50 shadow-lg shadow-orange-500/50'
                  : 'bg-black/60 text-gray-300 border-gray-800/50 hover:border-orange-500/50'
              }`}
            >
              Not Published
            </button>

            {publishFilter !== 'all' && (
              <button
                onClick={() => setPublishFilter('all')}
                className="cursor-pointer px-5 py-3 rounded-xl font-bold transition-all duration-300 border-2 bg-gradient-to-r from-red-600 to-pink-600 text-white border-red-500/50 hover:scale-105 hover:shadow-xl shadow-lg shadow-red-500/50 animate-scale-in"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {filteredMovies.map((movie, index) => {
          const movieStatus = getMovieStatus(movie);
          const isPublished = movie.published;
          const statusBadge = getStatusBadge(movieStatus);
          
          return (
            <div
              key={movie.id}
              className={`group bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border-2 border-red-900/30 rounded-3xl overflow-hidden hover:border-red-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20 ${
                animateCards ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${400 + index * 80}ms` }}
            >
              <div className="relative h-96 overflow-hidden">
                <img 
                  src={movie.image} 
                  alt={movie.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-pink-500/0 group-hover:from-red-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
                
                {!isPublished && (
                  <div className="absolute top-4 right-4 flex gap-2 animate-slide-left">
                    <button
                      onClick={() => openModal(movie)}
                      className="cursor-pointer p-3 rounded-xl transition-all duration-300 hover:scale-110 backdrop-blur-md border-2 bg-gradient-to-br from-blue-600/90 to-cyan-600/90 hover:from-blue-500 hover:to-cyan-500 border-blue-500/50 shadow-lg shadow-blue-500/50"
                      title="Edit Movie"
                    >
                      <Edit2 size={18} className="text-white" />
                    </button>
                  </div>
                )}
                
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold border-2 backdrop-blur-md ${statusBadge.color} ${statusBadge.glow} shadow-lg animate-pulse-slow`}>
                    {statusBadge.label}
                  </span>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-3xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-pink-400 transition-all duration-300 drop-shadow-lg">
                    {movie.title}
                  </h3>
                  <p className="text-gray-300 text-sm font-medium">{movie.genre}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-gray-800/50 hover:border-green-500/30 transition-colors duration-300">
                  <span className="text-gray-400 text-sm font-semibold">Price</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">₱{movie.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-black/40 rounded-xl border border-gray-800/50 hover:border-purple-500/30 transition-colors duration-300">
                    <span className="text-gray-400 text-xs font-semibold block mb-1">Duration</span>
                    <span className="text-white text-sm font-bold">{movie.duration}</span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-gray-800/50 hover:border-purple-500/30 transition-colors duration-300">
                    <span className="text-gray-400 text-xs font-semibold block mb-1">Rating</span>
                    <span className="inline-block border border-red-900/50 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md shadow-red-500/30">
                      {movie.rating}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-gray-800/50 hover:border-blue-500/30 transition-colors duration-300">
                  <span className="text-gray-400 text-xs font-semibold block mb-1">Location</span>
                  <span className="text-white text-sm font-medium">{movie.location}</span>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-gray-800/50 hover:border-red-500/30 transition-colors duration-300">
                  <span className="text-gray-400 text-xs font-semibold block mb-1">Release Date</span>
                  <span className="text-white text-sm font-bold">{movie.dateRelease}</span>
                </div>
                
                {isPublished && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-800/50">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 italic">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"></div>
                      <span>Published - No editing allowed</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMovies.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-block p-6 bg-gradient-to-br from-gray-900/90 to-black/90 rounded-3xl border-2 border-gray-800/50 mb-6">
            <Film size={80} className="text-gray-700 mx-auto" />
          </div>
          <p className="text-gray-400 text-2xl font-bold">No movies found</p>
          <p className="text-gray-600 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <div className="bg-gradient-to-br from-gray-500/20 to-black/20 backdrop-blur-md border border-red-900/30 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-red-500/20 animate-scale-in">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg shadow-blue-500/50">
                  <Edit2 className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Edit Movie
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">{selectedMovie?.title}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="cursor-pointer  p-3 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110 border-2 border-transparent hover:border-red-500/50"
              >
                <X className="text-gray-400 hover:text-white transition-colors" size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="e.g., Action, Drama"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="350"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 hover:bg-black/80"
                    placeholder="120 min"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3">Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 hover:bg-black/80 cursor-pointer"
                  >
                    {ratings.map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">Status</label>
                <select
                  value={formData.published ? 'published' : 'not-published'}
                  onChange={(e) => setFormData({ ...formData, published: e.target.value === 'published' })}
                  className="w-full bg-black/60 border-2 border-gray-800/50 focus:border-red-500/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 hover:bg-black/80 cursor-pointer"
                >
                  <option value="published">Published</option>
                  <option value="not-published">Not Published</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={closeModal}
                  disabled={isSaving}
                  className="cursor-pointer flex-1 bg-gray-800/50 hover:bg-gray-700/70 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 border-2 border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!hasChanges() || isSaving}
                  className="cursor-pointer flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-red-500/50"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Movie"
        message={`Are you sure you want to delete "${movieToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

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

        @keyframes slide-left {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-left {
          animation: slide-left 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(220, 38, 38, 0.6), rgba(219, 39, 119, 0.6));
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(220, 38, 38, 0.8), rgba(219, 39, 119, 0.8));
        }
      `}</style>
    </div>
  );
}