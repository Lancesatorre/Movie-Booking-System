import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../../Components/LoadingState';

const BookingMovie = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);
  const autoRotateRef = useRef(null);

  // NEW: movies from API instead of hardcoded
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Trailer modal state
  const [showTrailer, setShowTrailer] = useState(false);
  // Sample link trailer
  const sampleTrailerUrl = "https://www.youtube.com/watch?v=TcMBFSGVi1c";

  // Fetch movies from backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch('http://localhost/mobook_api/get_movies.php');
        const data = await res.json();

        if (data.success) {
          setMovies(data.movies || []);
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
    navigate('/movies-checkout', { 
      state: { 
        movie: selectedMovie
      } 
    });
  };

  // Function to convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1`;
    }
    
    return url;
  };

  const openTrailer = () => {
    setShowTrailer(true);
    // Stop auto-rotation when trailer opens
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    // Resume auto-rotation when trailer closes
    resetAutoRotate();
  };

  // Close trailer on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showTrailer) {
        closeTrailer();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showTrailer]);

  const resetAutoRotate = () => {
    if (!movies.length) return;

    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
    autoRotateRef.current = setInterval(() => {
      goToNext();
    }, 8000);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const currentX = e.clientX;
    const diff = currentX - startX;
    setDragOffset(diff);
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
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setDragOffset(diff);
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

  // Auto-rotate when movies are loaded
  useEffect(() => {
    if (!movies.length) return;

    resetAutoRotate();
    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [movies]);

  const getMoviePosition = (index) => {
    const totalMovies = movies.length;
    const relativeIndex = (index - currentIndex + totalMovies) % totalMovies;
    
    let position = 0;
    let scale = 1;
    let opacity = 1;
    let zIndex = 0;
    let blur = 0;

    switch (relativeIndex) {
      case 0:
        position = 0;
        scale = 1;
        opacity = 1;
        zIndex = 30;
        blur = 0;
        break;
      case 1:
        position = 85;
        scale = 0.8;
        opacity = 0.7;
        zIndex = 20;
        blur = 1;
        break;
      case totalMovies - 1:
        position = -85;
        scale = 0.8;
        opacity = 0.7;
        zIndex = 20;
        blur = 1;
        break;
      case 2:
        position = 170;
        scale = 0.65;
        opacity = 0.4;
        zIndex = 10;
        blur = 2;
        break;
      case totalMovies - 2:
        position = -170;
        scale = 0.65;
        opacity = 0.4;
        zIndex = 10;
        blur = 2;
        break;
      default:
        position = relativeIndex > totalMovies / 2 ? 220 : -220;
        scale = 0.5;
        opacity = 0;
        zIndex = 0;
        blur = 3;
        break;
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
      {/* Show loading overlay while fetching movies */}
      {loading && <LoadingState message="Loading movies..." />}
      
      <div className="min-h-[85vh] bg-transparent text-white pb-10 md:pb-8 pt-12 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header with fade-in animation - Only show when not loading */}
          {!loading && (
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-6xl font-bold mb-2 pb-2 bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
                Now Showing
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Swipe or drag to explore our latest movies
              </p>
            </div>
          )}

          {/* Optional status message */}
          {!loading && error && (
            <div className="text-center text-red-400 mb-8">
              {error}
            </div>
          )}

          {/* Only render carousel if we have movies and not loading */}
          {!loading && movies.length > 0 && (
            <>
              {/* Enhanced Carousel Container */}
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
                  style={{ 
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none'
                  }}
                >
                  {/* Stylized Navigation Arrows */}
                  <button
                    onClick={goToPrev}
                    disabled={isTransitioning}
                    className="absolute left-0 md:left-8 z-40 p-4 bg-gradient-to-r from-red-600/90 to-red-700/90 rounded-full hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={isTransitioning}
                    className="absolute right-0 md:right-8 z-40 p-4 bg-gradient-to-r from-red-600/90 to-red-700/90 rounded-full hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Movies with enhanced styling */}
                  {movies.map((movie, index) => {
                    const isCenter = index === currentIndex;
                    return (
                      <div
                        key={`${movie.id}-${index}`}
                        className="absolute will-change-transform"
                        style={getMoviePosition(index)}
                      >
                        <div className={`w-72 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-2xl overflow-hidden text-left border shadow-2xl transition-all duration-300 ${
                          isCenter 
                            ? 'border-red-500/50 shadow-red-500/20' 
                            : 'border-gray-700/50'
                        }`}>
                          <div className="relative h-96 overflow-hidden group">
                            <img 
                              src={movie.image} 
                              alt={movie.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              draggable="false"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
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
                            <p className="text-gray-400 text-xs mb-2 line-clamp-1">
                              {movie.genre}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Enhanced Movie Details */}
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
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-col justify-center text-left">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {movies[currentIndex].title}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-gray-400 mb-6">
                      <span className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        {movies[currentIndex].genre}
                      </span>
                      <span className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                        </svg>
                        {movies[currentIndex].duration}
                      </span>
                      <span className="flex items-center gap-2 bg-red-600/20 text-red-400 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {movies[currentIndex].rating}
                      </span>
                      <span className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {movies[currentIndex].dateRelease}
                      </span>
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
                        className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-gray-500/50 hover:scale-105 transform flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                        Watch Trailer
                      </button>

                      <button 
                      onClick={handleBookNow}
                      className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-red-700 to-orange-600/20 rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-red-500/50 hover:scale-105 transform"
                      >
                      Book Now
                    </button>
                      </div> 
                  </div>
                </div>
              </div>

              {/* Enhanced Dots Indicator */}
              <div className="flex justify-center mt-12 gap-3">
                {movies.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToIndex(index)}
                    disabled={isTransitioning}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentIndex 
                        ? 'w-12 h-3 bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/50' 
                        : 'w-3 h-3 bg-gray-600 hover:bg-gray-500 hover:scale-125'
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
            {/* Close Button */}
              <button
                onClick={closeTrailer}
                className="absolute top-6 right-6 z-10 p-3 bg-red-600/90 hover:bg-red-500 rounded-full transition-all duration-300 hover:scale-110 shadow-lg group"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="absolute -bottom-10 right-0 bg-gray-800 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Close (ESC)
                </span>
              </button>
            <div 
              className="relative w-full max-w-6xl mx-4 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-red-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              

              {/* Video Container with 16:9 aspect ratio */}
              <div className="relative pt-[56.25%] bg-black">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={getYouTubeEmbedUrl(sampleTrailerUrl)}
                  title="Movie Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Trailer Info */}
              <div className="p-5 md:p-8 bg-gradient-to-b from-red-700/45 to-black border-t border-red-500/20">
                <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
                  <div>
                    <h3 className="text-md md:text-3xl font-bold text-left text-white mb-2">
                      {movies[currentIndex].title} - Official Trailer
                    </h3>
                    <p className="text-gray-400 text-left text-xs md:text-lg">
                      Press ESC or click outside to close
                    </p>
                  </div>
                  <div className="flex gap-3 mt-15 md:w-auto w-full md:mt-0">
                    <button 
                      onClick={() => window.open(sampleTrailerUrl, '_blank')}
                      className="px-6 py-3 md:w-auto w-full bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-300 text-white font-semibold flex justify-center items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                      Watch on YouTube
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom CSS for fade-in animation */}
        <style>{`
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default BookingMovie;