import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import defaultLogo from '../assets/BT_Logo.png';
import { useRegisterAdminMutation } from '../hooks/useAuth';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { validatePassword } from '../utils/validators';
import Preloader from '../components/Preloader';
import { FiEye, FiEyeOff, FiMail, FiUser, FiLock, FiCheckCircle, FiXCircle, FiShield, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerAdmin = useRegisterAdminMutation();
  const { data: shopSettings } = useGetShopSettings();
  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';

  const passwordStatus = validatePassword(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (!passwordStatus.isValid) {
      toast.error(passwordStatus.error);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    registerAdmin.mutate({
      name: name.trim(),
      email: email.trim(),
      password
    });
  };

  return (
    <div className="min-h-[100dvh] w-full bg-white flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
      {/* Preloader Overlay */}
      {registerAdmin.isPending && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Preloader />
        </div>
      )}

      <div className="w-full max-w-sm sm:max-w-md my-auto">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
          <Link to="/">
            <img src={currentLogo} alt={shopName} className="h-16 sm:h-20 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-1.5 mt-3">
            <FiShield className="text-[#DFAC43] text-sm" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
              Direct Admin Registration
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase">
            {shopName.split(' ')[0]} <span className="text-gray-400 font-light">{shopName.split(' ').slice(1).join(' ') || 'Tailors'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Create an administrative account</p>
        </div>

        {/* Card */}
        <div className="border border-gray-200 shadow-sm rounded p-5 sm:p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <FiUser className="text-gray-400 text-xs sm:text-sm" /> Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Master Zubair Balouch"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <FiMail className="text-gray-400 text-xs sm:text-sm" /> Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@balouchtailors.app"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <FiLock className="text-gray-400 text-xs sm:text-sm" /> Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars with special symbol"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <FiLock className="text-gray-400 text-xs sm:text-sm" /> Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full border border-gray-200 rounded-lg pl-3.5 pr-11 py-2.5 sm:pl-4 sm:pr-12 sm:py-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 sm:pr-4 text-gray-400 hover:text-black focus:outline-none"
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Live Password Requirements Indicator */}
            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-1.5 text-[11px]">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
                Password Security Requirements:
              </span>
              <div className="flex items-center gap-2">
                {passwordStatus.lengthValid ? (
                  <FiCheckCircle className="text-emerald-600 shrink-0 text-xs" />
                ) : (
                  <FiXCircle className="text-gray-400 shrink-0 text-xs" />
                )}
                <span className={passwordStatus.lengthValid ? 'text-emerald-700 font-bold' : 'text-gray-600'}>
                  At least 8 characters long ({password.length}/8)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordStatus.specialCharValid ? (
                  <FiCheckCircle className="text-emerald-600 shrink-0 text-xs" />
                ) : (
                  <FiXCircle className="text-gray-400 shrink-0 text-xs" />
                )}
                <span className={passwordStatus.specialCharValid ? 'text-emerald-700 font-bold' : 'text-gray-600'}>
                  At least one special symbol (e.g. <code className="bg-gray-200 px-1 py-0.5 rounded font-bold text-gray-800">!@#$%^&*</code>)
                </span>
              </div>
              {confirmPassword && (
                <div className="flex items-center gap-2 pt-0.5 border-t border-gray-200">
                  {passwordsMatch ? (
                    <FiCheckCircle className="text-emerald-600 shrink-0 text-xs" />
                  ) : (
                    <FiXCircle className="text-rose-500 shrink-0 text-xs" />
                  )}
                  <span className={passwordsMatch ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={registerAdmin.isPending || !passwordStatus.isValid || (confirmPassword && !passwordsMatch)}
              className={`w-full bg-black text-white text-xs sm:text-sm font-bold py-3 sm:py-3.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider`}
            >
              {registerAdmin.isPending ? 'Creating Account...' : 'Register Admin Account'}
            </button>
          </form>

          {/* Quick link to login */}
          <div className="pt-4 mt-4 text-center border-t border-gray-100">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-black font-semibold transition">
              <FiArrowLeft className="text-xs" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
