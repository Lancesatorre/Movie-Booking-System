import React from 'react';
import { Ticket, Smartphone, Lock, Armchair, Clock, CreditCard, Users, Star } from 'lucide-react';

const Features = () => {
  const mainFeatures = [
    {
      title: "Easy Booking",
      description: "Book tickets in just a few clicks with our intuitive interface. No complicated forms or lengthy processes.",
      icon: Ticket,
      color: "from-red-500 to-orange-500"
    },
    {
      title: "Multiple Platforms",
      description: "Access MoBook via desktop, mobile. Seamless experience across all devices.",
      icon: Smartphone,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Secure Payment",
      description: "Safe and reliable payment processing with industry-standard encryption and security measures.",
      icon: Lock,
      color: "from-red-600 to-orange-600"
    },
    {
      title: "Real-time Seats",
      description: "View available seats in real-time with interactive seat selection and instant updates.",
      icon: Armchair,
      color: "from-orange-600 to-red-600"
    },
    {
      title: "Quick Checkout",
      description: "Complete your booking in under 60 seconds with our streamlined checkout process.",
      icon: Clock,
      color: "from-red-500 to-orange-500"
    },
    {
      title: "Group Booking",
      description: "Book multiple seats together for friends and family with our group booking feature.",
      icon: Users,
      color: "from-red-600 to-orange-600"
    }
  ];

  const additionalFeatures = [
    "Booking history and receipt management",
    "Movie detailed information",
    "Theater location and directions",
    "Accessibility options for all users",
    "Refund and cancellation policies"
  ];

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Powerful
            <span className="block bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
              Features
            </span>
          </h1>
          <p className="text-sm md:text-xl text-gray-400 max-w-3xl mx-auto">
            Discover everything MoBook has to offer. Built with modern technology to give you the best movie booking experience.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="group relative"
                style={{ animation: `fadeInUp 0.6s ease-out ${index * 100}ms both` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`} />
                <div className="relative bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800 group-hover:border-red-500/50 transition-all duration-300 h-full">
                  <div className={`inline-block p-4 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                    <IconComponent size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl px-5 py-12 border border-gray-800">
          <h2 className="text-4xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
              And Much More...
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {additionalFeatures.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default Features;