import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import defaultLogo from '../assets/BT_Logo.png';
import { useWorkerLoginMutation } from '../hooks/useAuth';
import { useGetShopSettings } from '../hooks/useShopSettings';
import Preloader from '../components/Preloader';
import { FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';

const WorkerLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const workerLogin = useWorkerLoginMutation();
  const { data: shopSettings } = useGetShopSettings();
  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';

  const isPending = workerLogin.isPending;
  const isError = workerLogin.isError;
  const error = workerLogin.error;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone || !password) return;
    workerLogin.mutate({ phone, password });
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
                <FiPhone className="text-gray-400 text-xs sm:text-sm" /> Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 03001234567"
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
              <a href="#" className="hover:text-black transition-colors">Forgot password?</a>
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
    </div>
  );
};

export default WorkerLogin;
