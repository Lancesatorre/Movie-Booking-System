import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import icon from "/assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    email: 'lanceerrotas@gmail.com',
    password: '',
    confirmPassword: '',
    firstName: '',
    middleName: '',
    lastName: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!formData.email || !formData.password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      console.log('Login attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/Home');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      alert('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    // Validate phone number (exactly 11 digits for Philippines)
    if (!/^\d{11}$/.test(formData.phone)) {
      alert('Please enter a valid 11-digit phone number');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Signup attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      // After successful signup, you can redirect or show success message
      alert('Account created successfully! You can now login.');
      handleBackToLogin();
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        middleName: '',
        lastName: '',
        phone: ''
      });
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsSignup(true);
      setIsAnimating(false);
    }, 300);
  };

  const handleBackToLogin = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsSignup(false);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col xl:flex-row">
      {/* Left Side - Background with Animation */}
      <div className={`flex items-center justify-center relative bg-gradient-to-br from-black via-[#1a0000] to-red-900 overflow-hidden transition-all duration-500 ease-in-out ${
        isSignup 
          ? 'w-full xl:w-full min-h-screen' 
          : 'w-full xl:w-1/2 xl:rounded-r-[90px] min-h-[10vh] xl:min-h-screen '
      } ${isAnimating ? 'opacity-90' : 'opacity-100'}`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-red-900/10 blur-3xl z-0"></div>
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        {/* Floating Animated Orbs */}
        <div className="absolute top-10 left-10 w-20 h-20 xl:top-20 xl:left-20 xl:w-32 xl:h-32 bg-red-500/20 rounded-full blur-xl xl:blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-16 right-16 w-24 h-24 xl:bottom-32 xl:right-32 xl:w-40 xl:h-40 bg-purple-500/10 rounded-full blur-xl xl:blur-2xl animate-float-medium"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 xl:top-1/2 xl:left-1/3 xl:w-24 xl:h-24 bg-orange-500/15 rounded-full blur-lg xl:blur-xl animate-float-fast"></div>
        <div className="absolute bottom-10 left-1/5 w-20 h-20 xl:bottom-20 xl:left-1/4 xl:w-36 xl:h-36 bg-pink-500/10 rounded-full blur-xl xl:blur-2xl animate-float-slow"></div>
        <div className="absolute top-20 right-20 w-16 h-16 xl:top-40 xl:right-40 xl:w-28 xl:h-28 bg-yellow-500/5 rounded-full blur-lg xl:blur-xl animate-float-medium"></div>

        {/* Pulsing Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-purple-500/5 animate-pulse-slow"></div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer"></div>

        {/* Content */}
        <div className={`relative z-10 w-full max-w-4xl px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col items-center justify-center text-center gap-6 lg:gap-10 xl:gap-16 py-8 lg:py-12 transition-all duration-500 ease-in-out ${
          isSignup 
            ? 'opacity-0 scale-95' 
            : 'opacity-100 scale-100'
        }`}>
          <div className="flex flex-col items-center gap-3 lg:gap-5 xl:gap-6">
            <div className="flex items-center gap-3 lg:gap-4 xl:gap-5">
              <img 
                src={icon} 
                alt="MoBook Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-[8vh] xl:h-[8vh]" 
              />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent animate-glow">
                MoBook
              </h1>
            </div>
          </div>
          
          <div className="hidden xl:flex flex-col items-center font-light gap-2 lg:gap-3 xl:gap-4 animate-fade-in-up">
            <span className="text-white text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-7xl">Welcome.</span>
            <span className="text-white text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-5xl leading-tight px-2 sm:px-4 lg:px-6 xl:px-0 max-w-2xl xl:max-w-4xl">
              Begin your cinematic adventure now with our ticketing platform!
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      {!isSignup ? (
        // Login Form
        <div className={`flex-1 w-full xl:w-1/2 flex items-center justify-center backdrop-blur-sm py-8 lg:py-12 xl:py-0 transition-all duration-500 ease-in-out ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl rounded-xl xl:rounded-2xl bg-gradient-to-br from-black via-[#1a0000] to-red-900 space-y-6 lg:space-y-8 xl:space-y-8 p-6 sm:p-8 lg:p-10 xl:p-12 mx-4 sm:mx-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-semibold text-gray-300">
                Login to your account
              </h2>
            </div>

            <form className="space-y-4 lg:space-y-6 xl:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3 flex text-left flex-col">
                <div>
                  <label htmlFor="email" className="block text-sm lg:text-base font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-sm sm:text-base lg:text-base"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm lg:text-base font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-sm sm:text-base lg:text-base"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 sm:py-3 lg:py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm sm:text-base lg:text-base ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer hover:scale-105 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>

              <div className="text-center mt-4 lg:mt-6 xl:mt-6">
                <p className="text-gray-400 text-sm sm:text-base lg:text-base">
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={handleSignupClick}
                    className="text-red-500 hover:text-red-400 font-medium transition-colors focus:outline-none"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      ) : (
        // Signup Form - Centered on full width
        <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-500 ease-in-out ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-2xl bg-gray-100 space-y-6 lg:space-y-8 p-6 sm:p-8 lg:p-10 xl:p-12 mx-4 sm:mx-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800">
                Create your account
              </h2>
              <p className="text-gray-700 mt-2 text-sm sm:text-base">
                Join MoBook and start your cinematic journey
              </p>
            </div>

            <form className="space-y-4 lg:space-y-6" onSubmit={handleSignupSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                <div className="sm:col-span-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-800 mb-2">
                    First Name:
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-sm sm:text-base"
                    placeholder="First name"
                    required
                  />
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="middleName" className="block text-sm font-medium text-gray-800 mb-2">
                    Middle Name:
                  </label>
                  <input
                    id="middleName"
                    name="middleName"
                    type="text"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-sm sm:text-base"
                    placeholder="Middle name"
                  />
                </div>

                <div className="sm:col-span-1 lg:col-span-1">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-800 mb-2">
                    Last Name:
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-sm sm:text-base"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="signupEmail" className="text-left block text-sm font-medium text-gray-800 mb-2">
                    Email Address:
                  </label>
                  <input
                    id="signupEmail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="text-left block text-sm font-medium text-gray-800 mb-2">
                    Phone Number:
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      // Only allow numbers and limit to 11 digits for Philippines
                      const value = e.target.value.replace(/[^\d]/g, '').slice(0, 11);
                      setFormData({
                        ...formData,
                        phone: value
                      });
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-sm sm:text-base"
                    placeholder="(+63) 912 345 6789"
                    pattern="[0-9]{11}"
                    title="Please enter 11 digits only (no letters or special characters)"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="text-left block text-sm font-medium text-gray-800 mb-2">
                    Password:
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your password"
                    minLength="6"
                    required
                  />
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="text-left block text-sm font-medium text-gray-800 mb-2">
                    Confirm Password:
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword || ''}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-sm sm:text-base"
                    placeholder="Confirm your password"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-3 px-4 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-700 text-sm sm:text-base ${
                    isLoading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer hover:scale-105 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base cursor-pointer hover:scale-105 active:scale-95"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}