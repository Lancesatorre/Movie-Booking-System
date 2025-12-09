import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, Clock, CreditCard, Smartphone, ArrowLeft, Check, MapPin, Download, Home, Users, Film } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmationModal from '../../Modal/ConfimationModal';
import LoadingState from '../../Components/LoadingState';
import icon from "/assets/logo.png";
import html2canvas from 'html2canvas';

const API_BASE = "http://localhost/mobook_api";

const toYMD = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketRef = useRef(null);

  // Get movie data from navigation state or use default
  const movie = location.state?.movie || {
    id: 1,
    title: "Altered",
    image: "/assets/Movies/altered.jpg",
    duration: "132m",
    rating: "R-5",
    genre: "Science Fiction, Action",
    price: 250
  };

  // ✅ logged-in user
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const customerId = storedUser?.CustomerId || storedUser?.customerId;

  // --------- DB-driven data ----------
  const [screens, setScreens] = useState([]);
  const [malls, setMalls] = useState([]);
  const [showDates, setShowDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [unavailableSeats, setUnavailableSeats] = useState([]);

  const [loading, setLoading] = useState({
    screens: false,
    malls: false,
    dates: false,
    times: false,
    seats: false,
    booking: false,
  });
  const [error, setError] = useState(null);

  // --------- Selections ----------
  const [step, setStep] = useState(1);
  const [selectedMall, setSelectedMall] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // New state for booking confirmation
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // --------- fallback generated dates ----------
  const generatedDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        full: date
      };
    });
  }, []);

  const dates = showDates.length
    ? showDates.map(d => {
        const full = new Date(d.date);
        return {
          day: full.toLocaleDateString('en-US', { weekday: 'short' }),
          date: full.getDate(),
          month: full.toLocaleDateString('en-US', { month: 'short' }),
          full
        };
      })
    : generatedDates;

  // --------- Load Screens for movie ----------
  useEffect(() => {
    const loadScreens = async () => {
      setLoading(l => ({ ...l, screens: true }));
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/get_screens.php?movieId=${movie.id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load screens");
        setScreens(json.screens || []);
        setSelectedScreen(json.screens?.[0] || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(l => ({ ...l, screens: false }));
      }
    };
    loadScreens();
  }, [movie.id]);

  // --------- Load Malls/Theaters when screen changes ----------
  useEffect(() => {
    if (!selectedScreen) return;

    const loadMalls = async () => {
      setLoading(l => ({ ...l, malls: true }));
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/get_theaters.php?movieId=${movie.id}&screenId=${selectedScreen.id}`
        );
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load malls");
        setMalls(json.theaters || []);

        setSelectedMall(prev =>
          prev && json.theaters?.some(m => m.id === prev.id) ? prev : null
        );
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(l => ({ ...l, malls: false }));
      }
    };

    // reset downstream
    setSelectedMall(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setTimes([]);
    setSelectedSeats([]);
    setUnavailableSeats([]);
    setShowDates([]);

    loadMalls();
  }, [selectedScreen?.id, movie.id]);

  // --------- Load Show Dates when mall changes ----------
  useEffect(() => {
    if (!selectedMall || !selectedScreen) return;

    const loadDates = async () => {
      setLoading(l => ({ ...l, dates: true }));
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/get_showdates.php?movieId=${movie.id}&screenId=${selectedScreen.id}&theaterId=${selectedMall.id}`
        );
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load show dates");
        setShowDates(json.dates || []);
      } catch (e) {
        setShowDates([]);
      } finally {
        setLoading(l => ({ ...l, dates: false }));
      }
    };

    // reset downstream
    setSelectedDate(null);
    setSelectedTime(null);
    setTimes([]);
    setSelectedSeats([]);
    setUnavailableSeats([]);

    loadDates();
  }, [selectedMall?.id, selectedScreen?.id, movie.id]);

  // --------- Load Showtimes when date changes ----------
  useEffect(() => {
    if (!selectedMall || !selectedScreen || !selectedDate) return;

    const loadTimes = async () => {
      setLoading(l => ({ ...l, times: true }));
      setError(null);
      try {
        const dateStr = toYMD(selectedDate.full);
        const res = await fetch(
          `${API_BASE}/get_showtimes.php?movieId=${movie.id}&screenId=${selectedScreen.id}&theaterId=${selectedMall.id}&date=${dateStr}`
        );
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load showtimes");
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const selectedDateOnly = new Date(selectedDate.full.getFullYear(), selectedDate.full.getMonth(), selectedDate.full.getDate());
        
        const isToday = selectedDateOnly.getTime() === today.getTime();
        
        const filteredTimes = (json.times || []).map(time => {
          if (!isToday) {
            return time;
          }
          
          const [hours, minutes] = time.time.split(':').map(Number);
          const showDateTime = new Date(selectedDate.full);
          showDateTime.setHours(hours, minutes, 0, 0);
          
          const timeDiffHours = (showDateTime - now) / (1000 * 60 * 60);
          
          return {
            ...time,
            available: time.available && timeDiffHours > 3
          };
        });
        
        setTimes(filteredTimes);
        setSelectedTime(null);
      } catch (e) {
        setError(e.message);
        setTimes([]);
      } finally {
        setLoading(l => ({ ...l, times: false }));
      }
    };

    setSelectedTime(null);
    setSelectedSeats([]);
    setUnavailableSeats([]);

    loadTimes();
  }, [selectedDate?.date, selectedMall?.id, selectedScreen?.id, movie.id]);

  // --------- Load Unavailable Seats when time changes ----------
  useEffect(() => {
    if (!selectedTime?.id) return;

    const loadUnavailableSeats = async () => {
      setLoading(l => ({ ...l, seats: true }));
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/get_unavailable_seats.php?showtimeId=${selectedTime.id}`
        );
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load unavailable seats");
        setUnavailableSeats(json.unavailableSeats || []);
        setSelectedSeats([]);
      } catch (e) {
        setError(e.message);
        setUnavailableSeats([]);
      } finally {
        setLoading(l => ({ ...l, seats: false }));
      }
    };

    loadUnavailableSeats();
  }, [selectedTime?.id]);

  // --------- booking in progress tracking ----------
  useEffect(() => {
    const savedProgress = localStorage.getItem('bookingInProgress');
    if (savedProgress === 'true') setBookingInProgress(true);
  }, []);

  useEffect(() => {
    const hasProgress = selectedMall || selectedSeats.length > 0 || paymentMethod;
    setBookingInProgress(hasProgress);
    localStorage.setItem('bookingInProgress', hasProgress ? 'true' : 'false');
  }, [selectedMall, selectedSeats, paymentMethod]);

  const handleBackClick = () => {
    if (bookingInProgress) setShowConfirmModal(true);
    else window.history.back();
  };

  const handleNavigationAway = () => {
    localStorage.removeItem('bookingInProgress');
    navigate("/movies");
    setShowConfirmModal(false);
  };

  // --------- seats UI logic ----------
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatSections = { left: 3, center: 6, right: 3 };

  const handleSeatClick = (seat) => {
    if (unavailableSeats.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const getSeatStatus = (seat) => {
    if (unavailableSeats.includes(seat)) return 'unavailable';
    if (selectedSeats.includes(seat)) return 'selected';
    return 'available';
  };

  const getSeatColor = (status) => {
    switch (status) {
      case 'selected':
        return 'bg-gradient-to-r from-red-700 to-orange-600/20 shadow-lg shadow-red-500/50 scale-110';
      case 'unavailable':
        return 'bg-gray-400/50 cursor-not-allowed';
      default:
        return 'bg-gray-800 hover:bg-gray-700 hover:scale-110 cursor-pointer';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedMall && selectedScreen && selectedDate && selectedTime;
      case 2:
        return selectedSeats.length > 0;
      case 3:
        return paymentMethod;
      default:
        return false;
    }
  };

  const totalAmount = selectedSeats.length * movie.price;

  const handleNext = () => {
    if (canProceed() && step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Generate booking ID
  const generateBookingId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MBK${timestamp}${random}`;
  };

  // --------- CONFIRM BOOKING (DB SAVE) ----------
  const handleConfirm = async () => {
    if (!canProceed()) return;

    if (!customerId) {
      alert("You must be logged in to book.");
      return;
    }

    const payload = {
      customerId,
      showtimeId: selectedTime.id,
      seatNumbers: selectedSeats,
      paymentMethod,
      paymentStatus: "PAID",
    };

    // Start booking loading
    setLoading(l => ({ ...l, booking: true }));
    setBookingCompleted(false);

    try {
      const res = await fetch(`${API_BASE}/create_booking.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.message || "Booking failed.");
        setLoading(l => ({ ...l, booking: false }));
        return;
      }

      // Create booking data for ticket
      const bookingData = {
        movie: {
          title: movie.title,
          image: movie.image,
          duration: movie.duration,
          rating: movie.rating,
          genre: movie.genre,
        },
        booking: {
          bookingId: generateBookingId(),
          mall: selectedMall.name,
          screen: selectedScreen.name,
          date: `${selectedDate.month} ${selectedDate.date}`,
          time: selectedTime.time,
          seats: selectedSeats,
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          bookingTime: new Date().toLocaleString(),
        }
      };

      // Save booking data
      setBookingData(bookingData);
      
      // Show success state and then show ticket
      setTimeout(() => {
        setBookingCompleted(true);
        setLoading(l => ({ ...l, booking: false }));
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
      setLoading(l => ({ ...l, booking: false }));
    }
  };

  // Download ticket function
  // Replace the existing handleDownloadTicket function with this:

// Replace the handleDownloadTicket function with this:

const handleDownloadTicket = () => {
  setDownloading(true);
  
  try {
    // Create clean HTML ticket with only details
    const ticketHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MoBook Ticket - ${bookingData.booking.bookingId}</title>
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
          
          .perforated-line {
            position: relative;
            height: 1px;
            margin: 40px 0;
          }
          
          .perforated-line::before {
            content: '';
            position: absolute;
            top: 0;
            left: -36px;
            right: -36px;
            height: 100%;
            border-top: 2px dashed rgba(220, 38, 38, 0.6);
          }
          
          .perforated-line::after {
            content: '';
            position: absolute;
            top: -15px;
            left: 1000;
            width: 30px;
            height: 30px;
            background: #0a0a0a;
            border-radius: 50%;
            border: 2px solid rgba(220, 38, 38, 0.7);
            transform: translateX(-50%);
          }
          
          .perforated-line::before {
            content: '';
            position: absolute;
            top: -15px;
            right: 0;
            width: 30px;
            height: 30px;
            background: #0a0a0a;
            border-radius: 50%;
            border: 2px solid rgba(220, 38, 38, 0.7);
            transform: translateX(50%);
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
                <div class="id-number">${bookingData.booking.bookingId}</div>
              </div>
            </div>
          </div>
          
          <!-- Body -->
          <div class="ticket-body">
            <!-- Movie Title Section -->
            <div class="movie-title-section">
              <h2 class="movie-title">${bookingData.movie.title}</h2>
              <div class="movie-tags">
                <div class="tag tag-rating">${bookingData.movie.rating}</div>
                <div class="tag tag-duration">${bookingData.movie.duration}</div>
              </div>
              <div class="movie-genre">${bookingData.movie.genre}</div>
            </div>
            
            <!-- Details Grid -->
            <div class="details-section">
              <div class="details-grid">
                <div class="detail-card">
                  <div class="detail-header">
                    <span>📍 Location</span>
                  </div>
                  <div class="detail-content">${bookingData.booking.mall}</div>
                  <div class="detail-subtext">${bookingData.booking.screen}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-header">
                    <span>📅 Date</span>
                  </div>
                  <div class="detail-content">${bookingData.booking.date}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-header">
                    <span>⏰ Show Time</span>
                  </div>
                  <div class="detail-content">${bookingData.booking.time}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-header">
                    <span>🎟️ Seats</span>
                  </div>
                  <div class="detail-content">${bookingData.booking.seats.join(', ')}</div>
                  <div class="detail-subtext">${bookingData.booking.seats.length} ticket${bookingData.booking.seats.length > 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>
            
            <!-- Perforated Line -->
  
            
            <!-- Payment Info -->
            <div class="payment-section">
              <div class="payment-info">
                <div class="payment-icon">💳</div>
                <div class="payment-details">
                  <h3>Payment Method</h3>
                  <p>${bookingData.booking.paymentMethod.toUpperCase()}</p>
                </div>
              </div>
              
              <div class="total-amount">
                <h3>Total Amount</h3>
                <p>₱${bookingData.booking.totalAmount.toLocaleString()}</p>
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
    link.download = `MoBook-Ticket-${bookingData.booking.bookingId}.html`;
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

Booking ID: ${bookingData.booking.bookingId}

──────────────────────────────────────────────────────

🎬 MOVIE: ${bookingData.movie.title}
   Rating: ${bookingData.movie.rating} | Duration: ${bookingData.movie.duration}
   Genre: ${bookingData.movie.genre}

──────────────────────────────────────────────────────

📍 LOCATION: ${bookingData.booking.mall}
   Screen: ${bookingData.booking.screen}

📅 DATE: ${bookingData.booking.date}
⏰ TIME: ${bookingData.booking.time}
🎟️ SEATS: ${bookingData.booking.seats.join(', ')}

──────────────────────────────────────────────────────

💳 PAYMENT: ${bookingData.booking.paymentMethod.toUpperCase()}
💰 TOTAL: ₱${bookingData.booking.totalAmount.toLocaleString()}

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
    link.download = `MoBook-Ticket-${bookingData.booking.bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
  } finally {
    setDownloading(false);
  }
};

  const handleBackToHome = () => {
    localStorage.removeItem("bookingInProgress");
    setBookingCompleted(false);
    setBookingData(null);
    setSelectedSeats([]);
    setPaymentMethod(null);
    setStep(1);
    navigate("/Home");
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'from-blue-600 to-blue-700' },
    { id: 'gcash', name: 'GCash', icon: Smartphone, color: 'from-blue-500 to-cyan-600' },
    { id: 'paypal', name: 'PayPal', icon: CreditCard, color: 'from-blue-600 to-indigo-700' },
    { id: 'paymaya', name: 'PayMaya', icon: Smartphone, color: 'from-green-600 to-emerald-700' }
  ];

  // If booking is completed, show ticket
  if (bookingCompleted && bookingData) {
    return (
      <div className="min-h-screen bg-transparent text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          
          {/* Success Message */}
          <div className="text-center mb-3 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/50">
              <Check size={40} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-700 to-orange-600 bg-clip-text text-transparent pb-2 mb-1">
              Booking Successful!
            </h1>
            <p className="text-gray-400 text-lg">Your ticket is ready. See you at the movies!</p>
          </div>

          {/* Ticket */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div 
              ref={ticketRef}
              className="bg-black/70 rounded-3xl overflow-hidden shadow-2xl "
            >
              {/* Ticket Header */}
              <div className=" bg-gradient-to-l from-red-700/50 to-black/50   border border-red-900 p-6 relative overflow-hidden ">
                <div className="absolute inset-0 opacity-20 ">
                  <div className="absolute inset-0 " style={{
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
                    <div className="text-sm md:text-2xl font-bold text-white">{bookingData.booking.bookingId}</div>
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
                        src={bookingData.movie.image} 
                        alt={bookingData.movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Movie & Booking Details */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Movie Title */}
                    <div>
                      <h3 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-red-900/90 bg-clip-text text-transparent mb-2 text-left">{bookingData.movie.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-red-600/20 border border-red-500/30 rounded-full text-sm text-red-400">
                          {bookingData.movie.rating}
                        </span>
                        <span className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300">
                          {bookingData.movie.duration}
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
                        <p className="text-white font-semibold text-xl">{bookingData.booking.mall}</p>
                        <p className="text-gray-400 text-sm">{bookingData.booking.screen}</p>
                      </div>

                      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar size={20} className="text-red-500" />
                          <span className="text-gray-400 text-sm">Date</span>
                        </div>
                        <p className="text-white font-semibold text-xl">{bookingData.booking.date}</p>
                      </div>

                      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock size={20} className="text-red-500" />
                          <span className="text-gray-400 text-sm">Show Time</span>
                        </div>
                        <p className="text-white font-semibold text-xl">{bookingData.booking.time}</p>
                      </div>

                      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-2">
                          <Users size={20} className="text-red-500" />
                          <span className="text-gray-400 text-sm">Seats</span>
                        </div>
                        <p className="text-white font-semibold text-xl">{bookingData.booking.seats.join(', ')}</p>
                        <p className="text-gray-400 text-sm">{bookingData.booking.seats.length} ticket{bookingData.booking.seats.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider with perforated effect */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-dashed border-red-900 mb-2"></div>
                  </div>
                  <div className="absolute -left-10.5 w-10 h-20 bg-red-950/50 rounded-full -ml-3 border-2 border-red-900"></div>
                  <div className="absolute -right-10.5 w-10 h-20 bg-red-950/50 rounded-full -mr-3 border-2 border-red-900"></div>
                </div>

                {/* Payment Details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center  flex-col">
                   
                    <div className='flex gap-2'>
                       <CreditCard size={24} className="text-red-500" />
                      <p className="text-gray-400 text-sm">Payment Method:</p>
                      
                    </div>
                    <p className="text-white font-semibold">{bookingData.booking.paymentMethod.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm mb-1 mt-1">Total Amount</p>
                    <p className="text-3xl font-bold text-red-500">₱{bookingData.booking.totalAmount.toLocaleString()}</p>
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

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={handleDownloadTicket}
              disabled={downloading}
              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                downloading
                  ? 'bg-gray-700 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02]'
              }`}
            >
              <Download size={24} />
              {downloading ? 'Downloading...' : 'Download Ticket'}
            </button>

            <button
              onClick={handleBackToHome}
              className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-red-500/50 rounded-xl hover:border-red-500 hover:bg-red-900/20 transition-all duration-300 font-semibold text-lg hover:scale-[1.02]"
            >
              <Home size={24} />
              Back to Home
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className='flex flex-row justify-center gap-2 '>
               <Film size={20} className="text-red-500" />
              <h4 className="font-semibold text-white mb-3  gap-2">
             
              Important Reminders
            </h4>
            </div>
           
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Please arrive at least 15 minutes before showtime</li>
              <li>• Present this ticket (digital or printed) at the cinema entrance</li>
              <li>• Outside food and beverages are not allowed inside the cinema</li>
              <li>• Recording or photography during the movie is strictly prohibited</li>
            </ul>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out both;
          }
          .animate-slide-up {
            animation: slideUp 0.8s ease-out both;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white py-12 px-4">
      {/* Booking Loading State */}
      {loading.booking && (
        <LoadingState 
          message={bookingCompleted ? "Booking Completed!" : "Processing your booking..."}
        />
      )}

      <div className="container mx-auto max-w-7xl">

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-800/30 border border-red-500/40 text-sm">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Movies</span>
          </button>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent mb-2">
            Complete Your Booking
          </h1>
          <p className="text-gray-400">Follow the steps to book your tickets</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { num: 1, label: 'Mall · When' },
              { num: 2, label: 'Select Seats' },
              { num: 3, label: 'Payment' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= s.num
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-500/50'
                      : 'bg-gray-800 border-2 border-red-900'
                  }`}>
                    {step > s.num ? <Check size={20} /> : s.num}
                  </div>
                  <span className={`mt-2 text-xs md:text-sm font-semibold ${step >= s.num ? 'text-red-500' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                    step > s.num ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-red-950'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">

            {/* Step 1: Mall, Date & Time */}
            {step === 1 && (
              <div className="space-y-6 animate-slide-up">
                {/* Mall Selection */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-red-500/25">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-red-500" size={20} />
                      <h2 className="text-xl md:text-2xl font-bold">Select Mall</h2>
                    </div>

                    {/* Screen Selection */}
                    <div className="flex gap-2">
                      {loading.screens && (
                        <span className="text-xs text-gray-400 px-2 py-1">Loading…</span>
                      )}
                      {screens.map((screen) => (
                        <button
                          key={screen.id}
                          onClick={() => setSelectedScreen(screen)}
                          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                            selectedScreen?.id === screen.id
                              ? 'bg-gradient-to-r from-red-700 to-orange-600/20 shadow-lg shadow-red-500/50'
                              : 'cursor-pointer bg-gray-800/50 hover:bg-gray-700/50'
                          }`}
                        >
                          {screen.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {loading.malls && (
                      <div className="text-sm text-gray-400">Loading malls…</div>
                    )}
                    {!loading.malls && malls.map((mall, idx) => (
                      <button
                        key={mall.id}
                        onClick={() => setSelectedMall(mall)}
                        className={`p-4 rounded-lg transition-all duration-300 text-left ${
                          selectedMall?.id === mall.id
                            ? 'bg-gradient-to-r from-red-700 to-orange-600/20 shadow-lg shadow-red-500/50 scale-105'
                            : 'cursor-pointer bg-gray-800/50 hover:bg-gray-700/50 hover:scale-105'
                        }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-sm md:text-base">{mall.name}</div>
                            <div className="text-xs md:text-sm text-gray-300 mt-1">{mall.location}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-red-500/25">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <Calendar className="text-red-500" size={20} />
                    <h2 className="text-xl md:text-2xl font-bold">Select Date</h2>
                  </div>

                  {/* Show message when no mall is selected */}
                  {!selectedMall ? (
                    <div className="text-center">
                      
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-3">
                      {dates.map((d, idx) => {
                        const isEnabled = !showDates.length || showDates.some(sd => {
                          const full = new Date(sd.date);
                          return full.toDateString() === d.full.toDateString();
                        });

                        return (
                          <button
                            key={idx}
                            onClick={() => isEnabled && setSelectedDate(d)}
                            disabled={!isEnabled}
                            className={`p T2 md:p-4 rounded-lg md:rounded-xl transition-all duration-300 ${
                              !isEnabled
                                ? 'bg-gray-800/30 opacity-50 cursor-not-allowed'
                                : selectedDate?.date === d.date
                                ? 'bg-gradient-to-r from-red-700 to-orange-600/20 shadow-lg shadow-red-500/50 scale-105'
                                : 'bg-gray-800/50 cursor-pointer  hover:bg-gray-700/50 hover:scale-105'
                            }`}
                            style={{ animationDelay: `${idx * 0.05}s` }}
                          >
                            <div className="text-xs text-gray-400">{d.day}</div>
                            <div className="text-lg md:text-2xl font-bold my-1">{d.date}</div>
                            <div className="text-xs text-gray-400">{d.month}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Time Selection */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/25">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="text-red-500" size={24} />
                    <h2 className="text-2xl font-bold">Select Time</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {loading.times && (
                      <div className="text-sm text-gray-400">Loading times…</div>
                    )}
                    {!loading.times && times.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => t.available && setSelectedTime(t)}
                        disabled={!t.available}
                        className={`p-4 rounded-xl font-semibold transition-all duration-300 ${
                          !t.available
                            ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                            : selectedTime?.id === t.id
                            ? 'bg-gradient-to-r from-red-700 to-orange-600/20 shadow-lg shadow-red-500/50 scale-105'
                            : 'bg-gray-800/50 cursor-pointer  hover:bg-gray-700/50 hover:scale-105'
                        }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        {t.time}
                        {!t.available && <div className="text-xs mt-1">Sold Out</div>}
                      </button>
                    ))}

                    {!loading.times && selectedDate && times.length === 0 && (
                      <div className="text-sm text-gray-400 col-span-full">
                        No showtimes for this date.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Seat Selection */}
            {step === 2 && (
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-red-500/25 animate-slide-up">
                <h2 className="text-2xl font-bold mb-8 text-center">Select Your Seats</h2>

                {/* Screen with 3D effect */}
                <div className="mb-12 perspective-1000">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 to-transparent blur-2xl h-32 -top-8" />
                    <div className="relative w-full max-w-4xl mx-auto">
                      <div
                        className="h-3 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-t-full transform -rotate-x-12 shadow-lg shadow-gray-500/50"
                        style={{ transform: 'perspective(1000px) rotateX(-15deg)' }}
                      />
                      <div className="text-center text-sm text-gray-400 mt-3 font-semibold tracking-wider">
                        — SCREEN —
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seating Area */}
                <div className="mb-8">
                  <div className="max-w-5xl mx-auto">
                    {rows.map((row, rowIdx) => {
                      let seatCounter = 0;
                      return (
                        <div
                          key={row}
                          className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 mb-3 md:mb-4 animate-seat-row"
                          style={{
                            animationDelay: `${rowIdx * 0.08}s`,
                            animationFillMode: 'both'
                          }}
                        >
                          <div className="w-6 sm:w-7 md:w-8 text-center font-bold text-gray-500 text-xs sm:text-sm">
                            {row}
                          </div>

                          <div className="flex gap-1 sm:gap-2">
                            {Array.from({ length: seatSections.left }, () => {
                              seatCounter++;
                              const seatId = `${row}${seatCounter}`;
                              const status = getSeatStatus(seatId);
                              return (
                                <button
                                  key={seatId}
                                  onClick={() => handleSeatClick(seatId)}
                                  disabled={status === 'unavailable'}
                                  className={` w-4 h-4 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg transition-all duration-300 relative group ${getSeatColor(status)}`}
                                  title={seatId}
                                >
                                  <span className="absolute -top-6 sm:-top-7 md:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-[10px] sm:text-xs z-10">
                                    {seatId}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="w-4 sm:w-6 md:w-8" />

                          <div className="flex gap-1 sm:gap-2">
                            {Array.from({ length: seatSections.center }, () => {
                              seatCounter++;
                              const seatId = `${row}${seatCounter}`;
                              const status = getSeatStatus(seatId);
                              return (
                                <button
                                  key={seatId}
                                  onClick={() => handleSeatClick(seatId)}
                                  disabled={status === 'unavailable'}
                                  className={`w-4 h-4 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg transition-all duration-300 relative group ${getSeatColor(status)}`}
                                  title={seatId}
                                >
                                  <span className="absolute -top-6 sm:-top-7 md:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-[10px] sm:text-xs z-10">
                                    {seatId}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="w-4 sm:w-6 md:w-8" />

                          <div className="flex gap-1 sm:gap-2">
                            {Array.from({ length: seatSections.right }, () => {
                              seatCounter++;
                              const seatId = `${row}${seatCounter}`;
                              const status = getSeatStatus(seatId);
                              return (
                                <button
                                  key={seatId}
                                  onClick={() => handleSeatClick(seatId)}
                                  disabled={status === 'unavailable'}
                                  className={`w-4 h-4 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg transition-all duration-300 relative group ${getSeatColor(status)}`}
                                  title={seatId}
                                >
                                  <span className="absolute -top-6 sm:-top-7 md:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-[10px] sm:text-xs z-10">
                                    {seatId}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="w-6 sm:w-7 md:w-8 text-center font-bold text-gray-500 text-xs sm:text-sm">
                            {row}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-row md:flex-wrap gap-8 justify-center pt-6 border-t border-red-500/25">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gray-800 rounded-lg" />
                    <span className="text-xs md:text-sm text-gray-300 font-medium">Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-r from-red-700 to-orange-600/20 rounded-lg shadow-lg shadow-red-500/50" />
                    <span className="text-xs md:text-sm text-gray-300 font-medium">Selected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gray-400/50 rounded-lg" />
                    <span className="text-xs md:text-sm text-gray-300 font-medium">Unavailable</span>
                  </div>
                </div>

                {/* Selected Seats Info */}
                {selectedSeats.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-xl animate-fade-in">
                    <div className="text-center">
                      <span className="text-gray-300 font-medium">Selected Seats: </span>
                      <span className="text-red-400 font-bold">{selectedSeats.join(', ')}</span>
                      <span className="text-gray-400 ml-2">({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6 animate-slide-up">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/25">
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method, idx) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={` p-6 rounded-xl transition-all duration-300 border-2 ${
                            paymentMethod === method.id
                              ? 'border-red-500 bg-gray-800/50 scale-105'
                              : 'cursor-pointer border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:scale-105'
                          }`}
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 mx-auto`}>
                            <Icon size={24} />
                          </div>
                          <div className="font-semibold">{method.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {paymentMethod && (
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/25 animate-fade-in">
                    <h3 className="text-xl font-bold mb-4">Enter Payment Details</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Card Number / Account Number"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Cardholder Name"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
                 
          {/* Order Summary Sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/25 sticky top-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-bold mb-6 text-center">Order Summary</h3>

            {/* Movie Info - Image on Left, Details on Right */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Image on the Left */}
                <div className="w-full md:w-2/5 lg:w-[27vh]">
                  <div className="aspect-[2/3]">
                    <img 
                      src={movie.image} 
                      alt={movie.title} 
                      className="w-full h-full object-cover rounded-xl shadow-lg shadow-black/80"
                    />
                  </div>
                </div>
                
                {/* Details on the Right */}
                <div className="flex-1 w-full text-left md:w-3/5 lg:w-2/3">
                  <h4 className="font-bold text-2xl md:text-4xl mb-4 text-red-400">{movie.title}</h4>
                  <div className="space-y-3 text-left md:text-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-400 min-w-[60px]">Duration:</span>
                      <span className="font-medium text-white">{movie.duration}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-400 min-w-[60px]">Rating:</span>
                      <span className="font-medium text-white bg-red-600/20 px-3 py-1 text-xs rounded-full border border-red-500/30">
                        {movie.rating}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-400 min-w-[60px]">Genre:</span>
                      <span className="font-medium text-white">{movie.genre}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-400 min-w-[60px]">Price:</span>
                      <span className="font-bold text-2xl text-red-400">₱{movie.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-4 mb-6">
              <div className="border-t border-red-900 pt-4">
                <h4 className="font-semibold text-xl text-gray-300 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-red-500" />
                  Booking Details
                </h4>
                <div className="space-y-3 text-base">
                  {selectedMall && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-gray-400 flex items-center gap-2">
                        <MapPin size={16} />
                        Mall:
                      </span>
                      <span className="font-semibold text-right text-white">{selectedMall.name}</span>
                    </div>
                  )}
                  {selectedDate && selectedTime && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Clock size={16} />
                        Date & Time:
                      </span>
                      <span className="font-semibold text-right text-white">
                        {selectedDate.month} {selectedDate.date}, {selectedTime.time}
                      </span>
                    </div>
                  )}
                  {selectedSeats.length > 0 && (
                    <>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-gray-400">Selected Seats:</span>
                        <span className="font-semibold text-right text-red-400 bg-red-900/20 px-3 py-1 rounded-full">
                          {selectedSeats.join(', ')}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-gray-400">Tickets:</span>
                        <span className="font-semibold text-white">
                          {selectedSeats.length} × ₱{movie.price}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="border-t border-red-900 pt-4 mb-6">
              <div className="flex justify-between items-center text-xl md:text-2xl font-bold">
                <span className="text-gray-300">Total Amount:</span>
                <span className="text-red-500 text-3xl md:text-4xl">₱{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {step < 3 ? (
                <>
                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      className="cursor-pointer w-full px-6 py-4 border-2 border-gray-700 rounded-xl hover:border-red-500 hover:bg-red-900/10 transition-all duration-300 font-semibold text-lg"
                    >
                      ← Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || loading.booking}
                    className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      canProceed() && !loading.booking
                        ? 'cursor-pointer bg-gradient-to-r from-red-700 to-orange-600/20 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02]'
                        : 'bg-gray-700 cursor-not-allowed opacity-50'
                    }`}
                  >
                    Continue to {step === 1 ? 'Seat Selection' : 'Payment'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleBack}
                    disabled={loading.booking}
                    className={`cursor-pointer w-full px-6 py-4 border-2 border-gray-700 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      loading.booking
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-red-500 hover:bg-red-900/10 hover:scale-[1.02]'
                    }`}
                  >
                    ← Back to Seats
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!canProceed() || loading.booking}
                    className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      canProceed() && !loading.booking
                        ? 'cursor-pointer bg-gradient-to-r from-red-700 to-orange-600/20 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02]'
                        : 'bg-gray-700 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {loading.booking ? 'Processing Booking...' : 'Confirm Booking'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Confirmation Modal for back button */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={handleNavigationAway}
        onCancel={() => setShowConfirmModal(false)}
        title="Leave Booking Process?"
        message="You have an ongoing booking. Are you sure you want to go back? Your progress will be lost."
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes seatRow {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out both;
        }
        .animate-seat-row {
          animation: seatRow 0.5s ease-out;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
};

export default Checkout;