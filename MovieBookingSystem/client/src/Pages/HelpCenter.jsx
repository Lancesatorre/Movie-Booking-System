import React, { useState } from 'react';
import { Search, BookOpen, CreditCard, Ticket, Users, Settings, HelpCircle, ChevronRight, ChevronDown } from 'lucide-react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of using MoBook",
      articles: 12,
      color: "from-red-500 to-orange-500",
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click on the 'Sign Up' button in the top right corner, fill in your details including email and password, then verify your email address to activate your account."
        },
        {
          question: "What browsers are supported?",
          answer: "MoBook works best on the latest versions of Chrome, Firefox, Safari, and Edge. We also support mobile browsers on iOS and Android devices."
        },
        {
          question: "Is there a mobile app available?",
          answer: "Currently, MoBook is accessible via mobile browser. A dedicated mobile app is in development and will be available soon on both iOS and Android platforms."
        }
      ]
    },
    {
      icon: Ticket,
      title: "Booking Tickets",
      description: "How to book and manage your tickets",
      articles: 15,
      color: "from-orange-500 to-red-500",
      faqs: [
        {
          question: "How do I book a movie ticket?",
          answer: "Select your desired movie, choose a showtime, pick your seats from the interactive seat map, and proceed to payment. You'll receive a confirmation email with your ticket details."
        },
        {
          question: "Can I cancel or refund my booking?",
          answer: "Yes, you can cancel your booking before the showtime starts. Refunds are processed according to our cancellation policy, typically within 5-7 business days."
        },
        {
          question: "Can I change my seat after booking?",
          answer: "Yes, you can modify your seat selection by going to 'My Bookings' and clicking 'Change Seats'. This option is available up to 2 hours before the showtime."
        },
        {
          question: "How many tickets can I book at once?",
          answer: "You can book up to 10 tickets per transaction, subject to seat availability on the selected screen."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Payment & Billing",
      description: "Payment methods and billing issues",
      articles: 8,
      color: "from-red-600 to-orange-600",
      faqs: [
        {
          question: "What payment methods are accepted?",
          answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, PayPal, and various digital wallets including Apple Pay and Google Pay."
        },
        {
          question: "Why is my payment not going through?",
          answer: "Common reasons include insufficient funds, incorrect card details, or security restrictions. Please verify your payment information and try again. If the issue persists, contact your bank or try an alternative payment method."
        },
        {
          question: "When will I receive my refund?",
          answer: "Refunds are processed within 5-7 business days after cancellation approval. The exact time depends on your bank or card issuer."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, all payment transactions are encrypted and processed through secure payment gateways. We never store your full credit card information on our servers."
        }
      ]
    },
    {
      icon: Users,
      title: "Account Management",
      description: "Managing your MoBook account",
      articles: 10,
      color: "from-orange-600 to-red-600",
      faqs: [
        {
          question: "How do I reset my password?",
          answer: "Click on 'Forgot Password' on the login page, enter your registered email address, and follow the instructions sent to your email to create a new password."
        },
        {
          question: "Can I update my profile information?",
          answer: "Yes, go to 'My Account' in the menu, then click 'Edit Profile' to update your personal information, contact details, and preferences."
        },
        {
          question: "How do I delete my account?",
          answer: "To delete your account, go to 'Account Settings' and select 'Delete Account'. Please note that this action is permanent and will remove all your booking history."
        }
      ]
    },
    {
      icon: Settings,
      title: "Technical Support",
      description: "Troubleshooting and technical help",
      articles: 14,
      color: "from-red-500 to-orange-500",
      faqs: [
        {
          question: "The website is not loading properly. What should I do?",
          answer: "Try clearing your browser cache and cookies, or try accessing the site in incognito/private mode. Ensure you're using a supported browser and have a stable internet connection."
        },
        {
          question: "I didn't receive my booking confirmation email",
          answer: "Check your spam/junk folder first. If it's not there, log into your account and go to 'My Bookings' to view your ticket details. You can also resend the confirmation email from there."
        },
        {
          question: "The seat selection page is not responding",
          answer: "Refresh the page and try again. If the issue persists, try a different browser or clear your browser cache. Seats may also become temporarily unavailable if another user is selecting them."
        }
      ]
    },
    {
      icon: HelpCircle,
      title: "General Questions",
      description: "Common questions and answers",
      articles: 20,
      color: "from-orange-500 to-red-500",
      faqs: [
        {
          question: "What is MoBook?",
          answer: "MoBook is a comprehensive movie booking system that allows you to browse movies, select showtimes, choose seats, and book tickets online for theaters in your area."
        },
        {
          question: "How far in advance can I book tickets?",
          answer: "You can book tickets as soon as showtimes are published, typically up to 7-14 days in advance depending on the theater and movie."
        },
        {
          question: "What are the different seat types?",
          answer: "We offer Regular and VIP seats. VIP seats provide enhanced comfort and premium viewing experience at a higher price point. Seat type availability varies by screen."
        },
        {
          question: "Can I book tickets at the theater?",
          answer: "Yes, you can book tickets at the theater using our in-theater kiosks or at the box office counter. Online booking is recommended for better seat selection."
        }
      ]
    }
  ];

  const quickLinks = [
    { title: "Create an Account", icon: Users },
    { title: "Book Your First Ticket", icon: Ticket },
    { title: "Payment Options", icon: CreditCard },
    { title: "Contact Support", icon: HelpCircle }
  ];

  const toggleCategory = (index) => {
    setSelectedCategory(index);
  };

  const closeModal = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-[80vh] bg-transparent text-white pt-19">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Help
            <span className="block bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
              Center
            </span>
          </h1>
          <p className="text-sm md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Find answers to your questions and get the help you need
          </p>    
        </div>

        {/* Browse by Category */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              
              return (
                <div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-red-500/50 transition-all duration-300 overflow-hidden"
                >
                  {/* Category Header */}
                  <div
                    className="p-6 cursor-pointer group flex justify-center items-center flex-col"
                    onClick={() => toggleCategory(index)}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-red-500 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-400 mb-4">{category.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal for FAQs */}
        {selectedCategory !== null && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div 
              className="bg-gray-900 rounded-2xl border border-red-500/30 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {React.createElement(categories[selectedCategory].icon, {
                    size: 32,
                    className: "text-red-500"
                  })}
                  <div>
                    <h3 className="text-2xl text-left font-bold text-white">
                      {categories[selectedCategory].title}
                    </h3>
                    <p className="text-gray-400 text-left text-sm">
                      {categories[selectedCategory].description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors "
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {categories[selectedCategory].faqs.map((faq, faqIndex) => (
                  <div key={faqIndex} className="bg-gray-800/50 rounded-lg p-5 text-left hover:bg-gray-800/70 transition-colors">
                    <h4 className="font-semibold text-white mb-3 flex items-start text-lg">
                      <span className="text-red-500 mr-2 flex-shrink-0">Q:</span>
                      <span>{faq.question}</span>
                    </h4>
                    <p className="text-gray-300 pl-6 leading-relaxed">
                      <span className="text-orange-500 mr-2">A:</span>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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