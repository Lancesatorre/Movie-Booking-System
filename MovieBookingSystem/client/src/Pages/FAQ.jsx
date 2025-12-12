import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const faqCategories = [
    {
      category: "Booking & Tickets",
      questions: [
        {
          question: "How do I book a movie ticket?",
          answer: "Simply browse available movies, select your preferred showtime, choose your seats on the interactive seating map, and proceed to payment. You'll receive a confirmation email with your e-ticket immediately after successful payment."
        },
        {
          question: "Can I cancel or modify my booking?",
          answer: "Yes, you can cancel or modify your booking up to 2 hours before the showtime. Go to 'My Bookings', select the ticket you want to modify, and choose either 'Cancel' or 'Modify'. Cancellation charges may apply based on the cinema's policy."
        },
        {
          question: "How do I select my seats?",
          answer: "After selecting a movie and showtime, you'll see an interactive seating chart. Green seats are available, red seats are taken, and blue seats are premium. Click on your preferred seats to select them. You can select multiple seats for group bookings."
        },
        {
          question: "What happens if the show gets cancelled?",
          answer: "If a show is cancelled by the cinema, you'll be notified immediately via email and SMS. A full refund will be processed automatically to your original payment method within 5-7 business days."
        }
      ]
    },
    {
      category: "Payment & Refunds",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express), digital wallets (PayPal, Apple Pay, Google Pay), and cinema gift cards. All transactions are secured with industry-standard encryption."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, absolutely. We use PCI-DSS compliant payment gateways and SSL encryption to protect your payment information. We never store your complete card details on our servers."
        },
        {
          question: "How long does it take to process a refund?",
          answer: "Refunds are initiated immediately upon cancellation approval. The amount will reflect in your account within 5-7 business days, depending on your bank or payment provider's processing time."
        },
        {
          question: "Can I get a refund if I miss my show?",
          answer: "Unfortunately, tickets are non-refundable after the showtime has passed. However, if you cancel at least 2 hours before the showtime, you can get a refund based on the cinema's cancellation policy."
        }
      ]
    },
    {
      category: "Account & Profile",
      questions: [
        {
          question: "Do I need to create an account to book tickets?",
          answer: "While you can book as a guest, creating an account offers benefits like booking history, faster checkout, saved payment methods, exclusive offers, and loyalty rewards."
        },
        {
          question: "How do I reset my password?",
          answer: "Click on 'Forgot Password' on the login page, enter your registered email address, and you'll receive a password reset link. Follow the link and create a new password."
        },
        {
          question: "Can I update my profile information?",
          answer: "Yes, you can update your profile information anytime by going to 'My Account' > 'Profile Settings'. You can change your name, email, phone number, and password."
        },
        {
          question: "How do I delete my account?",
          answer: "To delete your account, go to 'Account Settings' > 'Privacy' > 'Delete Account'. Please note this action is permanent and will remove all your booking history and saved preferences."
        }
      ]
    },
    {
      category: "Technical Issues",
      questions: [
        {
          question: "My payment went through but I didn't receive a confirmation",
          answer: "Check your spam/junk folder first. If you still can't find it, contact our support team with your transaction ID and registered email. We'll resend your confirmation and e-ticket immediately."
        },
        {
          question: "The website is not loading properly",
          answer: "Try clearing your browser cache and cookies, or try accessing the site from a different browser. If the issue persists, you can use our mobile app or contact technical support."
        },
        {
          question: "I can't see available seats",
          answer: "This could be due to network connectivity issues. Refresh the page and try again. If the issue continues, try a different browser or clear your browser cache. You can also try booking via our mobile app."
        },
        {
          question: "Why can't I apply my promo code?",
          answer: "Ensure the promo code is still valid and hasn't expired. Check if it applies to the movie or cinema you've selected. Some promo codes have specific terms and conditions. If everything looks correct but it still doesn't work, contact support."
        }
      ]
    },
    {
      category: "General Questions",
      questions: [
        {
          question: "Can I book tickets for multiple movies at once?",
          answer: "Currently, you need to complete one booking before starting another. However, you can book multiple seats for the same show in a single transaction."
        },
        {
          question: "Do you offer group booking discounts?",
          answer: "Yes, group discounts are available for bookings of 10 or more tickets. Contact our corporate booking team for special rates and arrangements."
        },
        {
          question: "Can I gift movie tickets to someone?",
          answer: "Yes! After booking, you can forward the e-ticket to anyone via email. You can also purchase digital gift cards that recipients can use to book their own tickets."
        },
        {
          question: "Are there any booking fees?",
          answer: "A small convenience fee is added to each booking to cover payment processing and service costs. The total amount including all fees will be displayed before you complete your payment."
        }
      ]
    }
  ];

  const toggleAccordion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Frequently Asked
            <span className="block bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-sm md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Find quick answers to common questions about MoBook
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white"
            />
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredFAQs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <h2 className="text-2xl font-bold text-left">
                <span className="bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
                  {category.category}
                </span>
              </h2>
              
              <div className="space-y-3">
                {category.questions.map((faq, questionIndex) => {
                  const index = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openIndex === index;
                  
                  return (
                    <div
                      key={questionIndex}
                      className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden hover:border-red-500/50 transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleAccordion(categoryIndex, questionIndex)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-900/30 transition-colors"
                      >
                        <span className="font-semibold text-lg pr-4">{faq.question}</span>
                        <ChevronDown
                          size={24}
                          className={`text-red-500 flex-shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-gray-800/50">
                          <p className="pt-4 text-left">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">No FAQs found matching your search.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-red-500 hover:text-red-400 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQ;