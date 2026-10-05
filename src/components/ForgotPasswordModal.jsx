import React, { useState, useEffect } from 'react';
import { FiMail, FiX, FiCheckCircle, FiArrowRight, FiKey } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useForgotPasswordMutation } from '../hooks/useAuth';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '' }) => {
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSentSuccess, setResetSentSuccess] = useState(false);

  const forgotPasswordMutation = useForgotPasswordMutation();

  useEffect(() => {
    if (isOpen) {
      setForgotEmail(initialEmail);
      setResetSentSuccess(false);
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleClose = () => {
    setForgotEmail('');
    setResetSentSuccess(false);
    onClose();
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
        },
      }
    );
  };

  return (
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
            type="button"
            onClick={handleClose}
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
                We have sent a secure password reset link to{' '}
                <strong className="text-black font-mono">{forgotEmail}</strong>. Please check your inbox (and spam folder) to reset your password.
              </p>
              <button
                type="button"
                onClick={handleClose}
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
                  onClick={handleClose}
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
  );
};

export default ForgotPasswordModal;
