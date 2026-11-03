import React from 'react';
import LanguageToggle from './LanguageToggle';
import { FiPlus, FiLogOut } from 'react-icons/fi';

const WorkerHeader = ({
  worker = {},
  canCreateOrder,
  canDeliverOrder,
  handleLogout,
  navigate
}) => {
  return (
    <header className="bg-black text-[#D4AF37] sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 shadow-md flex flex-wrap justify-between items-center gap-3">
      <div className="flex items-center gap-3">
        {worker.profileImage?.url ? (
          <img 
            src={worker.profileImage.url} 
            alt={worker.name} 
            className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]"
          />
        ) : (
          <div className="w-10 h-10 bg-[#D4AF37] text-black rounded-full flex items-center justify-center font-black text-lg">
            {worker.name ? worker.name[0].toUpperCase() : 'K'}
          </div>
        )}
        <div>
          <h1 className="text-base font-black text-white">{worker.name}</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span>{worker.specialization || 'Karigar Portal'}</span>
            {canCreateOrder && <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded text-[9px] font-black">Booking Allowed</span>}
            {canDeliverOrder && <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded text-[9px] font-black">Delivery Allowed</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageToggle className="bg-gray-900 border-gray-800" />
        {/* If worker is allowed to create orders, show Book Order button */}
        {canCreateOrder && (
          <button
            onClick={() => navigate('/worker/orders/create')}
            className="bg-[#DFAC43] hover:bg-yellow-400 text-[#0F172A] px-3 py-1.5 rounded font-black text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
            title="Book New Customer Order"
          >
            <FiPlus className="text-sm font-black" /> Book Order (نیا آرڈر)
          </button>
        )}
        
        <button 
          onClick={handleLogout}
          className="bg-red-950/40 hover:bg-red-900/50 text-red-400 p-2 rounded-lg border border-red-900/40 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
          title="Logout"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </header>
  );
};

export default WorkerHeader;
