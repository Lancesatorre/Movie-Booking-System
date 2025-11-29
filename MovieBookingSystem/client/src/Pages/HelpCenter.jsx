import React, { useState } from 'react';
import { Search, BookOpen, CreditCard, Ticket, Users, Settings, HelpCircle, ChevronRight } from 'lucide-react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of using MoBook",
      articles: 12,
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Ticket,
      title: "Booking Tickets",
      description: "How to book and manage your tickets",
      articles: 15,
      color: "from-orange-500 to-red-500"
    },
    {
      icon: CreditCard,
      title: "Payment & Billing",
      description: "Payment methods and billing issues",
      articles: 8,
      color: "from-red-600 to-orange-600"
    },
    {
      icon: Users,
      title: "Account Management",
      description: "Managing your MoBook account",
      articles: 10,
      color: "from-orange-600 to-red-600"
    },
    {
      icon: Settings,
      title: "Technical Support",
      description: "Troubleshooting and technical help",
      articles: 14,
      color: "from-red-500 to-orange-500"
    },
    {
      icon: HelpCircle,
      title: "General Questions",
      description: "Common questions and answers",
      articles: 20,
      color: "from-orange-500 to-red-500"
    }
  ];

  const popularArticles = [
    {
      title: "How do I book a movie ticket?",
      category: "Booking Tickets",
      views: "15.2K views"
    },
    {
      title: "What payment methods are accepted?",
      category: "Payment & Billing",
      views: "12.8K views"
    },
    {
      title: "How do I cancel or refund my booking?",
      category: "Booking Tickets",
      views: "11.5K views"
    },
    {
      title: "Can I change my seat after booking?",
      category: "Booking Tickets",
      views: "9.3K views"
    },
    {
      title: "How do I reset my password?",
      category: "Account Management",
      views: "8.7K views"
    },
    {
      title: "Why is my payment not going through?",
      category: "Payment & Billing",
      views: "7.9K views"
    }
  ];

  const quickLinks = [
    { title: "Create an Account", icon: Users },
    { title: "Book Your First Ticket", icon: Ticket },
    { title: "Payment Options", icon: CreditCard },
    { title: "Contact Support", icon: HelpCircle }
  ];

  return (
    <div className="min-h-[80vh] bg-transparent text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            Help
            <span className="block bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
              Center
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Find answers to your questions and get the help you need
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {quickLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <button
                key={index}
                className="p-4 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 hover:border-red-500/50 transition-all duration-300 text-center group"
              >
                <IconComponent size={24} className="mx-auto mb-2 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-300">{link.title}</span>
              </button>
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
    </div>
  );
};

export default HelpCenter;