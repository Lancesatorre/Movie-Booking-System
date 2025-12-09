import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, CreditCard, ArrowLeft, Home, Film, Users, Check, Ticket as TicketIcon, Download } from 'lucide-react';
import icon from "/assets/logo.png";

const Ticket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [showTicket, setShowTicket] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Get booking data from navigation state
  const bookingData = location.state?.bookingData || {
    movie: {
      title: "Altered",
      image: "/assets/Movies/altered.jpg",
      duration: "132m",
      rating: "R-5",
      genre: "Science Fiction, Action",
    },
    booking: {
      bookingId: "MBK2024001",
      mall: "SM City Cebu",
      screen: "Cinema 1",
      date: "Dec 15",
      time: "7:30 PM",
      seats: ["A5", "A6"],
      totalAmount: 500,
      paymentMethod: "GCash",
    }
  };

  const { movie, booking } = bookingData;

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    navigate(-1); 
  };

  // Download ticket function
  const handleDownloadTicket = () => {
    setDownloading(true);
    
    try {
      // Create clean HTML ticket with only details
      const ticketHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>MoBook Ticket - ${booking.bookingId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              background: #0a0a0a;
              color: #ffffff;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
            }
            
            .ticket-container {
              width: 100%;
              max-width: 700px;
              background: rgba(0, 0, 0, 0.7);
              border-radius: 24px;
              overflow: hidden;
              border: 1px solid rgba(220, 38, 38, 0.3);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            
            .ticket-header {
              background: linear-gradient(to left, rgba(220, 38, 38, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%);
              padding: 24px;
              position: relative;
              overflow: hidden;
              border-bottom: 1px solid rgba(220, 38, 38, 0.9);
            }
            
            .ticket-header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.1) 10px,
                rgba(255, 255, 255, 0.1) 20px
              );
              opacity: 0.2;
            }
            
            .header-content {
              position: relative;
              z-index: 1;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .logo-section {
              display: flex;
              gap: 12px;
              align-items: center;
            }
            
            .cinema-name {
              font-size: 36px;
              font-weight: 800;
              background: linear-gradient(to right, #dc2626 0%, rgba(234, 88, 12, 0.2) 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            
            .booking-id {
              text-align: right;
            }
            
            .booking-id div:first-child {
              font-size: 14px;
              color: #ffffff;
              margin-bottom: 4px;
              opacity: 0.9;
            }
            
            .booking-id .id-number {
              font-size: 24px;
              font-weight: 700;
              color: #ffffff;
              opacity: 1;
            }
            
            .ticket-body {
              padding: 32px;
            }
            
            .movie-title-section {
              text-align: center;
              margin-bottom: 32px;
              padding-bottom: 24px;
              border-bottom: 1px solid rgba(150, 0, 0, 1);
            }
            
            .movie-title {
              font-size: 40px;
              font-weight: 800;
              color: #ffffff;
              margin-bottom: 12px;
              line-height: 1.2;
            }
            
            .movie-tags {
              display: flex;
              justify-content: center;
              gap: 12px;
              margin-bottom: 16px;
            }
            
            .tag {
              padding: 8px 20px;
              border-radius: 9999px;
              font-size: 14px;
              font-weight: 600;
            }
            
            .tag-rating {
              background: rgba(220, 38, 38, 0.2);
              border: 1px solid rgba(220, 38, 38, 0.3);
              color: #f87171;
            }
            
            .tag-duration {
              background: rgba(75, 85, 99, 0.5);
              border: 1px solid rgba(75, 85, 99, 0.7);
              color: #d1d5db;
            }
            
            .movie-genre {
              font-size: 16px;
              color: #9ca3af;
            }
            
            .details-section {
              margin-bottom: 32px;
            }
            
            .details-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            
            .detail-card {
              background: rgba(55, 65, 81, 0.5);
              border: 1px solid rgba(75, 85, 99, 0.5);
              border-radius: 12px;
              padding: 20px;
              text-align: left;
              transition: transform 0.2s ease;
            }
            
            .detail-card:hover {
              transform: translateY(-2px);
              border-color: rgba(220, 38, 38, 0.5);
            }
            
            .detail-header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 12px;
            }
            
            .detail-header span {
              font-size: 14px;
              color: #9ca3af;
            }
            
            .detail-content {
              font-weight: 600;
              font-size: 20px;
              color: #ffffff;
              line-height: 1.3;
            }
            
            .detail-subtext {
              font-size: 14px;
              color: #9ca3af;
              margin-top: 4px;
            }
            
            .payment-section {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 24px;
              padding: 24px;
              background: rgba(30, 41, 59, 0.3);
              border-radius: 12px;
              border: 1px solid rgba(75, 85, 99, 0.5);
            }
            
            .payment-info {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            
            .payment-icon {
              width: 48px;
              height: 48px;
              border-radius: 10px;
              background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
            }
            
            .payment-details h3 {
              font-size: 14px;
              color: #9ca3af;
              margin-bottom: 4px;
            }
            
            .payment-details p {
              font-size: 20px;
              font-weight: 600;
              color: #ffffff;
            }
            
            .total-amount {
              text-align: right;
            }
            
            .total-amount h3 {
              font-size: 14px;
              color: #9ca3af;
              margin-bottom: 4px;
            }
            
            .total-amount p {
              font-size: 36px;
              font-weight: 800;
              color: #ef4444;
            }
            
            .ticket-footer {
              background: rgba(17, 24, 39, 0.5);
              padding: 20px 32px;
              border-top: 1px solid rgba(75, 85, 99, 0.5);
              text-align: center;
              font-size: 14px;
              color: #6b7280;
              line-height: 1.5;
            }
            
            @media (max-width: 640px) {
              .details-grid {
                grid-template-columns: 1fr;
              }
              
              .movie-title {
                font-size: 32px;
              }
              
              .total-amount p {
                font-size: 28px;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <!-- Header -->
            <div class="ticket-header">
              <div class="header-content">
                <div class="logo-section">
                  <h1 class="cinema-name">MoBook</h1>
                </div>
                <div class="booking-id">
                  <div>Booking ID</div>
                  <div class="id-number">${booking.bookingId}</div>
                </div>
              </div>
            </div>
            
            <!-- Body -->
            <div class="ticket-body">
              <!-- Movie Title Section -->
              <div class="movie-title-section">
                <h2 class="movie-title">${movie.title}</h2>
                <div class="movie-tags">
                  <div class="tag tag-rating">${movie.rating}</div>
                  <div class="tag tag-duration">${movie.duration}</div>
                </div>
                <div class="movie-genre">${movie.genre}</div>
              </div>
              
              <!-- Details Grid -->
              <div class="details-section">
                <div class="details-grid">
                  <div class="detail-card">
                    <div class="detail-header">
                      <span>📍 Location</span>
                    </div>
                    <div class="detail-content">${booking.mall}</div>
                    <div class="detail-subtext">${booking.screen}</div>
                  </div>
                  
                  <div class="detail-card">
                    <div class="detail-header">
                      <span>📅 Date</span>
                    </div>
                    <div class="detail-content">${booking.date}</div>
                  </div>
                  
                  <div class="detail-card">
                    <div class="detail-header">
                      <span>⏰ Show Time</span>
                    </div>
                    <div class="detail-content">${booking.time}</div>
                  </div>
                  
                  <div class="detail-card">
                    <div class="detail-header">
                      <span>🎟️ Seats</span>
                    </div>
                    <div class="detail-content">${booking.seats.join(', ')}</div>
                    <div class="detail-subtext">${booking.seats.length} ticket${booking.seats.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
              
              <!-- Payment Info -->
              <div class="payment-section">
                <div class="payment-info">
                  <div class="payment-icon">💳</div>
                  <div class="payment-details">
                    <h3>Payment Method</h3>
                    <p>${booking.paymentMethod.toUpperCase()}</p>
                  </div>
                </div>
                
                <div class="total-amount">
                  <h3>Total Amount</h3>
                  <p>₱${booking.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="ticket-footer">
              Please arrive 15 minutes before showtime • Present this ticket at the cinema entrance
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Create blob and download
      const blob = new Blob([ticketHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `MoBook-Ticket-${booking.bookingId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.error('Error downloading ticket:', error);
      
      // Fallback: Create a clean text version
      const simpleTicket = `
══════════════════════════════════════════════════════
                MoBook Cinema - E-Ticket              
══════════════════════════════════════════════════════

Booking ID: ${booking.bookingId}

──────────────────────────────────────────────────────

🎬 MOVIE: ${movie.title}
   Rating: ${movie.rating} | Duration: ${movie.duration}
   Genre: ${movie.genre}

──────────────────────────────────────────────────────

📍 LOCATION: ${booking.mall}
   Screen: ${booking.screen}

📅 DATE: ${booking.date}
⏰ TIME: ${booking.time}
🎟️ SEATS: ${booking.seats.join(', ')}

──────────────────────────────────────────────────────

💳 PAYMENT: ${booking.paymentMethod.toUpperCase()}
💰 TOTAL: ₱${booking.totalAmount.toLocaleString()}

──────────────────────────────────────────────────────

⚠️ IMPORTANT:
• Please arrive 15 minutes before showtime
• Present this ticket at the cinema entrance
• Outside food and beverages are not allowed

══════════════════════════════════════════════════════
`;
      
      const blob = new Blob([simpleTicket], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `MoBook-Ticket-${booking.bookingId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
            <Check size={40} className="text-white animate-scale" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Ticket Ready!</h2>
          <p className="text-gray-400">Generating your ticket...</p>
        </div>
      </div>
    );
  }

  // Show the actual ticket
  return (
    <div className="min-h-screen bg-transparent text-white px-4">
      {/* Fixed Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-lg border border-gray-700/50 text-gray-300 hover:text-red-500 hover:border-red-500/50 transition-all hover:bg-black/90"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <div className="container mx-auto max-w-4xl h-[85vh] pt-20 pb-12">
        {/* Ticket content here */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
         <div
            ref={ticketRef}
            className="bg-black/70 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Ticket Header */}
            <div className="bg-gradient-to-l from-red-700/50 to-black/50 border border-red-900 p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                }} />
              </div>
              <div className="relative text-left flex items-center justify-between">
                <div className='flex flex-col gap-2'>
                  <div className='flex gap-3 items-center justify-center'>
                    <img src={icon} alt="MoBook Logo" className="w-[4vh] h-[3vh]" />
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">MoBook</h2>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm mb-1">Booking ID</div>
                  <div className="text-sm md:text-2xl font-bold text-white">{booking.bookingId}</div>
                </div>
              </div>
            </div>

            {/* Main Ticket Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* Movie Poster */}
                <div className="md:col-span-1">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg shadow-black/50">
                    <img 
                      src={movie.image} 
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Movie & Booking Details */}
                <div className="md:col-span-2 space-y-6">
                  {/* Movie Title */}
                  <div>
                    <h3 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-red-900/90 bg-clip-text text-transparent mb-2 text-left">{movie.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-red-600/20 border border-red-500/30 rounded-full text-sm text-red-400">
                        {movie.rating}
                      </span>
                      <span className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300">
                        {movie.duration}
                      </span>
                    </div>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin size={20} className="text-red-500" />
                        <span className="text-gray-400 text-sm">Location</span>
                      </div>
                      <p className="text-white font-semibold text-xl">{booking.mall}</p>
                      <p className="text-gray-400 text-sm">{booking.screen}</p>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar size={20} className="text-red-500" />
                        <span className="text-gray-400 text-sm">Date</span>
                      </div>
                      <p className="text-white font-semibold text-xl">{booking.date}</p>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock size={20} className="text-red-500" />
                        <span className="text-gray-400 text-sm">Show Time</span>
                      </div>
                      <p className="text-white font-semibold text-xl">{booking.time}</p>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Users size={20} className="text-red-500" />
                        <span className="text-gray-400 text-sm">Seats</span>
                      </div>
                      <p className="text-white font-semibold text-xl">{booking.seats.join(', ')}</p>
                      <p className="text-gray-400 text-sm">{booking.seats.length} ticket{booking.seats.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider with perforated effect */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-dashed border-red-900 mb-2"></div>
                </div>
                <div className="absolute -left-10 w-10 h-20 bg-red-950/50 rounded-full -ml-3 border-2 border-red-900"></div>
                <div className="absolute -right-10 w-10 h-20 bg-red-950/50 rounded-full -mr-3 border-2 border-red-900"></div>
              </div>

              {/* Payment Details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-col">
                  <div className='flex gap-2'>
                    <CreditCard size={24} className="text-red-500" />
                    <p className="text-gray-400 text-sm">Payment Method:</p>
                  </div>
                  <p className="text-white font-semibold">{booking.paymentMethod.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-1 mt-1">Total Amount</p>
                  <p className="text-3xl font-bold text-red-500">₱{booking.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="bg-gray-900/50 px-8 py-4 border-t border-gray-800">
              <p className="text-center text-gray-500 text-sm">
                Please arrive 15 minutes before showtime • Present this ticket at the entrance
              </p>
            </div>
          </div>
        </div>

        {/* Download Button - Added below ticket */}
        <div className="flex justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={handleDownloadTicket}
            disabled={downloading}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              downloading
                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02]'
            }`}
          >
            <Download size={24} />
            {downloading ? 'Downloading...' : 'Download Ticket'}
          </button>
        </div>
      </div>

      {/* ... rest of your code ... */}
    </div>
  );
};

export default Ticket;