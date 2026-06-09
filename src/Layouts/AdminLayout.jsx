import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import useAuthStore from '../Store/authStore';

const AdminLayout = () => {
  // Zustand persistence hydrate hone ka wait karna zaroori hai
  const hasHydrated = useAuthStore.persist.hasHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!hasHydrated) {
    return null; // Ya loading spinner dikhayen agar chahein
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((c) => !c);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <AdminNavbar onToggle={handleToggle} collapsed={collapsed} mobileOpen={mobileOpen} />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <AdminSidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        {/* Mobile overlay when sidebar is open */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content Area (Jahan forms aur tables aayenge) */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-5rem)]">
          {/* Outlet ka matlab hai yahan andar wale routes (pages) render honge */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;