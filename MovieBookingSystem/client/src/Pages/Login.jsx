import React, { useState } from 'react';
import { Mail, Lock, Phone, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSuccessLoading, setIsSuccessLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    middleName: '',
    lastName: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateLoginForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  console.log();
  
  const validateSignupForm = () => {
    const errors = {};
    
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{11}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be 11 digits';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Login attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Signup attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccessLoading(true);
      
      setTimeout(() => {
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          middleName: '',
          lastName: '',
          phone: ''
        });
        
        setFormErrors({});
        handleBackToLogin();
        setIsSuccessLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = () => {
    setFormErrors({});
    setIsAnimating(true);
    setTimeout(() => {
      setIsSignup(true);
      setIsAnimating(false);
    }, 300);
  };

  const handleBackToLogin = () => {
    setFormErrors({});
    setIsAnimating(true);
    setTimeout(() => {
      setIsSignup(false);
      setIsAnimating(false);
    }, 300);
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 text-base backdrop-blur-sm";
    const errorClass = formErrors[fieldName] ? "border-red-500/50" : "border-gray-700";
    return `${baseClass} ${errorClass}`;
  };

  const getSignupInputClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all duration-200 text-sm";
    const errorClass = formErrors[fieldName] ? "border-red-500/70" : "border-gray-600";
    return `${baseClass} ${errorClass}`;
  };

  return (
    <div className="min-h-screen flex flex-col xl:flex-row bg-black overflow-hidden">
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-30px) translateX(10px); }
          66% { transform: translateY(30px) translateX(-10px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(220, 38, 38, 0.3); }
          50% { text-shadow: 0 0 30px rgba(220, 38, 38, 0.6); }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 3s infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
      `}</style>

      {/* Left Side - Hero Section */}
      <div className={`hidden xl:flex xl:w-1/2 relative bg-gradient-to-br from-black via-red-950/20 to-black overflow-hidden items-center justify-center transition-all duration-500 ease-in-out`}>
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10 blur-3xl" />
          
          {/* Animated Orbs */}
          <div className="absolute top-20 left-20 w-80 h-80 bg-red-500/15 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-32 right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float-medium" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-2xl animate-float-fast" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent skew-x-12 animate-shimmer" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 space-y-8">
          <div className="space-y-4">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent animate-glow">
              MoBook
            </h1>
            <p className="text-3xl font-light text-gray-200">Welcome.</p>
          </div>
          
          <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed animate-fade-in-up">
            Begin your cinematic adventure now with our premium ticketing platform. Book, select, and enjoy.
          </p>

          <div className="pt-8 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm text-gray-500 uppercase tracking-widest">Your journey starts here</p>
            <div className="flex justify-center">
              <ArrowRight className="text-red-500 animate-bounce" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side / Mobile - Login Form */}
      {!isSignup ? (
        <div className={`flex-1 flex items-center justify-center w-full xl:w-1/2 py-12 xl:py-0 px-4 transition-all duration-500 ease-in-out ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          <div className="w-full max-w-md">
            {/* Logo for Mobile */}
            <div className="xl:hidden text-center mb-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">
                MoBook
              </h1>
            </div>

            <div className="space-y-2 mb-8 text-center">
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="text-gray-400">Login to your MoBook account</p>
            </div>

            <div className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-500" size={20} />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${getInputClassName('email')} pl-10`}
                    placeholder="you@example.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <span>•</span> {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${getInputClassName('password')} pl-10`}
                    placeholder="••••••••"
                  />
                </div>
                {formErrors.password && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <span>•</span> {formErrors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                  isLoading 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:shadow-red-500/30 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            {/* Signup Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <button 
                  onClick={handleSignupClick}
                  className="text-red-500 hover:text-red-400 font-semibold transition-colors"
                >
                  Sign up now
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Signup Form
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-500 ease-in-out ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        } bg-black/60 backdrop-blur-sm`}>
          <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl">
            {/* Success Loading Overlay */}
            {isSuccessLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/95 to-gray-100/95 flex items-center justify-center rounded-2xl z-10 flex-col gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin" />
                  <CheckCircle2 className="absolute inset-0 m-auto text-green-500 animate-pulse" size={32} />
                </div>
                <div className="text-center">
                  <p className="text-gray-800 font-semibold text-lg">Account Created!</p>
                  <p className="text-gray-600 text-sm mt-2">Redirecting to login...</p>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="p-8 lg:p-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-600 mt-2">Join MoBook and start your cinematic journey</p>
              </div>

              <div className="space-y-6 text-left" onSubmit={handleSignupSubmit}>
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`${getSignupInputClassName('firstName')} pl-10 text-white`}
                        placeholder=""
                        disabled={isSuccessLoading}
                      />
                    </div>
                    {formErrors.firstName && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <span>•</span> {formErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                    <input
                      name="middleName"
                      type="text"
                      value={formData.middleName}
                      onChange={handleChange}
                      className={`${getSignupInputClassName('middleName')} text-white`}
                      placeholder=""
                      disabled={isSuccessLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`${getSignupInputClassName('lastName')} pl-10 text-white`}
                        placeholder=""
                        disabled={isSuccessLoading}
                      />
                    </div>
                    {formErrors.lastName && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <span>•</span> {formErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${getSignupInputClassName('email')} pl-10 text-white`}
                      placeholder="you@example.com"
                      disabled={isSuccessLoading}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <span>•</span> {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '').slice(0, 11);
                        setFormData({ ...formData, phone: value });
                        if (formErrors.phone) {
                          setFormErrors({ ...formErrors, phone: '' });
                        }
                      }}
                      className={`${getSignupInputClassName('phone')} pl-10 text-white`}
                      placeholder="09123456789"
                      disabled={isSuccessLoading}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <span>•</span> {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${getSignupInputClassName('password')} pl-10 text-white`}
                        placeholder="••••••••"
                        disabled={isSuccessLoading}
                      />
                    </div>
                    {formErrors.password && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <span>•</span> {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`${getSignupInputClassName('confirmPassword')} pl-10 text-white`}
                        placeholder="••••••••"
                        disabled={isSuccessLoading}
                      />
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <span>•</span> {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSignupSubmit}
                    disabled={isLoading || isSuccessLoading}
                    className={`flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                      isLoading || isSuccessLoading
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:shadow-lg hover:shadow-red-500/20 active:scale-95'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <button
                    onClick={handleBackToLogin}
                    disabled={isSuccessLoading}
                    className={`flex-1 py-3 px-4 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                      isSuccessLoading
                        ? 'opacity-70 cursor-not-allowed'
                        : 'active:scale-95'
                    }`}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}