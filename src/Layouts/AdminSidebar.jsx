import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingBag, FiCreditCard, FiLogOut, FiUsers, FiTrendingUp, FiLayers, FiBox } from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import { CgProfile } from "react-icons/cg";
import { IoMdSettings } from "react-icons/io";
import useAuthStore from '../Store/authStore';

const AdminSidebar = ({ collapsed = false, mobileOpen = false, onCloseMobile }) => {
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) logout();
    if (onCloseMobile) onCloseMobile();
    navigate('/admin/login');
  };

  const sidebarWidth = collapsed ? 'md:w-20' : 'md:w-64';

  const getLinkStyle = ({ isActive }) => {
    const baseStyle = "flex items-center px-3.5 sm:px-5 py-2.5 my-0.5 text-xs sm:text-sm font-semibold rounded-r transition-colors tracking-tight";
    const activeStyle = "bg-amber-50 text-black font-black border-l-4 border-[#DFAC43]";
    const inactiveStyle = "text-gray-600 hover:bg-gray-100 hover:text-black border-l-4 border-transparent";
    const collapsedStyle = collapsed ? 'justify-center px-2' : '';
    return `${baseStyle} ${isActive ? activeStyle : inactiveStyle} ${collapsedStyle}`;
  };

  return (
    <aside
      className={`
        ${sidebarWidth} bg-white shadow-md 
        h-[calc(100vh-5rem)] 
        sticky top-20 left-0 z-50 
        transition-all duration-300 
        ${mobileOpen ? 'fixed translate-x-0 w-64 max-w-[85vw]' : 'hidden md:block'}
      `}
    >
      {/* Upper Menu Section */}
      <div className="py-6 pb-4 h-[calc(100%-4.5rem)] overflow-y-auto no-scrollbar">
        {!collapsed && (
          <p className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Management
          </p>
        )}

        <nav className="flex flex-col pr-4">
          <NavLink to="/admin/dashboard" className={getLinkStyle} onClick={onCloseMobile}>
            <FiTrendingUp className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.dashboard')}</span>}
          </NavLink>
          <NavLink to="/admin/catalogue" className={getLinkStyle} onClick={onCloseMobile}>
            <FiShoppingBag className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.catalogue')}</span>}
          </NavLink>
          <NavLink to="/admin/services" className={getLinkStyle} onClick={onCloseMobile}>
            <FiLayers className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.services')}</span>}
          </NavLink>
          <NavLink to="/admin/pricing" className={getLinkStyle} onClick={onCloseMobile}>
            <FiCreditCard className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.rates')}</span>}
          </NavLink>
          <NavLink to="/admin/customers" className={getLinkStyle} onClick={onCloseMobile}>
            <CgProfile className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.customers')}</span>}
          </NavLink>
          <NavLink to="/admin/workers" className={getLinkStyle} onClick={onCloseMobile}>
            <FiUsers className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.workers')}</span>}
          </NavLink>
          <NavLink to="/admin/expenses" className={getLinkStyle} onClick={onCloseMobile}>
            <FiCreditCard className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.expenses')}</span>}
          </NavLink>
          <NavLink to="/admin/financial-reports" className={getLinkStyle} onClick={onCloseMobile}>
            <FaMoneyBillWave className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.reports')}</span>}
          </NavLink>
          <NavLink to="/admin/payments" className={getLinkStyle} onClick={onCloseMobile}>
            <FiCreditCard className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.payments')}</span>}
          </NavLink>
          <NavLink to="/admin/orders/create" className={getLinkStyle} onClick={onCloseMobile}>
            <FiShoppingBag className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.createOrder')}</span>}
          </NavLink>
          <NavLink to="/admin/allorders" className={getLinkStyle} onClick={onCloseMobile}>
            <FiBox className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.allOrders')}</span>}
          </NavLink>
           <NavLink to="/admin/settings" className={getLinkStyle} onClick={onCloseMobile}>
            <IoMdSettings className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>{t('admin.settings')}</span>}
          </NavLink>

        </nav>
      </div>

      {/* Logout Button (Wapas apni jagah absolute bottom par) */}
      <div className="absolute bottom-0 left-0 w-full p-4 border-t bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center text-left gap-3 px-3 py-2 rounded hover:bg-red-50 hover:text-red-600 text-sm font-medium text-gray-700 transition-colors cursor-pointer"
        >
          <FiLogOut className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
          {!collapsed && <span>{t('admin.logout')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;