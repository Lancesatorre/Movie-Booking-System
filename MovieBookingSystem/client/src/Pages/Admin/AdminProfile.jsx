import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Edit2, Save, X, Eye, EyeOff, Shield, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost/mobook_api";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [errorMsg, setErrorMsg] = useState(''); // UI error message

  // Original admin data
  const [originalData, setOriginalData] = useState({
    id: 1,
    name: '',
    email: '',
    mobile: '',
    password: '********',
    role: 'System Administrator',
    createdAt: ''
  });

  // Editable admin data
  const [userData, setUserData] = useState({
    ...originalData,
    newPassword: '',
    confirmPassword: ''
  });

  // Load admin profile from DB
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/get_admin_profile.php`);
        const data = await res.json();

        if (data.success) {
          setOriginalData({
            ...data.admin,
            password: '********'
          });

          setUserData({
            ...data.admin,
            password: '********',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          // show fetch error as alert (optional) and console
          alert(data.message || "Failed to load admin profile");
          console.error(data.message || "Failed to load admin profile");
        }
      } catch (err) {
        console.error("Admin profile fetch error:", err);
      }
    };

    fetchAdminProfile();
  }, []);

  // Check if there are any changes
  useEffect(() => {
    const changed =
      userData.name !== originalData.name ||
      userData.email !== originalData.email ||
      userData.mobile !== originalData.mobile ||
      userData.newPassword !== '';

    setHasChanges(changed);
  }, [userData, originalData]);

  // Check if passwords match when in edit mode
  useEffect(() => {
    if (isEditing) {
      if (userData.newPassword === '' && userData.confirmPassword === '') {
        setPasswordsMatch(true);
      } else {
        setPasswordsMatch(userData.newPassword === userData.confirmPassword);
      }
    }
  }, [userData.newPassword, userData.confirmPassword, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setErrorMsg('');
    setUserData(prev => ({
      ...prev,
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleCancel = () => {
    setErrorMsg('');
    setUserData({
      ...originalData,
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setHasChanges(false);
    setShowPassword({
      newPassword: false,
      confirmPassword: false
    });
    setPasswordsMatch(true);
  };

  const handleSave = async () => {
    if (!passwordsMatch) return;

    setIsSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        id: originalData.id || 1,
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        newPassword: userData.newPassword || ""
      };

      const res = await fetch(`${API_BASE}/update_admin_profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        const updatedData = {
          ...originalData,
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          password: userData.newPassword ? "••••••••" : originalData.password
        };

        setOriginalData(updatedData);
        setUserData({
          ...updatedData,
          newPassword: "",
          confirmPassword: ""
        });

        setIsEditing(false);
        setHasChanges(false);
        setShowPassword({ newPassword: false, confirmPassword: false });
        setPasswordsMatch(true);
        setErrorMsg('');
      } else {
        setErrorMsg(data.message || "Update failed");
        console.error(data.message || "Update failed");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      console.error("Admin save error:", err);
    }

    setIsSaving(false);
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleBackClick = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#1d1a1a] to-red-900  text-white p-6 md:px-6 md:p-0 md:pb-6 md:pt-2">
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="mb-4 mt-2 flex items-center gap-2 px-4 py-2 bg-black/50 rounded-lg border border-red-900/30 hover:border-red-600/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
        <span>Back to Dashboard</span>
      </button>

      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
            </div>
            <h1 className="text-4xl font-bold">Admin Profile</h1>
          </div>
          <p className="text-gray-400 ">Manage your administrator account settings</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-gradient-to-br from-black/95 via-red-950/20 to-black/95 backdrop-blur-md rounded-2xl border border-red-900/30 overflow-hidden shadow-2xl shadow-red-900/10">
          {/* Profile Header Banner */}
          <div className="relative h-32 bg-gradient-to-r from-red-600/30 via-red-700/20 to-red-600/30 border-b border-red-900/30">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-2xl shadow-red-500/30 border-4 border-black">
                {userData.name.charAt(0)}
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="pt-20 pb-8 px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h2 className="text-left text-3xl font-bold mb-2">{userData.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-red-500" />
                    <span>{userData.role}</span>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group"
                >
                  <Edit2 size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <User size={16} className="text-red-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 bg-black/40 border rounded-lg text-white transition-all duration-300 ${
                    isEditing
                      ? 'border-red-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:bg-black/60'
                      : 'border-red-900/30 cursor-not-allowed opacity-70'
                  } outline-none`}
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Mail size={16} className="text-red-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 bg-black/40 border rounded-lg text-white transition-all duration-300 ${
                    isEditing
                      ? 'border-red-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:bg-black/60'
                      : 'border-red-900/30 cursor-not-allowed opacity-70'
                  } outline-none`}
                />
              </div>

              {/* Mobile Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Phone size={16} className="text-red-500" />
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={userData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 bg-black/40 border rounded-lg text-white transition-all duration-300 ${
                    isEditing
                      ? 'border-red-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:bg-black/60'
                      : 'border-red-900/30 cursor-not-allowed opacity-70'
                  } outline-none`}
                />
              </div>

              {/* Role Field (Read-only) */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Shield size={16} className="text-red-500" />
                  Administrator Role
                </label>
                <input
                  type="text"
                  value={userData.role}
                  disabled={true}
                  className="w-full px-4 py-3 bg-black/40 border border-red-900/30 rounded-lg text-white cursor-not-allowed opacity-70 outline-none"
                />
              </div>

              {/* Password Section */}
              {!isEditing ? (
                <div className="space-y-2 lg:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                    <Lock size={16} className="text-red-500" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={userData.password}
                    disabled={true}
                    className="w-full px-4 py-3 bg-black/40 border border-red-900/30 rounded-lg text-white cursor-not-allowed opacity-70 outline-none"
                  />
                </div>
              ) : (
                <>
                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                      <Lock size={16} className="text-red-500" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.newPassword ? "text" : "password"}
                        value={userData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 bg-black/40 border border-red-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:bg-black/60 rounded-lg text-white outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('newPassword')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        {showPassword.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                      <Lock size={16} className="text-red-500" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirmPassword ? "text" : "password"}
                        value={userData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                        className={`w-full px-4 py-3 bg-black/40 border rounded-lg text-white outline-none pr-12 focus:bg-black/60 ${
                          passwordsMatch || (userData.newPassword === '' && userData.confirmPassword === '')
                            ? 'border-red-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        {showPassword.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {!passwordsMatch && userData.newPassword && userData.confirmPassword && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <X size={14} />
                        Passwords do not match
                      </p>
                    )}
                    {(userData.newPassword || userData.confirmPassword) && passwordsMatch && userData.newPassword !== '' && (
                      <p className="text-sm text-green-400 flex items-center gap-1">
                        <Save size={14} />
                        Passwords match
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-red-900/30">
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving || !passwordsMatch}
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                    hasChanges && !isSaving && passwordsMatch
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:shadow-green-500/50 hover:scale-105'
                      : 'bg-gray-700/50 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-8 py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 hover:border-red-700 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  <X size={20} />
                  Cancel
                </button>

                {errorMsg && (
                  <p className="text-sm text-red-400 mt-2 text-left">
                    {errorMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-red-950/20 border border-red-900/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300 text-left">
              <p className=" font-semibold text-white mb-1">Security Notice</p>
              <p>As an administrator, ensure your account credentials are kept secure. Use a strong password and enable two-factor authentication when available.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminProfile;
