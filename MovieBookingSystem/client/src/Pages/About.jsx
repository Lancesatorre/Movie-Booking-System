import React from 'react';
import { Target, Eye, Award, Heart, Users, Zap } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Every decision we make prioritizes the customer experience and satisfaction."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We constantly evolve with technology to provide cutting-edge booking solutions."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in every aspect of our service delivery."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building strong relationships with cinemas and movie enthusiasts worldwide."
    }
  ];

  const team = [
    { name: "Lance Timothy B. Satorre", role: "Lead Developer" },
    { name: "Euwen Aldrich D. Villarin", role: "Full Stack Developer" },
    { name: "Yvone Bardon", role: "UI/UX Designer" },
    { name: "Neri Sergio", role: "Backend Developer" }
  ];

  return (
    <div className="min-h-[80vh] bg-transparent text-white pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            About
            <span className="block bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
              MoBook
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Revolutionizing the way people book movie tickets with innovative technology and seamless user experience.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="inline-block p-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg mb-4">
              <Target size={40} />
            </div>
            <h2 className="text-4xl font-bold">Our Mission</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              To transform the cinema experience by making movie ticket booking effortless, accessible, and enjoyable for everyone. We believe that getting to the movies should be as entertaining as the movies themselves.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              MoBook was created with the vision of bridging the gap between movie enthusiasts and their favorite cinemas through technology that works seamlessly across all platforms.
            </p>
          </div>

          <div className="space-y-6">
            <div className="inline-block p-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg mb-4">
              <Eye size={40} />
            </div>
            <h2 className="text-4xl font-bold">Our Vision</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              To become the world's most trusted and user-friendly movie booking platform, empowering cinemas and delighting moviegoers with innovative features and exceptional service.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              We envision a future where booking movie tickets is instant, personalized, and perfectly integrated with the modern digital lifestyle.
            </p>
          </div>
        </div>

        {/* Statistics */}
        {/* <div className="grid grid-cols-2 gap-8 mb-20">
          {[
            { number: "50K+", label: "Active Users" },
            { number: "1M+", label: "Tickets Booked" }
                  ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div> */}

        {/* Team Section */}
        {/* <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-800">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
              Meet Our Team
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-gray-900/30 rounded-xl hover:bg-gray-900/50 transition-all duration-300"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div> */}
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

export default About;