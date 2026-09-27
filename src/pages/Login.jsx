import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import defaultLogo from '../assets/BT_Logo.png';
import { useLoginMutation, useForgotPasswordMutation } from '../hooks/useAuth';
import { useGetShopSettings } from '../hooks/useShopSettings';
import Preloader from '../components/Preloader';
import { FiEye, FiEyeOff, FiMail, FiX, FiCheckCircle, FiArrowRight, FiKey } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSentSuccess, setResetSentSuccess] = useState(false);

  const adminLogin = useLoginMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const { data: shopSettings } = useGetShopSettings();
  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';

  const isPending = adminLogin.isPending;
  const isError = adminLogin.isError;
  const error = adminLogin.error;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    adminLogin.mutate({ email, password });
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Please enter your registered email.');
      return;
    }

    forgotPasswordMutation.mutate(
      { email: forgotEmail.trim() },
      {
        onSuccess: () => {
          setResetSentSuccess(true);
        }
      }
    );
  };

  const closeForgotModal = () => {
    setIsForgotModalOpen(false);
    setForgotEmail('');
    setResetSentSuccess(false);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-white flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
      {/* Preloader Overlay */}
      {isPending && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Preloader />
        </div>
      )}
      <div className="w-full max-w-sm sm:max-w-md my-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
          <Link to="/">
            <img src={currentLogo} alt={shopName} className="h-16 sm:h-20 w-auto object-contain" />
          </Link>
          <h1 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase">
            {shopName.split(' ')[0]} <span className="text-gray-400 font-light">{shopName.split(' ').slice(1).join(' ') || 'Tailors'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="border border-gray-200 shadow-sm rounded p-5 sm:p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <FiMail className="text-gray-400 text-xs sm:text-sm" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg pl-3.5 pr-11 py-2.5 sm:pl-4 sm:pr-12 sm:py-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 sm:pr-4 text-gray-400 hover:text-black focus:outline-none"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500">
              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none">
                <input type="checkbox" className="accent-black rounded" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email || '');
                  setIsForgotModalOpen(true);
                }}
                className="hover:text-black font-semibold transition-colors focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`w-full bg-black text-white text-xs sm:text-sm font-bold py-3 sm:py-3.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm ${
                isPending ? 'opacity-65 cursor-not-allowed' : ''
              }`}
            >
              {isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {isError && (
            <p className="mt-4 text-xs sm:text-sm text-red-600 text-center font-medium">
              {error?.response?.data?.message || error?.message || 'Login failed'}
            </p>
          )}
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#DFAC43]/10 text-[#DFAC43] flex items-center justify-center font-bold">
                  <FiKey size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-gray-900">Forgot Password</h3>
                  <p className="text-[11px] text-gray-500">Reset your admin account credentials</p>
                </div>
              </div>
              <button
                onClick={closeForgotModal}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-200 transition"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {resetSentSuccess ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                    <FiCheckCircle size={28} />
                  </div>
                  <h4 className="text-base font-bold text-gray-900">Password Reset Link Sent!</h4>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                    We have sent a secure password reset link to <strong className="text-black font-mono">{forgotEmail}</strong>. Please check your inbox (and spam folder) to reset your password.
                  </p>
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="mt-4 w-full bg-black text-white text-xs font-bold py-2.5 rounded-lg hover:bg-gray-800 transition"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Enter your registered email address. We'll send you an encrypted link to create a new password.
                  </p>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <FiMail className="text-gray-400" /> Registered Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@balouchtailors.app"
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-black transition-colors font-medium"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeForgotModal}
                      className="w-1/3 border border-gray-200 text-gray-700 font-bold py-2.5 rounded-lg text-xs hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordMutation.isPending}
                      className="w-2/3 bg-[#DFAC43] text-black font-extrabold py-2.5 rounded-lg text-xs hover:bg-[#c99832] transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      {forgotPasswordMutation.isPending ? 'Sending Link...' : 'Send Reset Link'}
                      {!forgotPasswordMutation.isPending && <FiArrowRight />}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

