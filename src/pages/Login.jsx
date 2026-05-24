import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/BT_Logo.png';
import { useLoginMutation } from '../hooks/useAuth';
import Preloader from '../components/Preloader';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { email, password } = form;
  const { mutate, isPending, isError, error } = useLoginMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    // TanStack Query ki mutate function ko form ka data pakrana
    mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
{/* 3. Custom Preloader Overlay */}
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
        <div className="border border-gray-100 shadow-sm rounded p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-black transition-colors"
              />
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
              className={`w-full bg-black text-white text-sm font-medium py-3 rounded hover:bg-gray-800 transition-colors ${isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {isError && (
            <p className="mt-4 text-sm text-red-600 text-center">{error?.response?.data?.message || error?.message || 'Login failed'}</p>
          )}

          <p className="text-center text-xs text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-black font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
