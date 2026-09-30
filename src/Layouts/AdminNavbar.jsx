import React from 'react';
import { Link } from 'react-router-dom';
import defaultLogo from '../assets/BT_Logo.png';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { useGetAdminProfile } from '../hooks/useAuth';

const AdminNavbar = ({ onToggle, collapsed, mobileOpen }) => {
  const { data: shopSettings } = useGetShopSettings();
  const { data: profile } = useGetAdminProfile();
  
  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const currentShopName = shopSettings?.shopName || 'Balouch Tailors';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center gap-2">
          {/* Left: toggle + Logo Section */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={onToggle}
              aria-label={mobileOpen ? 'Close sidebar' : collapsed ? 'Open sidebar' : 'Collapse sidebar'}
              className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 text-gray-600 shrink-0 cursor-pointer"
            >
              {mobileOpen ? <FiX className="w-5 h-5 sm:w-6 sm:h-6" /> : <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <Link to="/admin/dashboard" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img
                className="h-8 sm:h-12 w-auto object-contain shrink-0"
                src={currentLogo}
                alt={`${currentShopName} Admin`}
              />
              <span className="font-bold text-sm sm:text-lg md:text-xl text-gray-800 tracking-wide sm:tracking-wider truncate min-w-0">
                {currentShopName}
              </span>
            </Link>
          </div>

          {/* Right: Admin Profile */}
          <div className="flex items-center shrink-0">
            <Link
              to="/admin/profile"
              className="flex items-center gap-2 p-1 sm:px-3 sm:py-2 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors shrink-0"
              aria-label="Admin profile"
            >
              <div className="w-8 h-8 rounded-full bg-[#0F172A] text-[#DFAC43] flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                {profile?.name ? profile.name.slice(0, 2).toUpperCase() : <FiUser className="w-4 h-4" />}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-bold text-xs text-gray-800 leading-tight truncate max-w-[120px]">{profile?.name || 'Admin'}</p>
                <p className="text-[10px] text-gray-500 leading-none">Settings & Profile</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;