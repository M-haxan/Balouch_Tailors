import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/BT_Logo.png'; // Aapke current folder structure ke mutabiq logo ka path
import { FiMenu } from 'react-icons/fi';
import { FiX } from 'react-icons/fi';

const AdminNavbar = ({ onToggle, collapsed, mobileOpen }) => {

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
            <Link to="/admin/dashboard">
              <img
                className="h-12 w-auto" // Height apne hisaab se adjust kar lein
                src={logo}
                alt="Balouch Tailors Admin"
              />
            </Link>
            <span className="ml-3 font-bold text-xl text-gray-800 tracking-wider">
              Balouch Tailors
            </span>
            </div>
          </div>

          <div className="flex items-center">
            <Link
              to="/admin/profile"
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100"
              aria-label="Admin profile"
            >
              <img src={logo} alt="Admin avatar" className="w-8 h-8 rounded-full object-cover" />
              <span className="hidden sm:inline font-medium text-gray-700">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;