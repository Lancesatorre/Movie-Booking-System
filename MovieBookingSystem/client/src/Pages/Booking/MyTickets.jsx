import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [canceling, setCanceling] = useState(false);

  // Fetch user's tickets from backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("mobook_user")) 
                  || JSON.parse(localStorage.getItem("user"));
        const customerId = user?.CustomerId;

        if (!customerId) {
          alert("You must be logged in to view tickets.");
          navigate("/login");
          return;
        }

        const res = await fetch(
          `http://localhost/mobook_api/get_booking_details.php?customerId=${customerId}`
        );
        const data = await res.json();

        if (data.success) {
          setTickets(data.tickets || []);
        } else {
          setTickets([]);
          console.error(data.message);
        }

      } catch (err) {
        console.error("Error fetching tickets:", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);


  // Check if ticket can be cancelled (not within 24 hours of showtime)
  const canCancelTicket = (showDateTime) => {
    const showDate = new Date(showDateTime);
    const now = new Date();
    const hoursDifference = (showDate - now) / (1000 * 60 * 60);
    return hoursDifference > 24;
  };

  // Handle cancel button click
  const handleCancelClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowCancelModal(true);
  };

  // Confirm cancellation
  const confirmCancellation = async () => {
    setCanceling(true);

    try {
      const res = await fetch('http://localhost/mobook_api/cancel_ticket.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedTicket.id }),
      });

      const data = await res.json();

      if (data.success) {
        setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
        setShowCancelModal(false);
        setSelectedTicket(null);
      } else {
        alert(data.message || 'Failed to cancel ticket. Please try again.');
      }
    } catch (err) {
      console.error('Error canceling ticket:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setCanceling(false);
    }
  };

  // Close modal
  const closeModal = () => {
    if (!canceling) {
      setShowCancelModal(false);
      setSelectedTicket(null);
    }
  };

  // Format date and time
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  return (
    <div className="min-h-[85vh] bg-transparent text-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
            My Tickets
          </h1>
          <p className="text-sm  md:text-xl text-gray-400">
            View and manage your movie bookings
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
          </div>
        )}

        {/* Tickets Grid */}
        {!loading && tickets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {tickets.map((ticket, index) => {
              const { date, time } = formatDateTime(ticket.showDateTime);
              const canCancel = canCancelTicket(ticket.showDateTime);

              return (
                <div
                  key={ticket.id}
                  className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl hover:shadow-red-500/20 transition-all duration-500 hover:scale-105 hover:border-red-500/30 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Movie Poster */}
                  <div className="relative h-64 overflow-hidden group">
                    <img
                      src={ticket.movieImage}
                      alt={ticket.movieTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      {ticket.movieRating}
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="p-6">
                    <h3 className="text-left text-2xl font-bold mb-3 truncate">{ticket.movieTitle}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{date}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{time}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">Screen {ticket.screenNumber}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                        <span className="text-sm">Seats: {ticket.seats.join(', ')}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="text-red-500" size={20} />
                        <span className="text-sm">{ticket.theatherLocation}</span>
                      </div>

                      <div className="flex items-center gap-2 text-green-400 font-semibold">
                        <span className="text-sm">₱ {ticket.totalPrice}.00</span>
                      </div>
                    </div>

                    {/* Cancel Button */}
                    {canCancel ? (
                      <button
                        onClick={() => handleCancelClick(ticket)}
                        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-red-700 to-orange-600/20 rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-300 font-bold shadow-lg hover:shadow-red-500/50 hover:scale-105 transform"
                      >
                        Cancel Booking
                      </button>
                    ) : (
                      <div className="w-full mt-4 px-4 py-3 bg-gray-700/50 rounded-xl text-center border border-gray-600/50">
                        <p className="text-sm text-gray-400 font-semibold">Cannot cancel</p>
                        <p className="text-xs text-gray-500 mt-1">Less than 24 hours to showtime</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && tickets.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="mb-6">
              <svg className="w-32 h-32 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-400">No Tickets Yet</h2>
            <p className="text-gray-500 mb-8">Book your first movie to see your tickets here</p>
            <button
              onClick={() => navigate('/movies')}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-red-500/50 hover:scale-105 transform"
            >
              Browse Movies
            </button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full mx-4 border border-red-500/30 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              disabled={canceling}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Cancel Booking?</h3>
                <p className="text-gray-400 mb-2">
                  Are you sure you want to cancel your booking for
                </p>
                <p className="text-xl font-semibold text-white mb-4">
                  {selectedTicket.movieTitle}
                </p>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  disabled={canceling}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancellation}
                  disabled={canceling}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {canceling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Canceling...
                    </>
                  ) : (
                    'Cancel Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default MyTickets;
