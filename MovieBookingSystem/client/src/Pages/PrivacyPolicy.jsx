import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, Globe, AlertCircle, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Personal information (name, email, phone number) when you create an account",
        "Payment information processed through secure third-party payment gateways",
        "Booking history and preferences to improve your experience",
        "Device information and browsing data for analytics and security",
        "Location data (with your permission) to show nearby cinemas"
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "Process your movie ticket bookings and send confirmations",
        "Provide customer support and respond to your inquiries",
        "Send important updates about your bookings and account",
        "Improve our services through analytics and user feedback",
        "Personalize your experience with relevant movie recommendations",
        "Prevent fraud and ensure platform security"
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "We use industry-standard SSL encryption for all data transmission",
        "Payment information is processed through PCI-DSS compliant gateways",
        "Regular security audits and vulnerability assessments",
        "Restricted access to personal data on a need-to-know basis",
        "Secure servers with advanced firewall protection",
        "Regular data backups to prevent data loss"
      ]
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: [
        "Access your personal data and download a copy anytime",
        "Request corrections to inaccurate or incomplete data",
        "Delete your account and associated data permanently",
        "Opt-out of marketing communications while keeping your account",
        "Withdraw consent for data processing where applicable",
        "File complaints with relevant data protection authorities"
      ]
    },
    {
      icon: Globe,
      title: "Data Sharing",
      content: [
        "We do NOT sell your personal information to third parties",
        "Partner cinemas receive minimal booking information to fulfill services",
        "Payment processors handle transactions securely and independently",
        "Analytics providers help us improve services with anonymized data",
        "Legal authorities may access data when required by law",
        "Service providers bound by strict confidentiality agreements"
      ]
    },
    {
      icon: AlertCircle,
      title: "Cookies & Tracking",
      content: [
        "Essential cookies for site functionality and security",
        "Analytics cookies to understand how you use our platform",
        "Preference cookies to remember your settings and choices",
        "Marketing cookies for personalized advertisements (with consent)",
        "You can manage cookie preferences in your browser settings",
        "Some features may not work properly without essential cookies"
      ]
    }
  ];

  const highlights = [
    { icon: Shield, text: "Your data is encrypted and protected" },
    { icon: Lock, text: "Secure payment processing" },
    { icon: Eye, text: "Transparent data practices" },
    { icon: Mail, text: "Easy contact for privacy concerns" }
  ];

  return (
    <div className="min-h-[80vh] bg-transparent text-white pt-24 ">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mb-6">
            <Shield size={48} />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            Privacy
            <span className="block bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-gray-500">Last Updated: November 2024</p>
        </div>

        {/* Key Highlights */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:px-20 mb-16">
          {highlights.map((highlight, index) => {
            const IconComponent = highlight.icon;
            return (
              <div
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 text-center"
              >
                <IconComponent size={32} className="mx-auto mb-3 text-red-500" />
                <p className="text-sm text-gray-300">{highlight.text}</p>
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
    </div>
  );
};

export default PrivacyPolicy;