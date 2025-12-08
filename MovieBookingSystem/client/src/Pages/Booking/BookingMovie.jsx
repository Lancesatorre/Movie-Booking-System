import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../../Components/LoadingState';
import { ArrowLeft } from 'lucide-react';

const BookingMovie = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);
  const autoRotateRef = useRef(null);

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const currentTrailerUrl = movies[currentIndex]?.trailer;

  // Status labels configuration matching the MyTickets design
  const statusConfig = {
    nowShowing: {
      label: 'Now Showing',
      color: 'bg-emerald-500/50 text-emerald-300 border-emerald-500/40',
      glow: 'shadow-emerald-500/6px-4 py-2 rounded-xl text-sm font-bold border-2 backdrop-blur-md bg-emerald-500/50 text-emerald-300 border-emerald-500/40 shadow-emerald-500/60 shadow-lg animate-pulse-slow0',
      text: 'Now Showing'
    },
    comingSoon: {
      label: 'Coming Soon',
      color: 'bg-red-500/50 text-red-500 border-red-500/40',
     glow: 'shadow-red-500/6px-4 py-2 rounded-xl text-sm font-bold border-2 backdrop-blur-md bg-red-500/50 text-red-300 border-red-500/40 shadow-red-500/60 shadow-lg animate-pulse-slow0',
      text: 'Coming Soon'
    }
  };

  // -------------------------
  // Helpers to adapt DB shape
  // -------------------------
  const normalizeGenres = (movie) => {
    if (Array.isArray(movie.genres)) {
      return movie.genres
        .map(g => (typeof g === "string" ? g : g?.name || g?.GenreName || ""))
        .filter(Boolean)
        .join(", ");
    }
    if (typeof movie.genre === "string") return movie.genre;
    return "";
  };

  const normalizeDuration = (movie) => {
    if (movie.durationMinutes != null && movie.durationMinutes !== "") {
      const n = Number(movie.durationMinutes);
      return Number.isFinite(n) ? `${n} min` : String(movie.durationMinutes);
    }
    if (typeof movie.duration === "string") {
      return movie.duration.replace("m", " min");
    }
    return "";
  };

  const normalizePrice = (movie) => {
    if (movie.basePrice != null) return Number(movie.basePrice);
    if (movie.price != null) return Number(movie.price);
    return 0;
  };

  const getMovieStatus = (movie) => {
    const raw = movie.releaseDateRaw || movie.releaseDate || "";
    if (!raw) return 'nowShowing';

    const today = new Date();
    today.setHours(0,0,0,0);

    const showDate = new Date(raw + "T00:00:00");
    showDate.setHours(0,0,0,0);

    return showDate > today ? 'comingSoon' : 'nowShowing';
  };

  // Fetch movies from backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch('http://localhost/mobook_api/get_movies.php');
        const data = await res.json();

        if (data.success) {
          const rawMovies = data.movies || [];

          const normalized = rawMovies.map(m => ({
            ...m,
            genre: normalizeGenres(m),
            duration: normalizeDuration(m),
            price: normalizePrice(m),
            status: getMovieStatus(m) // Add status to each movie
          }));

          // ✅ only show published movies
          const visibleMovies = normalized.filter(m => Number(m.published) === 1);

          setMovies(visibleMovies);
          setCurrentIndex(0);
        } else {
          setError('Failed to load movies.');
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Unable to connect to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleBookNow = () => {
    if (!movies.length) return;
    const selectedMovie = movies[currentIndex];
    if (Number(selectedMovie.published) !== 1) return;
    navigate('/movies-checkout', { 
      state: { movie: selectedMovie } 
    });
  };

  const handleBackToHome = () => navigate('/Home');

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoIdMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1`;
    }
    return url;
  };

  const openTrailer = () => {
    setShowTrailer(true);
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    resetAutoRotate();
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showTrailer) closeTrailer();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showTrailer]);

  const resetAutoRotate = () => {
    if (!movies.length) return;
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    autoRotateRef.current = setInterval(goToNext, 8000);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setDragOffset(e.clientX - startX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragOffset) > 50) {
      setIsTransitioning(true);
      if (dragOffset > 0) {
        setCurrentIndex(prev => (prev - 1 + movies.length) % movies.length);
      } else {
        setCurrentIndex(prev => (prev + 1) % movies.length);
      }
      setTimeout(() => setIsTransitioning(false), 500);
    }

    setDragOffset(0);
    resetAutoRotate();
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setDragOffset(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = handleMouseUp;

  const goToNext = () => {
    if (isTransitioning || !movies.length) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev + 1) % movies.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrev = () => {
    if (isTransitioning || !movies.length) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev - 1 + movies.length) % movies.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToIndex = (index) => {
    if (isTransitioning || index === currentIndex || !movies.length) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
    resetAutoRotate();
  };

  useEffect(() => {
    if (!movies.length) return;
    resetAutoRotate();
    return () => autoRotateRef.current && clearInterval(autoRotateRef.current);
  }, [movies]);

  const getMoviePosition = (index) => {
    const totalMovies = movies.length;
    const relativeIndex = (index - currentIndex + totalMovies) % totalMovies;

    let position = 0, scale = 1, opacity = 1, zIndex = 0, blur = 0;

    switch (relativeIndex) {
      case 0: position = 0; scale = 1; opacity = 1; zIndex = 30; blur = 0; break;
      case 1: position = 85; scale = 0.8; opacity = 0.7; zIndex = 20; blur = 1; break;
      case totalMovies - 1: position = -85; scale = 0.8; opacity = 0.7; zIndex = 20; blur = 1; break;
      case 2: position = 170; scale = 0.65; opacity = 0.4; zIndex = 10; blur = 2; break;
      case totalMovies - 2: position = -170; scale = 0.65; opacity = 0.4; zIndex = 10; blur = 2; break;
      default:
        position = relativeIndex > totalMovies / 2 ? 220 : -220;
        scale = 0.5;
        opacity = 0;
        zIndex = 0;
        blur = 3;
    }

    const dragPercentage = (dragOffset / window.innerWidth) * 120;
    const finalPosition = position + dragPercentage;

    return {
      transform: `translateX(${finalPosition}%) scale(${scale})`,
      opacity,
      zIndex,
      filter: `blur(${blur}px)`,
      transition: isDragging
        ? 'opacity 0.2s ease-out, filter 0.2s ease-out'
        : 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    };
  };

  return (
    <>
      {loading && <LoadingState message="Loading movies..." />}

      <div className="min-h-[85vh] bg-transparent text-white pb-10 md:pb-8 pt-15 overflow-hidden">
        <button
          onClick={handleBackToHome}
          className="cursor-pointer fixed top-6 left-3 md:left-6 z-50 flex items-center gap-2 px-2 py-1 md:px-4 md:py-2.5 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-xl border border-gray-700 hover:border-red-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium text-xs md:text-md">Back to Home</span>
        </button>

        <div className="container mx-auto px-4 max-w-7xl">
          {!loading && (
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-6xl md:text-7xl font-bold mb-2 pb-2 bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
                Movies
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Swipe or drag to explore our latest movies
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center text-red-400 mb-8">{error}</div>
          )}

          {!loading && movies.length > 0 && (
            <>
              <div className="relative h-[450px] mb-16 perspective-1000">
                <div
                  ref={carouselRef}
                  className="relative w-full h-full flex items-center justify-center"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
                >
                  <button
                    onClick={goToPrev}
                    disabled={isTransitioning}
                    className="cursor-pointer absolute left-0 md:left-8 z-40 p-4 bg-gradient-to-r from-red-600/90 to-red-700/90 rounded-full hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={isTransitioning}
                    className="cursor-pointer absolute right-0 md:right-8 z-40 p-4 bg-gradient-to-r from-red-600/90 to-red-700/90 rounded-full hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {movies.map((movie, index) => {
                    const isCenter = index === currentIndex;
                    const status = movie.status;
                    const statusInfo = statusConfig[status];

                    return (
                      <div key={`${movie.id}-${index}`} className="absolute will-change-transform" style={getMoviePosition(index)}>
                        <div className={`w-72 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-2xl overflow-hidden text-left border shadow-2xl transition-all duration-300 ${
                          isCenter ? 'border-red-500/50 shadow-red-500/20' : 'border-gray-700/50'
                        }`}>
                          <div className="relative h-96 overflow-hidden group">
                            <img
                              src={movie.image}
                              alt={movie.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              draggable="false"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>

                            {/* Status Badge - Matching MyTickets design */}
                            <div className="absolute top-4 left-4">
                              <span className={`px-4 py-2 rounded-xl text-xs font-bold border-2 backdrop-blur-md ${statusInfo.color} ${statusInfo.glow} shadow-lg animate-pulse-slow`}>
                                {statusInfo.text}
                              </span>
                            </div>

                            <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                              {movie.rating}
                            </div>
                          </div>

                          <div className="p-5">
                            <h3 className="text-xl font-bold mb-2 truncate">{movie.title}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                                </svg>
                                {movie.duration}
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs mb-2 line-clamp-1">{movie.genre}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details */}
              <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <div className="relative group">
                      <img
                        src={movies[currentIndex].image}
                        alt={movies[currentIndex].title}
                        className="w-full h-[400px] object-cover rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Status Badge for Main Image */}
                      <div className="absolute top-90 left-4">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 backdrop-blur-md ${
                          statusConfig[movies[currentIndex].status].color
                        } ${statusConfig[movies[currentIndex].status].glow} shadow-lg animate-pulse-slow`}>
                          {statusConfig[movies[currentIndex].status].text}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex flex-col justify-center text-left">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {movies[currentIndex].title}
                    </h2>

                    <div className="flex flex-wrap gap-4 text-gray-400 mb-6">
                      <span className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full">{movies[currentIndex].genre}</span>
                      <span className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full">{movies[currentIndex].duration}</span>
                      <span className="flex items-center gap-2 bg-red-600/20 text-red-400 px-3 py-1 rounded-full">{movies[currentIndex].rating}</span>
                      <span className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">{movies[currentIndex].dateRelease}</span>
                      <span className="flex items-center gap-2 bg-green-600/20 text-green-400 px-3 py-1 rounded-full">
                        ₱ {movies[currentIndex].price}.00
                      </span>
                    </div>

                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                      {movies[currentIndex].description}
                    </p>

                    <div className='flex flex-col md:flex-row w-full gap-5'>
                      <button
                        onClick={openTrailer}
                        disabled={!currentTrailerUrl}
                        className={`w-full md:w-auto px-10 py-4 rounded-xl transition-all duration-300 font-bold text-lg shadow-lg transform flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 ${
                          !currentTrailerUrl
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:from-gray-600 hover:to-gray-700 hover:shadow-gray-500/50 hover:scale-105"
                        }`}
                      >
                        Watch Trailer
                      </button>

                      <button
                        onClick={handleBookNow}
                        className={`w-full md:w-auto px-10 py-4 rounded-xl transition-all duration-300 font-bold text-lg shadow-lg transform cursor-pointer bg-gradient-to-r from-red-700 to-orange-600/20 hover:from-red-500 hover:to-red-600 hover:shadow-red-500/50 hover:scale-105"
                        }`}
                      >
                      Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div className="flex justify-center mt-12 gap-3">
                {movies.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToIndex(index)}
                    disabled={isTransitioning}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      index === currentIndex
                        ? 'w-12 h-3 bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/50'
                        : 'w-3 h-3 bg-black border border-red-800 hover:bg-gray-500 hover:scale-125'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {!loading && !error && movies.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              No movies available at the moment.
            </div>
          )}
        </div>

        {/* Trailer Modal */}
        {showTrailer && movies.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
            onClick={closeTrailer}
          >
            <button
              onClick={closeTrailer}
              className="absolute top-6 right-6 z-10 p-3 bg-red-600/90 hover:bg-red-500 rounded-full transition-all duration-300 hover:scale-110 shadow-lg group"
            >
              ✕
            </button>

            <div
              className="relative w-full max-w-6xl mx-4 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-red-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative pt-[56.25%] bg-black">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={getYouTubeEmbedUrl(currentTrailerUrl)}
                  title="Movie Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulse-slow {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
          .animate-fade-in { animation: fade-in 0.3s ease-out; }
          .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        `}</style>
      </div>
    </>
  );
};

export default BookingMovie;