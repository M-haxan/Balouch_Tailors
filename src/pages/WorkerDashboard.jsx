import React, { useState } from 'react';
import { useGetWorkerDashboard, useSubmitSuitForInspection, useGetWorkerLedger, useGetWorkerPayments } from '../hooks/useWorkers';
import { useGetShopSettings } from '../hooks/useShopSettings';
import useAuthStore from '../Store/authStore';
import { useNavigate } from 'react-router-dom';
import defaultLogo from '../assets/BT_Logo.png';
import { 
  FiScissors, 
  FiCheckCircle, 
  FiLogOut, 
  FiCalendar, 
  FiUser, 
  FiImage, 
  FiBox, 
  FiInfo, 
  FiPhone, 
  FiAlertTriangle,
  FiClock,
  FiSearch,
  FiEye,
  FiFileText,
  FiX,
  FiTag,
  FiLayers,
  FiCheck,
  FiChevronUp,
  FiChevronDown,
  FiPrinter,
  FiCreditCard
} from 'react-icons/fi';
import Preloader from '../components/Preloader';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const workerId = user?.id || user?._id;
  
  const { data: dashboardData, isLoading, refetch } = useGetWorkerDashboard();
  const { mutate: submitForQC, isPending: isSubmitting } = useSubmitSuitForInspection();
  const { data: ledgerData = [], isLoading: loadingLedger } = useGetWorkerLedger(workerId);
  const { data: paymentsData = [], isLoading: loadingPayments } = useGetWorkerPayments(workerId);
  
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned', 'inspection', 'rework', 'completed', or 'ledger'
  const [viewingPayment, setViewingPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuitForSpecs, setSelectedSuitForSpecs] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/worker/login');
  };

  const handleSubmitForQC = (orderId, suitId) => {
    if (window.confirm('Kya aapne yeh suit mukammal sil liya hai aur Admin Inspection ke liye submit karna chahte hain?')) {
      submitForQC({ orderId, suitId }, {
        onSuccess: () => {
          refetch();
          if (selectedSuitForSpecs && selectedSuitForSpecs.suitId === suitId) {
            setSelectedSuitForSpecs(null);
          }
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Preloader />
      </div>
    );
  }

  const { 
    worker = {}, 
    stats = {}, 
    assignedSuits = [], 
    underInspectionSuits = [], 
    reworkSuits = [], 
    stitchedSuits = [] 
  } = dashboardData || {};

  // Search filter helper
  const filterSuitList = (list) => {
    if (!searchTerm.trim()) return list;
    const query = searchTerm.toLowerCase().trim();
    return list.filter(item => {
      const suitIdStr = (item.suitNumber || '').toLowerCase();
      const orderNumStr = (item.orderNumber || '').toString().toLowerCase();
      const formattedId = `bt-${orderNumStr}-${item.suitIndex || ''}`.toLowerCase();
      const customerName = (item.customerName || '').toLowerCase();
      const wearerName = (item.wearerName || '').toLowerCase();
      const phone = (item.customerPhone || '').toString();
      const fabric = (item.fabricDetails || '').toLowerCase();
      const vol = (item.volumeNo || '').toLowerCase();
      const notes = (item.customDesign || '').toLowerCase();
      const tags = (item.staticTags || []).join(' ').toLowerCase();

      return (
        suitIdStr.includes(query) ||
        orderNumStr.includes(query) ||
        formattedId.includes(query) ||
        customerName.includes(query) ||
        wearerName.includes(query) ||
        phone.includes(query) ||
        fabric.includes(query) ||
        vol.includes(query) ||
        notes.includes(query) ||
        tags.includes(query)
      );
    });
  };

  const filteredAssigned = filterSuitList(assignedSuits);
  const filteredInspection = filterSuitList(underInspectionSuits);
  const filteredRework = filterSuitList(reworkSuits);
  const filteredStitched = filterSuitList(stitchedSuits);

  const totalFilteredMatches = filteredAssigned.length + filteredInspection.length + filteredRework.length + filteredStitched.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      
      {/* MOBILE-FRIENDLY HEADER */}
      <header className="bg-black text-[#D4AF37] sticky top-0 z-40 px-6 py-4 shadow-md flex justify-between items-center">
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
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{worker.specialization || 'Karigar Portal'}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="bg-red-950/40 hover:bg-red-900/50 text-red-400 p-2.5 rounded-lg border border-red-900/40 transition-colors flex items-center gap-1 text-xs font-bold"
          title="Logout"
        >
          <FiLogOut /> Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* FINANCIAL & WORK STATUS CARDS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Earnings Card */}
          <div className="bg-black text-white p-4 rounded shadow-sm border border-gray-900 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approved Earnings</span>
              <span className="text-[#D4AF37] text-xs font-black select-none">PKR</span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-[#D4AF37]">Rs {stats.totalEarnings}</p>
              <p className="text-[9px] text-gray-500 font-bold mt-1">QC Approved Wages</p>
            </div>
          </div>

          {/* Stitched Count Card */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approved Suits</span>
              <FiCheckCircle className="text-green-500 text-lg" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-black">{stats.totalStitched}</p>
              <p className="text-[9px] text-gray-400 font-bold mt-1">Completed & Passed</p>
            </div>
          </div>

          {/* Advance Taken Card */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Advance Taken</span>
              <span className="text-red-500 font-black text-lg">Rs</span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-red-600">Rs {stats.advanceTaken}</p>
              <p className="text-[9px] text-gray-400 font-bold mt-1">Paid in advance</p>
            </div>
          </div>

          {/* Balance Due Card */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remaining Due</span>
              <span className="text-blue-500 font-black text-lg">Rs</span>
            </div>
            <div className="mt-2">
              <p className={`text-2xl font-black ${stats.balanceDue >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                Rs {stats.balanceDue}
              </p>
              <p className="text-[9px] text-gray-400 font-bold mt-1">Ready for Settle</p>
            </div>
          </div>

        </section>

        {/* PROFILE WAGE INFO (MOBILE TIGHT CARD) */}
        <section className="bg-white p-4 rounded border border-gray-150 shadow-sm flex flex-wrap gap-4 items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FiScissors className="text-[#D4AF37]" />
            <span className="text-gray-500 font-semibold">Stitching Wage:</span>
            <span className="font-extrabold text-black">Rs {worker.perSuitWage} per suit</span>
          </div>
          {worker.phone && (
            <div className="flex items-center gap-2">
              <FiPhone className="text-gray-400" />
              <span className="text-gray-500 font-semibold">Phone:</span>
              <span className="font-bold text-gray-700">{worker.phone}</span>
            </div>
          )}
          {worker.address && (
            <div className="w-full mt-2 pt-2 border-t border-gray-100 text-gray-500 flex items-center gap-2">
              <span className="font-semibold">Address:</span>
              <span className="font-medium text-gray-700">{worker.address}</span>
            </div>
          )}
        </section>

        {/* SUIT WORK LIST SECTION */}
        <section className="space-y-4">
          
          {/* SEARCH BAR FOR QUICK LOOKUP BY SUIT ID, WEARER, FABRIC */}
          <div className="bg-white p-3 sm:p-4 rounded border border-gray-200 shadow-sm space-y-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                placeholder="Search Suit ID (e.g. BT-1001-1 or 1001), Wearer, Fabric, Vol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 focus:border-black focus:bg-white rounded outline-none text-xs sm:text-sm font-bold text-gray-900 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 text-sm cursor-pointer"
                  title="Clear Search"
                >
                  <FiX />
                </button>
              )}
            </div>

            {searchTerm && (
              <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 px-1 pt-0.5">
                <span>
                  Found <span className="text-black font-black">{totalFilteredMatches}</span> matching suits across all lists
                </span>
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="text-[#DFAC43] hover:underline font-black cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* TAB SELECTORS */}
          <div className="flex overflow-x-auto bg-gray-200/80 p-1 rounded gap-1">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 min-w-[100px] py-2.5 px-3 text-xs md:text-sm font-black rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'assigned' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Assigned ({filteredAssigned.length})
            </button>
            <button
              onClick={() => setActiveTab('inspection')}
              className={`flex-1 min-w-[110px] py-2.5 px-3 text-xs md:text-sm font-black rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'inspection' ? 'bg-amber-400 text-black shadow-sm font-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              <FiClock /> In QC ({filteredInspection.length})
            </button>
            {filteredRework.length > 0 && (
              <button
                onClick={() => setActiveTab('rework')}
                className={`flex-1 min-w-[110px] py-2.5 px-3 text-xs md:text-sm font-black rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'rework' ? 'bg-red-600 text-white shadow-sm font-black animate-pulse' : 'text-red-600 hover:bg-red-100'
                }`}
              >
                <FiAlertTriangle /> Rework ({filteredRework.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 min-w-[100px] py-2.5 px-3 text-xs md:text-sm font-black rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'completed' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Approved ({filteredStitched.length})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex-1 min-w-[90px] py-2.5 px-3 text-xs md:text-sm font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'ledger' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Ledger
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="space-y-4">
            
            {/* 1. ASSIGNED TAB (PENDING STITCHING) */}
            {activeTab === 'assigned' && (
              filteredAssigned.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
                  <FiBox className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 font-bold text-sm">
                    {searchTerm ? 'Is search ke mutabiq koi assigned suit nahi mila.' : 'Abhi koi pending suit assign nahi hai.'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Admin se assignments ke liye rabta karein.</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                        <th className="p-3">Order / Suit ID</th>
                        <th className="p-3">Fabric Details</th>
                        <th className="p-3">Wearer / Customer</th>
                        <th className="p-3">Delivery Due</th>
                        <th className="p-3 text-right">Wage</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAssigned.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="p-3 whitespace-nowrap">
                            <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                              {item.suitNumber || `BT-${item.orderNumber}-${item.suitIndex || 1}`}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-black text-gray-900 block">{item.fabricDetails}</span>
                            {item.volumeNo && <span className="text-[10px] text-gray-500 font-medium">Vol: {item.volumeNo}</span>}
                          </td>
                          <td className="p-3 font-bold text-gray-800">
                            {item.wearerName || item.customerName}
                          </td>
                          <td className="p-3 font-bold text-red-600 font-sans whitespace-nowrap">
                            {new Date(item.deliveryDate).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right font-black text-gray-900 font-sans whitespace-nowrap">
                            Rs {worker.perSuitWage}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedSuitForSpecs(item)}
                                className="bg-gray-100 hover:bg-[#0F172A] text-gray-800 hover:text-[#DFAC43] text-xs font-black px-3 py-1.5 rounded transition flex items-center gap-1 border border-gray-200 cursor-pointer"
                              >
                                <FiFileText /> Naap & Specs
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSubmitForQC(item.orderId, item.suitId)}
                                disabled={isSubmitting}
                                className="bg-black hover:bg-[#DFAC43] hover:text-[#0F172A] text-white text-xs font-black px-3.5 py-1.5 rounded transition shadow-xs flex items-center gap-1 cursor-pointer"
                              >
                                <FiCheckCircle /> Submit QC
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* 2. UNDER INSPECTION TAB */}
            {activeTab === 'inspection' && (
              filteredInspection.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
                  <FiClock className="text-4xl text-amber-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-bold text-sm">
                    {searchTerm ? 'Is search ke mutabiq koi suit QC me nahi hai.' : 'Abhi koi suit Admin Inspection mein nahi hai.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                        <th className="p-3">Order / Suit ID</th>
                        <th className="p-3">Fabric Details</th>
                        <th className="p-3">Wearer / Customer</th>
                        <th className="p-3 text-right">Wage on Hold</th>
                        <th className="p-3 text-center">QC Status</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredInspection.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="p-3 whitespace-nowrap">
                            <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                              {item.suitNumber || `BT-${item.orderNumber}-${item.suitIndex || 1}`}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-black text-gray-900 block">{item.fabricDetails}</span>
                            {item.volumeNo && <span className="text-[10px] text-gray-500 font-medium">Vol: {item.volumeNo}</span>}
                          </td>
                          <td className="p-3 font-bold text-gray-800">
                            {item.wearerName || item.customerName}
                          </td>
                          <td className="p-3 text-right font-black text-amber-700 font-sans whitespace-nowrap">
                            Rs {worker.perSuitWage}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded text-[10px] font-black uppercase inline-flex items-center gap-1">
                              <FiClock /> Waiting QC Approval
                            </span>
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedSuitForSpecs(item)}
                              className="bg-gray-100 hover:bg-[#0F172A] text-gray-800 hover:text-[#DFAC43] text-xs font-black px-3 py-1.5 rounded transition flex items-center gap-1 border border-gray-200 cursor-pointer mx-auto"
                            >
                              <FiFileText /> Naap & Specs
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* 3. REWORK REQUIRED TAB */}
            {activeTab === 'rework' && (
              filteredRework.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
                  <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500 font-bold text-sm">Koi alteration ya rework pending nahi hai!</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                        <th className="p-3">Order / Suit ID</th>
                        <th className="p-3">Fabric Details</th>
                        <th className="p-3">Wearer</th>
                        <th className="p-3">Admin Alteration Instructions</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRework.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="p-3 whitespace-nowrap">
                            <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                              {item.suitNumber || `BT-${item.orderNumber}-${item.suitIndex || 1}`}
                            </span>
                          </td>
                          <td className="p-3 font-black text-gray-900">
                            {item.fabricDetails}
                          </td>
                          <td className="p-3 font-bold text-gray-800">
                            {item.wearerName}
                          </td>
                          <td className="p-3 text-red-900 font-bold bg-red-50/50">
                            {item.reworkNotes || 'Silayi theek karein aur dobara submit karein.'}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedSuitForSpecs(item)}
                                className="bg-gray-100 hover:bg-[#0F172A] text-gray-800 hover:text-[#DFAC43] text-xs font-black px-3 py-1.5 rounded transition flex items-center gap-1 border border-gray-200 cursor-pointer"
                              >
                                <FiFileText /> Naap
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSubmitForQC(item.orderId, item.suitId)}
                                disabled={isSubmitting}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-3.5 py-1.5 rounded transition shadow-xs flex items-center gap-1 cursor-pointer"
                              >
                                <FiCheckCircle /> Re-Submit QC
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* 4. COMPLETED & APPROVED TAB */}
            {activeTab === 'completed' && (
              filteredStitched.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
                  <FiCheckCircle className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 font-bold text-sm">Abhi tak koi suit approved nahi hua.</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                        <th className="p-3">Order / Suit ID</th>
                        <th className="p-3">Fabric Details</th>
                        <th className="p-3">Wearer / Customer</th>
                        <th className="p-3 text-right">Earned Wage</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStitched.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="p-3 whitespace-nowrap">
                            <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                              {item.suitNumber || `BT-${item.orderNumber}-${item.suitIndex || 1}`}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-black text-gray-900 block">{item.fabricDetails}</span>
                            {item.volumeNo && <span className="text-[10px] text-gray-500 font-medium">Vol: {item.volumeNo}</span>}
                          </td>
                          <td className="p-3 font-bold text-gray-800">
                            {item.wearerName || item.customerName}
                          </td>
                          <td className="p-3 text-right font-black text-green-600 font-sans whitespace-nowrap">
                            + Rs {worker.perSuitWage}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className="bg-green-100 text-green-800 border border-green-200 px-2.5 py-0.5 rounded text-[10px] font-black uppercase inline-flex items-center gap-1">
                              <FiCheckCircle /> QC Passed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* 5. LEDGER TAB */}
            {activeTab === 'ledger' && (
              <div className="space-y-6 animate-fade-in">
                {/* Active Ledger table */}
                <div className="bg-white border border-gray-200 rounded p-5 shadow-sm space-y-4">
                  <h3 className="font-black text-black text-sm uppercase tracking-wider border-b border-gray-100 pb-2">Active Ledger (Pending Settle)</h3>
                  {loadingLedger ? (
                    <div className="text-center py-4 text-xs text-gray-500">Loading ledger entries...</div>
                  ) : ledgerData.filter(e => e.status === 'Pending').length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No pending entries. Your account is fully settled!</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50 text-gray-600 font-bold uppercase border-b border-gray-200 text-[10px]">
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Details</th>
                            <th className="p-2.5 text-right">Wages (+)</th>
                            <th className="p-2.5 text-right">Advance (-)</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {ledgerData.filter(e => e.status === 'Pending').map(entry => (
                            <tr key={entry._id} className="hover:bg-gray-50">
                              <td className="p-2.5 text-gray-500 font-semibold">{new Date(entry.date).toLocaleDateString()}</td>
                              <td className="p-2.5 font-bold text-gray-800">{entry.description}</td>
                              <td className="p-2.5 text-right font-black text-green-600 font-sans">
                                {entry.type === 'suit' ? `+ Rs ${entry.amount}` : '-'}
                              </td>
                              <td className="p-2.5 text-right font-black text-red-600 font-sans">
                                {entry.type === 'advance' ? `${entry.amount > 0 ? '-' : '+'} Rs ${Math.abs(entry.amount)}` : '-'}
                              </td>
                              <td className="p-2.5 text-center">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                  {entry.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Settle/Payment logs */}
                <div className="bg-white border border-gray-200 rounded p-5 shadow-sm space-y-4">
                  <h3 className="font-black text-black text-sm uppercase tracking-wider border-b border-gray-100 pb-2">Paid Salary History</h3>
                  {loadingPayments ? (
                    <div className="text-center py-4 text-xs text-gray-500">Loading payment history...</div>
                  ) : paymentsData.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No paid salary records found.</p>
                  ) : (
                    <div className="space-y-3">
                      {paymentsData.map(p => (
                        <div key={p._id} className="border border-gray-150 rounded-xl p-3 bg-gray-50/50 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                          <div>
                            <p className="font-bold text-gray-900">Period: {new Date(p.startDate).toLocaleDateString()} to {new Date(p.endDate).toLocaleDateString()}</p>
                            {p.notes && <p className="text-gray-500 text-[11px] mt-0.5">Notes: {p.notes}</p>}
                            <p className="text-[9px] text-gray-400 mt-1">Paid on: {new Date(p.paymentDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-3 items-center justify-between sm:justify-end shrink-0">
                            <div className="text-right text-[11px]">
                              <span className="text-gray-450 block font-semibold text-[9px] uppercase text-gray-400">Earned / Advance</span>
                              <span className="font-bold text-gray-750 font-sans">Rs {p.totalEarned} / Rs {p.totalAdvance}</span>
                            </div>
                            <div className="bg-green-105 border border-green-200 text-green-800 px-3 py-1 rounded-lg font-black text-xs font-sans">
                              Net Paid: Rs {p.netPaid}
                            </div>
                            <button
                              onClick={() => setViewingPayment(p)}
                              className="bg-black hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black px-3.5 py-1.5 rounded text-xs transition border border-black uppercase cursor-pointer"
                            >
                              View Detail
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </section>

      </main>

      {/* Suit Naap & Specifications Modal */}
      {selectedSuitForSpecs && (
        <SuitSpecsModal
          suit={selectedSuitForSpecs}
          worker={worker}
          closeModal={() => setSelectedSuitForSpecs(null)}
          onSubmitForQC={handleSubmitForQC}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Receipt Slip Modal */}
      {viewingPayment && (
        <PaymentReceiptModal
          payment={viewingPayment}
          worker={worker}
          closeModal={() => setViewingPayment(null)}
        />
      )}

    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT: SUIT SPECIFICATIONS & AUTHENTIC JOB PARCHI MODAL
// -------------------------------------------------------------
const SuitSpecsModal = ({ suit, worker, closeModal, onSubmitForQC, isSubmitting }) => {
  if (!suit) return null;

  const suitIdBadge = suit.suitNumber || (suit.orderNumber ? `BT-${suit.orderNumber}-${suit.suitIndex || 1}` : 'BT-SUIT');
  const wearer = suit.wearer || {};
  const measurements = (suit.measurements && suit.measurements.length > 0) 
    ? suit.measurements 
    : (wearer.measurements || []);
  const prefs = suit.stitchingPreferences || wearer.stitchingPreferences || {};

  // Extract direct active preferences chosen by customer from all sources
  const prefValuesFromObj = [
    prefs.collar,
    prefs.sleeves,
    prefs.daman,
    prefs.frontPocket,
    prefs.sidePockets,
    prefs.shalwarPocket,
    prefs.patti,
    prefs.stitchingStyle,
    prefs.otherPreferences
  ].filter(Boolean);

  const rawTags = [
    ...(Array.isArray(prefs.tags) ? prefs.tags : []),
    ...(Array.isArray(suit.staticTags) ? suit.staticTags : [])
  ];

  // Deduplicate all active preferences
  const prefValues = Array.from(new Set([...prefValuesFromObj, ...rawTags])).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 font-sans">
      <div className="bg-white rounded shadow-2xl w-full max-w-4xl border overflow-hidden flex flex-col max-h-[94vh] animate-fade-in">
        
        {/* HEADER */}
        <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex justify-between items-center shrink-0 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-6 bg-[#DFAC43] rounded"></span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Suit Specifications & Job Order Form</h3>
                <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2.5 py-0.5 rounded shadow-xs">
                  #{suitIdBadge}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Order #BT-{suit.orderNumber} | Customer: {suit.customerName || 'Walk-in'}</p>
            </div>
          </div>
          <button 
            onClick={closeModal} 
            className="text-gray-400 hover:text-white p-1 text-2xl leading-none transition cursor-pointer"
          >
            <FiX />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE AUTHENTIC JOB PARCHI) */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-gray-100/70 space-y-4">
          
          <div className="bg-white border-2 rounded p-4 sm:p-5 bg-linear-to-b from-white to-gray-50/50 shadow-xs space-y-4">
            
            {/* PARCHI HEADER BANNER */}
            <div className="flex flex-wrap justify-between items-center border-b-2 border-black pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-black text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
                    JOB PARCHI
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-black uppercase tracking-wider">
                    Suit Cutting & Stitching Order Form
                  </h4>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                  Order #BT-{suit.orderNumber} | Suit ID: <strong className="text-black">{suitIdBadge}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Delivery Due:</span>
                <span className="text-xs sm:text-sm font-black text-red-600">
                  {new Date(suit.deliveryDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* PARCHI METADATA GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Customer:</span>
                <span className="font-black text-gray-900">{suit.customerName || 'Walk-in'}</span>
                <p className="text-[10px] text-gray-500 font-semibold">{suit.customerPhone || '-'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Wearer:</span>
                <span className="font-black text-blue-700">{suit.wearerName || wearer.name || suit.customerName || 'Customer'}</span>
                {wearer.relation && <p className="text-[10px] text-gray-500 font-medium">Rel: {wearer.relation}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Fabric & Volume:</span>
                <span className="font-black text-gray-900">{suit.fabricDetails}</span>
                {suit.volumeNo && <p className="text-[10px] text-gray-500 font-medium">Vol: {suit.volumeNo}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Your Wage:</span>
                <span className="font-black text-green-700 text-sm">Rs {worker?.perSuitWage || suit.price}</span>
              </div>
            </div>

            {/* STYLE & STITCHING PREFERENCES (DIRECT PREFERENCE VALUES) */}
            {prefValues.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FiTag className="text-[#DFAC43]" /> Style & Design Specifications
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {prefValues.map((val, pIdx) => (
                    <div key={pIdx} className="bg-white border-2 border-gray-200 p-2.5 rounded text-xs font-black text-gray-900 shadow-2xs flex items-center gap-1.5 hover:border-[#DFAC43] transition">
                      <FiCheck className="text-green-600 shrink-0 text-sm" />
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADD-ONS IN DEDICATED SEPARATE LINE */}
            {suit.customizations && suit.customizations.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded flex items-center flex-wrap gap-2 text-xs">
                <span className="font-black text-amber-950 uppercase text-[10px] shrink-0 flex items-center gap-1">
                  <FiTag className="text-amber-700" /> Add-on Customizations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suit.customizations.map((c, cIdx) => (
                    <span key={`cust-${cIdx}`} className="bg-[#0F172A] text-[#DFAC43] px-2.5 py-0.5 rounded text-[10px] font-black shadow-2xs">
                      + {c.name} {c.urduName ? `(${c.urduName})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SPECIAL TAILOR INSTRUCTIONS */}
            {suit.customDesign && (
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded p-3 space-y-1">
                <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <FiScissors className="text-amber-800" /> Special Tailor Instructions:
                </span>
                <p className="text-xs sm:text-sm font-black text-gray-900 leading-relaxed font-sans text-right" dir="rtl">
                  {suit.customDesign}
                </p>
              </div>
            )}

            {/* FULL BODY MEASUREMENTS */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center bg-gray-100 px-3 py-1.5 rounded border border-gray-200">
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FiScissors className="text-[#DFAC43]" /> Complete Measurements
                </span>
                <span className="text-[10px] text-gray-500 font-bold">Inches</span>
              </div>

              <div className="space-y-3">
                {(!measurements || measurements.length === 0) ? (
                  <div className="text-center py-4 bg-gray-50 border border-gray-200 rounded text-gray-400 italic text-xs">
                    Is suit / wearer ke liye koi naap save nahi hai.
                  </div>
                ) : (
                  measurements.map((meas, mIdx) => {
                    const dataObj = meas.data instanceof Map ? Object.fromEntries(meas.data) : (meas.data || {});
                    const keys = Object.keys(dataObj);
                    return (
                      <div key={mIdx} className="space-y-1.5">
                        {meas.category && (
                          <span className="inline-block bg-[#0F172A] text-[#DFAC43] text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                            {meas.category}
                          </span>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {keys.map((key) => (
                            <div key={key} className="bg-white border-2 border-gray-200 p-2 rounded text-center shadow-2xs hover:border-[#DFAC43] transition">
                              <span className="text-[10px] font-bold text-gray-500 uppercase block truncate">{key}</span>
                              <span className="text-sm sm:text-base font-black text-gray-900 font-sans">{dataObj[key] || '-'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* FABRIC IMAGE PREVIEW (IF AVAILABLE) */}
            {suit.fabricImage?.url && (
              <div className="pt-2 border-t border-gray-200 flex items-center gap-3 bg-gray-50 p-2.5 rounded border">
                <img 
                  src={suit.fabricImage.url} 
                  alt="Suit Fabric" 
                  className="h-16 w-16 object-cover rounded border border-gray-300 shadow-2xs"
                />
                <div className="text-xs">
                  <span className="font-bold text-gray-800 block">Fabric Photo Attached</span>
                  <a href={suit.fabricImage.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 font-bold hover:underline">
                    Click here to open high-res fabric photo
                  </a>
                </div>
              </div>
            )}

            {/* PARCHI BOTTOM NOTE */}
            <div className="pt-2 border-t border-gray-200 text-center">
              <p className="text-[10px] text-gray-400 italic">
                * Follow cutting measurements and tailor instructions carefully.
              </p>
            </div>

          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-white border-t border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-gray-500">
            Suit Status: <span className="font-black text-black">{suit.stitchingStatus}</span>
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>

            {suit.stitchingStatus !== 'Stitched' && suit.stitchingStatus !== 'Submitted for Inspection' && (
              <button
                type="button"
                onClick={() => onSubmitForQC(suit.orderId, suit.suitId)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black px-5 py-2.5 rounded text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FiCheckCircle /> Submit for QC Inspection
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT: PAYMENT DETAILS MODAL (VIEW ONLY - WORKER PORTAL)
// -------------------------------------------------------------
const PaymentReceiptModal = ({ payment, worker, closeModal }) => {
  const { data: shopSettings } = useGetShopSettings();

  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';
  const tagline = shopSettings?.tagline || 'Gents Shalwar Qameez Specialist';
  const proprietor = shopSettings?.proprietor || 'Zubair Balouch';
  const primaryPhone = shopSettings?.primaryPhone || '0313-4389192';
  const secondaryPhone = shopSettings?.secondaryPhone || '0306-7379919';
  const address = shopSettings?.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan';

  const receiptNum = `#SR-${payment._id.substring(payment._id.length - 6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 font-sans overflow-y-auto">
      <div className="bg-white rounded shadow-2xl max-w-xl w-full border overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* HEADER */}
        <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex justify-between items-center shrink-0 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-6 bg-[#DFAC43] rounded"></span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Salary Payment & Settlement Details</h3>
                <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2.5 py-0.5 rounded shadow-xs">
                  {receiptNum}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Paid Salary Record & Wage Statement</p>
            </div>
          </div>
          <button 
            onClick={closeModal} 
            className="text-gray-400 hover:text-white p-1 text-2xl leading-none transition cursor-pointer"
          >
            <FiX />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-100/70 space-y-4">
          <div className="bg-white border-2 rounded p-4 sm:p-5 bg-linear-to-b from-white to-gray-50/50 shadow-xs space-y-4">
            
            {/* BRAND HEADER BANNER */}
            <div className="text-center space-y-1 pb-3 border-b-2 border-black">
              {currentLogo && (
                <div className="flex justify-center mb-1">
                  <img 
                    src={currentLogo} 
                    alt={shopName} 
                    className="h-10 max-w-[120px] object-contain" 
                  />
                </div>
              )}
              
              <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black leading-tight">
                {shopName}
              </h2>
              
              <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase -mt-0.5">
                {tagline}
              </p>
              
              <div className="pt-1">
                <span className="inline-block bg-[#0F172A] text-white text-[10px] font-black px-3.5 py-0.5 uppercase tracking-widest rounded-xs">
                  KARIGAR SALARY PAYMENT RECEIPT
                </span>
              </div>
            </div>

            {/* RECEIPT & SETTLEMENT METADATA GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-gray-50 p-3 rounded border border-gray-200 text-xs font-semibold">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Receipt No:</span>
                  <span className="font-black text-black font-mono">{receiptNum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Date:</span>
                  <span className="font-black text-gray-900 font-sans">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Karigar Name:</span>
                  <span className="font-black text-blue-700">{worker.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Settlement Period:</span>
                  <span className="font-bold text-gray-800 font-sans">
                    {new Date(payment.startDate).toLocaleDateString()} - {new Date(payment.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* WAGES & DEDUCTIONS SUMMARY TABLE */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider block">
                Wages & Deductions Summary
              </span>
              
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] border-b border-gray-200">
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 text-right">Amount (Rs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    <tr className="hover:bg-gray-50">
                      <td className="p-2.5 text-gray-800 font-medium">Total Stitching Wages Earned (Wages Credit)</td>
                      <td className="p-2.5 text-right font-black text-green-700 font-sans">+ Rs {Number(payment.totalEarned || 0).toLocaleString()}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-2.5 text-gray-800 font-medium">Advance Deductions (Deductions Debit)</td>
                      <td className="p-2.5 text-right font-black text-red-600 font-sans">- Rs {Number(payment.totalAdvance || 0).toLocaleString()}</td>
                    </tr>
                    <tr className="bg-gray-50 border-t-2 border-black font-black">
                      <td className="p-2.5 uppercase text-gray-900 font-black">Net Cash Paid Out</td>
                      <td className="p-2.5 text-right text-sm font-black font-sans text-black">Rs {Number(payment.netPaid || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* NOTES (IF ANY) */}
            {payment.notes && (
              <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded text-xs space-y-0.5">
                <span className="font-black uppercase text-amber-950 block text-[10px]">
                  Payment Notes:
                </span>
                <p className="font-medium text-gray-800 italic leading-relaxed">
                  {payment.notes}
                </p>
              </div>
            )}

            {/* AUTHENTIC OFFICIAL PAID & SETTLED STAMP */}
            <div className="flex justify-center my-2 py-1">
              <div className="border-2 border-dashed border-green-600 text-green-700 font-black text-xs uppercase px-5 py-2 rounded tracking-widest inline-flex items-center gap-2 bg-green-50 shadow-2xs rotate-[-1deg]">
                <FiCheckCircle className="text-base text-green-600" />
                <span>PAID & SETTLED</span>
              </div>
            </div>

            {/* SHOP & PROPRIETOR FOOTER */}
            <div className="pt-3 border-t-2 border-black text-center space-y-0.5 text-black">
              <p className="font-black text-[10px] uppercase tracking-wider">
                Proprietor: {proprietor}
              </p>
              <p className="font-black text-[10px] font-sans flex items-center justify-center gap-1.5">
                <FiPhone className="text-gray-600 text-[10px]" /> {primaryPhone}{secondaryPhone ? ` | ${secondaryPhone}` : ''}
              </p>
              <p className="text-[9px] text-gray-600 leading-tight">
                {address}
              </p>
            </div>

          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 border-t border-gray-200 bg-white flex justify-between items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-gray-500">
            Payment Status: <strong className="text-green-700 uppercase">Paid & Settled</strong>
          </span>
          <button
            type="button"
            onClick={closeModal}
            className="px-5 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] rounded font-black text-xs transition cursor-pointer shadow"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default WorkerDashboard;
