import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Edit2, Save, X, Eye, EyeOff, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost/mobook_api";

const UserProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errorMsg, setErrorMsg] = useState(''); // ✅ show backend errors in UI

  // --- helpers to keep UI same but DB correct ---
  const buildFullName = (first, middle, last) => {
    return `${first || ""} ${middle ? middle + " " : ""}${last || ""}`.trim();
  };

  // splitter: First = first word, Last = last word, Middle = everything between
  const splitFullName = (fullName) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { FirstName: "", MiddleName: "", LastName: "" };
    if (parts.length === 1) return { FirstName: parts[0], MiddleName: "", LastName: "" };
    if (parts.length === 2) return { FirstName: parts[0], MiddleName: "", LastName: parts[1] };

    return {
      FirstName: parts[0],
      MiddleName: parts.slice(1, -1).join(" "),
      LastName: parts[parts.length - 1]
    };
  };

  const getLoggedInCustomerId = () => {
    try {
      const mobookUser =
        JSON.parse(localStorage.getItem("mobook_user") || sessionStorage.getItem("mobook_user") || "null");
      const user =
        JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");

      return (
        mobookUser?.CustomerId ||
        mobookUser?.id ||
        user?.CustomerId ||
        user?.id ||
        null
      );
    } catch {
      return null;
    }
  };

  // Original user data (UI-friendly)
  const [originalData, setOriginalData] = useState({
    CustomerId: null,
    name: '',
    email: '',
    mobile: '',
    password: '********'
  });

  // Editable user data (UI-friendly)
  const [userData, setUserData] = useState({
    ...originalData,
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch profile from DB
  const fetchProfile = async () => {
    const id = getLoggedInCustomerId();
    if (!id) {
      navigate("/", { replace: true });
      return;
    }

    setIsLoadingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/get_profile.php?customer_id=${id}`);
      const data = await res.json();

      if (data.success) {
        const c = data.customer;
        const fullName = buildFullName(c.FirstName, c.MiddleName, c.LastName);

        const base = {
          CustomerId: c.CustomerId,
          name: fullName,
          email: c.Email || '',
          mobile: c.Phone_Number || '',
          password: '********'
        };

        setOriginalData(base);
        setUserData({
          ...base,
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error("Fetch profile failed:", err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
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

  // ✅ REAL DB SAVE, uniform with AdminProfile
  const handleSave = async () => {
    if (!passwordsMatch) return;

    setIsSaving(true);
    setErrorMsg('');

    try {
      const { FirstName, MiddleName, LastName } = splitFullName(userData.name);

      const payload = {
        CustomerId: originalData.CustomerId,
        FirstName,
        MiddleName, // empty string allowed -> backend will set NULL
        LastName,
        Email: userData.email,
        Phone_Number: userData.mobile,
        NewPassword: userData.newPassword || ""
      };

      const res = await fetch(`${API_BASE}/update_profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.message || "Update failed");
        return;
      }

      // refresh from DB
      await fetchProfile();

      // update localStorage so other pages reflect changes
      const updatedUser = {
        ...JSON.parse(localStorage.getItem("mobook_user") || "{}"),
        FirstName,
        MiddleName,
        LastName,
        Email: userData.email,
        Phone_Number: userData.mobile
      };

      localStorage.setItem("mobook_user", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditing(false);
      setHasChanges(false);
      setShowPassword({ newPassword: false, confirmPassword: false });
      setPasswordsMatch(true);
      setErrorMsg('');

    } catch (err) {
      console.error("Save failed:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
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

  const handleHomeClick = () => {
    navigate('/Home');
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-[#1a0000] to-red-900 text-white pb-12 pt-17 md:py-12 px-4">
      {/* Home Button */}
      <button
        onClick={handleHomeClick}
        className="fixed top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-black rounded-xl border border-gray-700 hover:border-red-900 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            My <span className="bg-gradient-to-r from-red-700 to-orange-600/20 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className="text-gray-400 text-lg">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-black backdrop-blur-sm rounded-2xl border text-left border-gray-700 overflow-hidden shadow-2xl">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 border-b border-gray-700">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg">
                {userData.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-3xl font-bold">{userData.name}</h2>
                <p className="text-gray-400 mt-1">{userData.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Full Name
                  </div>
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white transition-all duration-300 ${
                    isEditing 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-gray-700 cursor-not-allowed'
                  } outline-none`}
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </div>
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white transition-all duration-300 ${
                    isEditing 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-gray-700 cursor-not-allowed'
                  } outline-none`}
                />
              </div>

              {/* Mobile Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    Mobile Number
                  </div>
                </label>
                <input
                  type="tel"
                  value={userData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white transition-all duration-300 ${
                    isEditing 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-gray-700 cursor-not-allowed'
                  } outline-none`}
                />
              </div>

              {/* Password Fields */}
              {!isEditing ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <Lock size={16} />
                      Password
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={userData.password}
                      disabled={true}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* New Password Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Lock size={16} />
                        New Password
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.newPassword ? "text" : "password"}
                        value={userData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        placeholder="New password"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-lg text-white outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('newPassword')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Lock size={16} />
                        Confirm Password
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirmPassword ? "text" : "password"}
                        value={userData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm password"
                        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white outline-none pr-12 ${
                          passwordsMatch || (userData.newPassword === '' && userData.confirmPassword === '')
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {!passwordsMatch && userData.newPassword && userData.confirmPassword && (
                      <p className="mt-2 text-sm text-red-500">
                        Passwords do not match
                      </p>
                    )}
                    {(userData.newPassword || userData.confirmPassword) && passwordsMatch && (
                      <p className="mt-2 text-sm text-green-500">
                        Passwords match
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-red-700 to-orange-600/20 rounded-lg hover:from-red-500 hover:to-orange-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2"
                >
                  <Edit2 size={20} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving || !passwordsMatch}
                    className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                      hasChanges && !isSaving && passwordsMatch
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:shadow-green-500/50'
                        : 'bg-gray-700 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
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
                    className="w-full sm:w-auto px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={20} />
                    Cancel
                  </button>

                  {errorMsg && (
                    <p className="text-sm text-red-400 mt-2 text-left">
                      {errorMsg}
                    </p>
                  )}
                </>
              )}
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

export default UserProfile;
