import React, { useState, useEffect } from 'react';
import { useGetAdminProfile, useUpdateAdminProfile } from '../hooks/useAuth';
import { useGetShopSettings } from '../hooks/useShopSettings';
import useAuthStore from '../Store/authStore';
import Preloader from '../components/Preloader';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiShield, 
  FiCheckCircle, 
  FiSave, 
  FiKey, 
  FiSettings,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AdminProfile = () => {
  const authUser = useAuthStore((state) => state.user);
  const { data: profile, isLoading, isError } = useGetAdminProfile();
  const { mutate: updateProfile, isPending } = useUpdateAdminProfile();
  const { data: shopSettings } = useGetShopSettings();

  // Profile Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility state
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
    } else if (authUser) {
      setName(authUser.name || '');
      setEmail(authUser.email || '');
    }
  }, [profile, authUser]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name is required');
    if (!email.trim()) return alert('Email is required');

    updateProfile({ name, email });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword) return alert('Please enter your current password');
    if (!newPassword) return alert('Please enter a new password');
    if (newPassword.length < 6) return alert('New password must be at least 6 characters long');
    if (newPassword !== confirmPassword) return alert('New passwords do not match');

    updateProfile(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      }
    );
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Preloader /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded bg-[#0F172A] text-[#DFAC43] flex items-center justify-center font-bold">
              <FiUser className="text-xl" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Admin Profile & Account
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Manage your personal administrator credentials, email, and password security.
          </p>
        </div>

        <Link
          to="/admin/settings"
          className="bg-gray-100 hover:bg-[#0F172A] text-gray-700 hover:text-[#DFAC43] px-4 py-2.5 rounded text-xs sm:text-sm font-black transition-all flex items-center gap-2 border border-gray-200 shadow-sm"
        >
          <FiSettings className="text-base" />
          <span>Shop Branding Settings</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ADMIN PROFILE CARD */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0F172A] via-[#DFAC43] to-[#0F172A]"></div>

            <div className="relative mx-auto w-24 h-24 rounded-full p-1 bg-gray-100 border-2 border-[#DFAC43] shadow-inner mb-4 flex items-center justify-center overflow-hidden">
              <img 
                src={shopSettings?.logoUrl || '/assets/BT_Logo.png'} 
                alt="Admin Avatar" 
                className="w-full h-full object-contain p-2"
              />
            </div>

            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              {profile?.name || authUser?.name || 'Administrator'}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {profile?.email || authUser?.email || 'admin@balouchtailors.com'}
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5 text-left text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-bold flex items-center gap-1.5">
                  <FiShield className="text-[#DFAC43]" /> System Role:
                </span>
                <span className="bg-[#0F172A] text-[#DFAC43] px-2.5 py-0.5 rounded text-[11px] font-black uppercase">
                  {profile?.role || 'Admin'}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span className="font-bold flex items-center gap-1.5">
                  <FiCheckCircle className="text-green-600" /> Account Status:
                </span>
                <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">
                  Active & Verified
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span className="font-bold">Shop Assignment:</span>
                <span className="font-bold text-gray-900">
                  {shopSettings?.shopName || 'Balouch Tailors'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Security Tips */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded text-xs text-amber-900 space-y-1.5">
            <h4 className="font-black flex items-center gap-1 text-amber-950">
              <FiLock className="text-sm" /> Security Best Practice:
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Use a strong password combining numbers, letters, and symbols. Avoid sharing your admin credentials with staff.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: FORMS (PROFILE & PASSWORD) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. PERSONAL INFORMATION FORM */}
          <div className="bg-white rounded p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-100">
              <FiUser className="text-[#DFAC43] text-lg" />
              <h3 className="text-base sm:text-lg font-black text-gray-900">
                Edit Profile Information
              </h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zubair Balouch"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 text-xs sm:text-sm font-medium focus:border-[#DFAC43] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Login Email Address *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@balouchtailors.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 text-xs sm:text-sm font-medium focus:border-[#DFAC43] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] px-5 py-2 rounded text-xs sm:text-sm font-black transition flex items-center gap-2 shadow"
                >
                  <FiSave className="text-base" />
                  {isPending ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* 2. CHANGE PASSWORD FORM */}
          <div className="bg-white rounded p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-100">
              <FiKey className="text-[#DFAC43] text-lg" />
              <h3 className="text-base sm:text-lg font-black text-gray-900">
                Change Password & Security
              </h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 rounded border border-gray-300 text-xs sm:text-sm font-medium focus:border-[#DFAC43] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {showCurrent ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 rounded border border-gray-300 text-xs sm:text-sm font-medium focus:border-[#DFAC43] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showNew ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 rounded border border-gray-300 text-xs sm:text-sm font-medium focus:border-[#DFAC43] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] px-5 py-2 rounded text-xs sm:text-sm font-black transition flex items-center gap-2 shadow"
                >
                  <FiLock className="text-base" />
                  {isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminProfile;
