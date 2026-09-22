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
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Left: toggle + Logo Section */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggle}
              aria-label={mobileOpen ? 'Close sidebar' : collapsed ? 'Open sidebar' : 'Collapse sidebar'}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            >
              {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>

            <div className="flex-shrink-0 flex items-center">
              <Link to="/admin/dashboard" className="flex items-center">
                <img
                  className="h-12 w-auto object-contain"
                  src={currentLogo}
                  alt={`${currentShopName} Admin`}
                />
                <span className="ml-3 font-bold text-xl text-gray-800 tracking-wider">
                  {currentShopName}
                </span>
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <Link
              to="/admin/profile"
              className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
              aria-label="Admin profile"
            >
              <div className="w-8 h-8 rounded-full bg-[#0F172A] text-[#DFAC43] flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {profile?.name ? profile.name.slice(0, 2).toUpperCase() : <FiUser className="w-4 h-4" />}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-bold text-xs text-gray-800 leading-tight">{profile?.name || 'Admin'}</p>
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