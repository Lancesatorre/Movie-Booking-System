import React, { useState } from 'react';
import { Calendar, Clock, CreditCard, Smartphone, ArrowLeft, Check, X, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Checkout = () => {
  const screens = [
    { id: 1, name: 'Screen 1' },
    { id: 2, name: 'Screen 2' },
    { id: 3, name: 'Screen 3' }
  ];

  const [step, setStep] = useState(1);
  const [selectedMall, setSelectedMall] = useState(null);
 const [selectedScreen, setSelectedScreen] = useState(screens[0]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
 
  // Get movie data from navigation state or use default
  const movie = location.state?.movie || {
    title: "Altered",
    image: "/assets/Movies/altered.jpg",
    duration: "132m",
    rating: "R-5",
    genre: "Science Fiction, Action",
    price: 250
  };

  // Screen data


  // Mall availability by screen
  const mallAvailability = {
    1: [1, 3, 5], // Screen 1: SM CITY, Robinson's Place, Megamall available
    2: [2, 4, 6], // Screen 2: Ayala Malls, Robinsons Mall, Trinoma available
    3: [1, 2, 4, 5] // Screen 3: SM CITY, Ayala Malls, Robinsons Mall, Megamall available
  };

  // Mall data
  const malls = [
    { id: 1, name: 'SM CITY', location: 'Cebu, Cebu City' },
    { id: 2, name: 'Ayala Malls', location: 'Cebu, Cebu City' },
    { id: 3, name: 'Robinson\'s Place', location: 'Cebu, Cebu City' },
    { id: 4, name: 'Robinsons Mall', location: 'Cebu, Cebu City' },
    { id: 5, name: 'Megamall', location: 'Cebu, Cebu City' },
    { id: 6, name: 'Trinoma', location: 'Cebu, Cebu City' }
  ];

  const isMallAvailable = (mallId) => {
    if (!selectedScreen) return true;
    return mallAvailability[selectedScreen.id].includes(mallId);
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date
    };
  });

  const times = [
    { id: 1, time: '10:00 AM', available: true },
    { id: 2, time: '1:00 PM', available: true },
    { id: 3, time: '4:00 PM', available: true },
    { id: 4, time: '7:00 PM', available: false },
    { id: 5, time: '10:00 PM', available: true }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'from-blue-600 to-blue-700' },
    { id: 'gcash', name: 'GCash', icon: Smartphone, color: 'from-blue-500 to-cyan-600' },
    { id: 'paypal', name: 'PayPal', icon: CreditCard, color: 'from-blue-600 to-indigo-700' },
    { id: 'paymaya', name: 'PayMaya', icon: Smartphone, color: 'from-green-600 to-emerald-700' }
  ];

  // Seat layout - 8 rows with 3 sections (left: 3, center: 6, right: 3)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatSections = {
    left: 3,
    center: 6,
    right: 3
  };
  const unavailableSeats = ['A2', 'B5', 'C7', 'D8', 'E5', 'F9', 'G3', 'H6'];

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
        return 'bg-gradient-to-br from-red-600 to-orange-600 shadow-lg shadow-red-500/50 scale-110';
      case 'unavailable':
        return 'bg-black/50 cursor-not-allowed';
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
    if (canProceed() && step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirm = () => {
    if (canProceed()) {
      alert('Booking Confirmed! Thank you for choosing MoBook.');
      // Handle booking confirmation logic here
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button 
            onClick={() => window.history.back()}
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
              { num: 1, label: 'Mall, Date & Time' },
              { num: 2, label: 'Select Seats' },
              { num: 3, label: 'Payment' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= s.num 
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-500/50' 
                      : 'bg-gray-800 border-2 border-gray-700'
                  }`}>
                    {step > s.num ? <Check size={20} /> : s.num}
                  </div>
                  <span className={`mt-2 text-sm font-semibold ${step >= s.num ? 'text-red-500' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                    step > s.num ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gray-800'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Mall, Date & Time */}
            {step === 1 && (
              <div className="space-y-6 animate-slide-up">
                {/* Mall Selection */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-red-500" size={20} />
                      <h2 className="text-xl md:text-2xl font-bold">Select Mall</h2>
                    </div>
                    
                    {/* Screen Selection */}
                    <div className="flex gap-2">
                      {screens.map((screen) => (
                        <button
                          key={screen.id}
                          onClick={() => {
                            setSelectedScreen(screen);
                            // Reset mall selection if current mall is not available for new screen
                            if (selectedMall && !mallAvailability[screen.id].includes(selectedMall.id)) {
                              setSelectedMall(null);
                            }
                          }}
                          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                            selectedScreen?.id === screen.id
                              ? 'bg-gradient-to-br from-red-600 to-orange-600 shadow-lg shadow-red-500/50'
                              : 'bg-gray-800/50 hover:bg-gray-700/50'
                          }`}
                        >
                          {screen.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {malls.map((mall, idx) => {
                      const available = isMallAvailable(mall.id);
                      return (
                        <button
                          key={mall.id}
                          onClick={() => available && setSelectedMall(mall)}
                          disabled={!available}
                          className={`p-4 rounded-lg transition-all duration-300 text-left ${
                            !available
                              ? 'bg-gray-800/30 opacity-50 cursor-not-allowed'
                              : selectedMall?.id === mall.id
                              ? 'bg-gradient-to-br from-red-600 to-orange-600 shadow-lg shadow-red-500/50 scale-105'
                              : 'bg-gray-800/50 hover:bg-gray-700/50 hover:scale-105'
                          }`}
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm md:text-base">{mall.name}</div>
                              <div className="text-xs md:text-sm text-gray-300 mt-1">{mall.location}</div>
                            </div>
                            {!available && (
                              <span className="text-xs text-red-400 font-semibold">Sold Out</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <Calendar className="text-red-500" size={20} />
                    <h2 className="text-xl md:text-2xl font-bold">Select Date</h2>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-3">
                    {dates.map((d, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(d)}
                        className={`p-2 md:p-4 rounded-lg md:rounded-xl transition-all duration-300 ${
                          selectedDate?.date === d.date
                            ? 'bg-gradient-to-br from-red-600 to-orange-600 shadow-lg shadow-red-500/50 scale-105'
                            : 'bg-gray-800/50 hover:bg-gray-700/50 hover:scale-105'
                        }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="text-xs text-gray-400">{d.day}</div>
                        <div className="text-lg md:text-2xl font-bold my-1">{d.date}</div>
                        <div className="text-xs text-gray-400">{d.month}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="text-red-500" size={24} />
                    <h2 className="text-2xl font-bold">Select Time</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {times.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => t.available && setSelectedTime(t)}
                        disabled={!t.available}
                        className={`p-4 rounded-xl font-semibold transition-all duration-300 ${
                          !t.available
                            ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                            : selectedTime?.id === t.id
                            ? 'bg-gradient-to-br from-red-600 to-orange-600 shadow-lg shadow-red-500/50 scale-105'
                            : 'bg-gray-800/50 hover:bg-gray-700/50 hover:scale-105'
                        }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        {t.time}
                        {!t.available && <div className="text-xs mt-1">Sold Out</div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Seat Selection */}
            {step === 2 && (
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 animate-slide-up">
                <h2 className="text-2xl font-bold mb-8 text-center">Select Your Seats</h2>
                
                {/* Screen with 3D effect */}
                <div className="mb-12 perspective-1000">
                  <div className="relative">
                    {/* Screen glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 to-transparent blur-2xl h-32 -top-8" />
                    {/* Screen */}
                    <div className="relative w-full max-w-4xl mx-auto">
                      <div className="h-3 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-t-full transform -rotate-x-12 shadow-lg shadow-gray-500/50" 
                           style={{ transform: 'perspective(1000px) rotateX(-15deg)' }} />
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
                          {/* Row Label - Left */}
                          <div className="w-6 sm:w-7 md:w-8 text-center font-bold text-gray-500 text-xs sm:text-sm">
                            {row}
                          </div>

                          {/* Left Section */}
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
                                  className={`w-4 h-4 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg transition-all duration-300 relative group ${getSeatColor(status)}`}
                                  title={seatId}
                                >
                                  {/* Seat tooltip */}
                                  <span className="absolute -top-6 sm:-top-7 md:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-[10px] sm:text-xs z-10">
                                    {seatId}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Aisle Gap */}
                          <div className="w-4 sm:w-6 md:w-8" />

                          {/* Center Section */}
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
                                  {/* Seat tooltip */}
                                  <span className="absolute -top-6 sm:-top-7 md:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-[10px] sm:text-xs z-10">
                                    {seatId}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Aisle Gap */}
                          <div className="w-4 sm:w-6 md:w-8" />

                          {/* Right Section */}
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
                                  {/* Seat tooltip */}
                                  <span className="absolute -top-6 sm:-top-7 md:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-[10px] sm:text-xs z-10">
                                    {seatId}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Row Label - Right */}
                          <div className="w-6 sm:w-7 md:w-8 text-center font-bold text-gray-500 text-xs sm:text-sm">
                            {row}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-row md:flex-wrap gap-8 justify-center pt-6 border-t border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gray-800 rounded-lg" />
                    <span className="text-xs md:text-sm text-gray-300 font-medium">Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg shadow-lg shadow-red-500/50" />
                    <span className="text-xs md:text-sm text-gray-300 font-medium">Selected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-black/50 rounded-lg" />
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
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method, idx) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-6 rounded-xl transition-all duration-300 border-2 ${
                            paymentMethod === method.id
                              ? 'border-red-500 bg-gray-800/50 scale-105'
                              : 'border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:scale-105'
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
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 animate-fade-in">
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
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br h-full from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 sticky top-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              
              {/* Movie Info */}
              <div className="mb-6">
                <img src={movie.image} alt={movie.title} className="w-full h-full object-cover rounded-lg mb-4" />
                <h4 className="font-bold text-2xl mb-2">{movie.title}</h4>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                  <span>{movie.duration}</span>
                  <span>{movie.rating}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-sm">
                {selectedMall && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mall:</span>
                    <span className="font-semibold text-right">{selectedMall.name}</span>
                  </div>
                )}
                {selectedDate && selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date & Time:</span>
                    <span className="font-semibold">
                      {selectedDate.month} {selectedDate.date}, {selectedTime.time}
                    </span>
                  </div>
                )}
                {selectedSeats.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Seats:</span>
                      <span className="font-semibold">{selectedSeats.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tickets:</span>
                      <span className="font-semibold">{selectedSeats.length} × ₱{movie.price}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-red-500">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {step < 3 ? (
                  <>
                    {step > 1 && (
                      <button
                        onClick={handleBack}
                        className="w-full px-6 py-3 border-2 border-gray-700 rounded-lg hover:border-red-500 hover:bg-red-900/10 transition-all duration-300 font-semibold"
                      >
                        Back
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        canProceed()
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg shadow-red-500/20 hover:shadow-red-500/40'
                          : 'bg-gray-700 cursor-not-allowed opacity-50'
                      }`}
                    >
                      Continue
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleBack}
                      className="w-full px-6 py-3 border-2 border-gray-700 rounded-lg hover:border-red-500 hover:bg-red-900/10 transition-all duration-300 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={!canProceed()}
                      className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        canProceed()
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg shadow-red-500/20 hover:shadow-red-500/40'
                          : 'bg-gray-700 cursor-not-allowed opacity-50'
                      }`}
                    >
                      Confirm Booking
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
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
          animation: fadeIn 0.6s ease-out;
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
      `}</style>
    </div>
  );
};

export default Checkout;