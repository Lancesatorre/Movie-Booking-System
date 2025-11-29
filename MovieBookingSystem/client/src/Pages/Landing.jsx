import React, { useState, useEffect } from 'react';
import { ChevronDown, Ticket, Smartphone, Lock, Armchair, Menu, X } from 'lucide-react';
import { useNavigate  } from 'react-router-dom';

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  const handleBookTickets = () => {
    navigate('/movies');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: "Easy Booking",
      description: "Book tickets in just a few clicks",
      icon: Ticket,
      delay: 0
    },
    {
      title: "Multiple Platforms",
      description: "Access via desktop, mobile, or theater kiosk",
      icon: Smartphone,
      delay: 100
    },
    {
      title: "Secure Payment",
      description: "Safe and reliable payment processing",
      icon: Lock,
      delay: 200
    },
    {
      title: "Real-time Seats",
      description: "View available seats in real-time",
      icon: Armchair,
      delay: 300
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mb-6 inline-block">
            <span className="px-4 py-2 rounded-full bg-red-900/30 border border-red-500/50 text-red-300 text-sm font-semibold">
              ✨ The Future of Movie Booking
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            Your Ultimate
            <span className="block bg-gradient-to-r from-red-700 to-orange-600/20   bg-clip-text text-transparent">
              Movie Experience
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Book tickets, choose your seats, and enjoy the show with MoBook — the modern movie booking system designed for today's cinemas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={handleBookTickets}
              className="group px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-300 text-lg font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
            >
              Book Tickets Now
            </button>
            <button className="px-8 py-4 border-2 border-red-500/50 rounded-lg hover:border-red-500 hover:bg-red-900/10 transition-all duration-300 text-lg font-semibold">
              My Tickets
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <ChevronDown className="mx-auto text-red-500" size={24} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Why Choose MoBook?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience seamless movie booking with our advanced features designed for both customers and theater staff.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((Feature, index) => {
              const IconComponent = Feature.icon;
              return (
                <div 
                  key={index}
                  className="group relative"
                  style={{ animation: `fadeInUp 0.6s ease-out ${Feature.delay}ms both` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  <div className="relative bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800 group-hover:border-red-500/50 transition-all duration-300 h-full">
                    <div className="text-5xl flex justify-center mb-4 text-red-500 group-hover:text-orange-500 transition-colors duration-300 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                      <IconComponent size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">{Feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{Feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Cinema Experience?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">Join thousands of cinema-goers who've already discovered the easiest way to book tickets.</p>
          <button 
            onClick={handleBookTickets}
            className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-300 text-lg font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-black border-t border-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-4">
                MoBook
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Your ultimate movie booking experience
              </p>
            </div>
            
            <div className='text-center  md:text-right'>
              <h4 className="text-lg font-semibold mb-4 text-red-500">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <button onClick={() => handleNavigation('/movies')} className="hover:text-red-500 transition-colors">
                    Movies
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/features')} className="hover:text-red-500 transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/about')} className="hover:text-red-500 transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/contact')} className="hover:text-red-500 transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            
            <div className='text-center  md:text-right'>
              <h4 className="text-lg font-semibold mb-4 text-red-500">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <button onClick={() => handleNavigation('/help-center')} className="hover:text-red-500 transition-colors">
                    Help Center
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/faq')} className="hover:text-red-500 transition-colors">
                    FAQ
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/contact')} className="hover:text-red-500 transition-colors">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/privacy-policy')} className="hover:text-red-500 transition-colors">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            
            <div className='text-center  md:text-right'>
              <h4 className="text-lg font-semibold mb-4 text-red-500">Contact Info</h4>
              <ul className="space-y-3 text-gray-400">
                <li>MoBook@gmail.com</li>
                <li>(+63) 923 1324 213</li>
                <li>University of Cebu Main Campus</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 space-y-2">
            <p>&copy; 2024 MoBook Movie Booking System. All rights reserved.</p>
            <p className="text-sm">Developed by: Lance Timothy B. Satorre, Euwen Aldrich D. Villarin, Yvone Bardon, Neri Sergio</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;