import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/BT_Logo.png';
import { useLoginMutation, useWorkerLoginMutation } from '../hooks/useAuth';
import Preloader from '../components/Preloader';
import { FiEye, FiEyeOff, FiPhone, FiMail } from 'react-icons/fi';

const Login = () => {
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'worker'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const adminLogin = useLoginMutation();
  const workerLogin = useWorkerLoginMutation();

  const isPending = adminLogin.isPending || workerLogin.isPending;
  const isError = adminLogin.isError || workerLogin.isError;
  const error = adminLogin.error || workerLogin.error;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loginType === 'admin') {
      if (!email || !password) return;
      adminLogin.mutate({ email, password });
    } else {
      if (!phone || !password) return;
      workerLogin.mutate({ phone, password });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      {/* Preloader Overlay */}
      {isPending && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Preloader />
        </div>
      )}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <img src={logo} alt="Balouch Tailors" className="h-20 w-auto object-contain" />
          </Link>
          <h1 className="mt-4 text-2xl font-black text-gray-900 tracking-tighter uppercase">
            Balouch <span className="text-gray-400 font-light">Tailors</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="border border-gray-150 shadow-sm rounded-xl p-8 bg-white">
          
          {/* Portal Switcher Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginType('admin');
                setPassword('');
              }}
              className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all ${
                loginType === 'admin' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              Admin Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('worker');
                setPassword('');
              }}
              className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all ${
                loginType === 'worker' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              Karigar (Worker)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginType === 'admin' ? (
              <div>
                <label className="block text-xs font-bold text-gray-750 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <FiMail className="text-gray-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-black transition-colors"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-750 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <FiPhone className="text-gray-400" /> Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-black transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-750 uppercase tracking-widest mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg pl-4 pr-12 py-3 text-sm text-gray-800 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-black focus:outline-none"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-black" />
                Remember me
              </label>
              <a href="#" className="hover:text-black transition-colors">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`w-full bg-black text-white text-sm font-bold py-3.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm ${
                isPending ? 'opacity-65 cursor-not-allowed' : ''
              }`}
            >
              {isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {isError && (
            <p className="mt-4 text-sm text-red-600 text-center font-medium">
              {error?.response?.data?.message || error?.message || 'Login failed'}
            </p>
          )}

          {loginType === 'admin' && (
            <p className="text-center text-xs text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-black font-semibold hover:underline">
                Register
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
