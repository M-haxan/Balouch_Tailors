import React, { useState, useMemo, useEffect } from 'react';
import { useGetWorkerDashboard, useSubmitSuitForInspection, useGetWorkerLedger, useGetWorkerPayments } from '../hooks/useWorkers';
import { useGetOrders, useDeliverOrder } from '../hooks/useOrder';
import { useGetShopSettings } from '../hooks/useShopSettings';
import useAuthStore from '../Store/authStore';
import { useNavigate } from 'react-router-dom';
import defaultLogo from '../assets/BT_Logo.png';
import { formatPhone } from '../utils/formatters';
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
  FiCreditCard,
  FiShoppingBag,
  FiTruck,
  FiPlus
} from 'react-icons/fi';
import Preloader from '../components/Preloader';
import Pagination from '../components/Pagination';
import DeliveryReceiptModal from '../components/DeliveryReceiptModal';
import LanguageToggle from '../components/LanguageToggle';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const workerId = user?.id || user?._id;
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned', 'inspection', 'rework', 'completed', 'ledger', or 'delivery_counter'
  const [viewingPayment, setViewingPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deliverySearchTerm, setDeliverySearchTerm] = useState('');
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [selectedSuitForSpecs, setSelectedSuitForSpecs] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Delivery Modal States for counter delivery
  const [orderToDeliver, setOrderToDeliver] = useState(null);
  const [deliverySettlementData, setDeliverySettlementData] = useState(null);
  const [showDeliveryReceipt, setShowDeliveryReceipt] = useState(false);

  // Fetch only active tab records with server-side pagination & search
  const { data: dashboardData, isLoading, refetch } = useGetWorkerDashboard({
    tab: activeTab === 'delivery_counter' ? 'assigned' : activeTab,
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchTerm
  });

  // Orders for Delivery Counter (active when worker has permission)
  const { data: ordersResponse, isLoading: loadingOrders } = useGetOrders({
    page: 1,
    limit: 100,
    search: deliverySearchTerm
  });

  const { mutate: submitForQC, isPending: isSubmitting } = useSubmitSuitForInspection();
  const { data: ledgerData = [], isLoading: loadingLedger } = useGetWorkerLedger(workerId);
  const { data: paymentsData = [], isLoading: loadingPayments } = useGetWorkerPayments(workerId);

  const { 
    worker = {}, 
    stats = {}, 
    suits: tabSuits = [],
    pagination = { totalRecords: 0, currentPage: 1, totalPages: 1, pageSize: PAGE_SIZE },
    assignedSuits = [], 
    underInspectionSuits = [], 
    reworkSuits = [], 
    stitchedSuits = [] 
  } = dashboardData || {};

  // Check worker special permissions
  const canCreateOrder = Boolean(worker?.canCreateOrder ?? user?.canCreateOrder);
  const canDeliverOrder = Boolean(worker?.canDeliverOrder ?? user?.canDeliverOrder);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setCurrentPage(1);
    if (tabName === 'delivery_counter') {
      setDeliveryPage(1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleLogout = () => {
    logout();
    navigate('/worker/login');
  };

  const handleSubmitForQC = (orderId, suitId) => {
    submitForQC({ orderId, suitId }, {
      onSuccess: () => {
        refetch();
        if (selectedSuitForSpecs && selectedSuitForSpecs.suitId === suitId) {
          setSelectedSuitForSpecs(null);
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Preloader />
      </div>
    );
  }

  const assignedCount = stats.assignedCount !== undefined ? stats.assignedCount : assignedSuits.length;
  const inspectionCount = stats.inspectionCount !== undefined ? stats.inspectionCount : underInspectionSuits.length;
  const reworkCount = stats.reworkCount !== undefined ? stats.reworkCount : reworkSuits.length;
  const completedCount = stats.completedCount !== undefined ? stats.completedCount : stitchedSuits.length;

  // Active tab suits (server-side paginated)
  const currentSuits = tabSuits.length > 0 || pagination.totalRecords > 0 ? tabSuits : (
    activeTab === 'assigned' ? assignedSuits.slice(0, PAGE_SIZE) :
    activeTab === 'inspection' ? underInspectionSuits.slice(0, PAGE_SIZE) :
    activeTab === 'rework' ? reworkSuits.slice(0, PAGE_SIZE) :
    stitchedSuits.slice(0, PAGE_SIZE)
  );

  const pendingLedger = Array.isArray(ledgerData) ? ledgerData.filter(e => e.status === 'Pending') : (ledgerData?.data || []).filter(e => e.status === 'Pending');
  const paginatedLedger = pendingLedger.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const paymentsList = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.data || []);
  const paginatedPayments = paymentsList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalFilteredMatches = pagination.totalRecords || (assignedCount + inspectionCount + reworkCount + completedCount);

  // Delivery Orders Filtering - Strictly filter out orders that are 'Delivered'
  const allOrdersList = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.data || []);
  const undeliveredOrders = allOrdersList.filter(o => o.orderStatus !== 'Delivered');
  const paginatedDeliveryOrders = undeliveredOrders.slice((deliveryPage - 1) * PAGE_SIZE, deliveryPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      
      {/* MOBILE-FRIENDLY HEADER */}
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

      <main className="w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        
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
              <span className="font-bold text-gray-700">{formatPhone(worker.phone)}</span>
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
                placeholder="Search Suit ID, Order #, Wearer, Fabric..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 focus:border-black focus:bg-white rounded outline-none text-xs sm:text-sm font-bold text-gray-900 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
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
                  Found <span className="text-black font-black">{totalFilteredMatches}</span> matching records
                </span>
                <button 
                  onClick={() => { setSearchTerm(''); setCurrentPage(1); }} 
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
              onClick={() => handleTabChange('assigned')}
              className={`flex-1 min-w-[100px] py-2.5 px-3 text-xs md:text-sm font-black rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'assigned' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Assigned ({assignedCount})
            </button>
            <button
              onClick={() => handleTabChange('inspection')}
              className={`flex-1 min-w-[110px] py-2.5 px-3 text-xs md:text-sm font-black rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'inspection' ? 'bg-amber-400 text-black shadow-sm font-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              <FiClock /> In QC ({inspectionCount})
            </button>
            {reworkCount > 0 && (
              <button
                onClick={() => handleTabChange('rework')}
                className={`flex-1 min-w-[110px] py-2.5 px-3 text-xs md:text-sm font-black rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'rework' ? 'bg-red-600 text-white shadow-sm font-black animate-pulse' : 'text-red-600 hover:bg-red-100'
                }`}
              >
                <FiAlertTriangle /> Rework ({reworkCount})
              </button>
            )}
            <button
              onClick={() => handleTabChange('completed')}
              className={`flex-1 min-w-[100px] py-2.5 px-3 text-xs md:text-sm font-black rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'completed' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Approved ({completedCount})
            </button>
            <button
              onClick={() => handleTabChange('ledger')}
              className={`flex-1 min-w-[90px] py-2.5 px-3 text-xs md:text-sm font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'ledger' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Ledger
            </button>

            {/* Special Permission: Delivery Counter Tab */}
            {canDeliverOrder && (
              <button
                onClick={() => handleTabChange('delivery_counter')}
                className={`flex-1 min-w-[130px] py-2.5 px-3 text-xs md:text-sm font-black rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'delivery_counter' 
                    ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm font-black' 
                    : 'bg-emerald-100/70 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                <FiTruck /> Delivery Counter ({undeliveredOrders.length})
              </button>
            )}
          </div>

          {/* TAB CONTENT */}
          <div className="space-y-4">
            
            {/* 1. ASSIGNED TAB (PENDING STITCHING) */}
            {activeTab === 'assigned' && (
              currentSuits.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
                  <FiBox className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 font-bold text-sm">
                    {searchTerm ? 'No assigned suits matched your search.' : 'No pending suits assigned currently.'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Contact admin for new stitching assignments.</p>
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
                      {currentSuits.map((item, idx) => (
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
                                <FiFileText /> Measurements & Specs
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
                  <Pagination 
                    currentPage={currentPage}
                    totalItems={pagination.totalRecords || assignedCount}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )
            )}

            {/* 2. UNDER INSPECTION TAB */}
            {activeTab === 'inspection' && (
              currentSuits.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
                  <FiClock className="text-4xl text-amber-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-bold text-sm">
                    {searchTerm ? 'No suits under QC matched your search.' : 'No suits currently under Admin Inspection.'}
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
                      {currentSuits.map((item, idx) => (
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
                              <FiFileText /> Measurements & Specs
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination 
                    currentPage={currentPage}
                    totalItems={pagination.totalRecords || inspectionCount}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )
            )}

            {/* 3. REWORK REQUIRED TAB */}
            {activeTab === 'rework' && (
              currentSuits.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
                  <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500 font-bold text-sm">No alterations or rework pending!</p>
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
                      {currentSuits.map((item, idx) => (
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
                            {item.reworkNotes || 'Please correct stitching and re-submit for QC.'}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedSuitForSpecs(item)}
                                className="bg-gray-100 hover:bg-[#0F172A] text-gray-800 hover:text-[#DFAC43] text-xs font-black px-3 py-1.5 rounded transition flex items-center gap-1 border border-gray-200 cursor-pointer"
                              >
                                <FiFileText /> Measurements
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
                  <Pagination 
                    currentPage={currentPage}
                    totalItems={pagination.totalRecords || reworkCount}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )
            )}

            {/* 4. COMPLETED & APPROVED TAB */}
            {activeTab === 'completed' && (
              currentSuits.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
                  <FiCheckCircle className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 font-bold text-sm">No suits approved yet.</p>
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
                      {currentSuits.map((item, idx) => (
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
                  <Pagination 
                    currentPage={currentPage}
                    totalItems={pagination.totalRecords || completedCount}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                  />
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
                  ) : pendingLedger.length === 0 ? (
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
                          {paginatedLedger.map(entry => (
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
                      <Pagination 
                        currentPage={currentPage}
                        totalItems={pendingLedger.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setCurrentPage}
                      />
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
                      {paginatedPayments.map(p => (
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
                      <Pagination 
                        currentPage={currentPage}
                        totalItems={paymentsData.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. DELIVERY & CASH COUNTER TAB */}
            {activeTab === 'delivery_counter' && canDeliverOrder && (
              <div className="space-y-4 animate-fade-in">
                {/* Search Bar specifically for Delivery */}
                <div className="bg-white p-3 sm:p-4 rounded border border-gray-200 shadow-xs space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <FiTruck className="text-[#DFAC43]" /> Ready Suits Delivery & Cash Counter
                      </h3>
                      <p className="text-xs text-gray-500">Search customer orders to settle remaining payment and generate official Delivery Slip.</p>
                    </div>
                    {canCreateOrder && (
                      <button
                        onClick={() => navigate('/worker/orders/create')}
                        className="bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] px-3 py-1.5 rounded font-black text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer self-stretch sm:self-auto justify-center"
                      >
                        <FiPlus /> + Book New Order
                      </button>
                    )}
                  </div>

                  <div className="relative pt-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Search order by #BT number, customer name or phone..."
                      value={deliverySearchTerm}
                      onChange={(e) => {
                        setDeliverySearchTerm(e.target.value);
                        setDeliveryPage(1);
                      }}
                      className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded text-xs font-bold outline-none"
                    />
                    {deliverySearchTerm && (
                      <button
                        onClick={() => {
                          setDeliverySearchTerm('');
                          setDeliveryPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5 cursor-pointer"
                        title="Clear Search"
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                </div>

                {loadingOrders ? (
                  <div className="p-10 text-center text-gray-400 font-bold">Loading delivery counter orders...</div>
                ) : undeliveredOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
                    <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
                    <p className="text-gray-700 font-bold text-sm">
                      {deliverySearchTerm ? 'No undelivered orders matched your search.' : 'No pending delivery orders.'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">All orders have been delivered or no pending orders exist.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
                    <table className="w-full min-w-[850px] text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#0F172A] text-[#DFAC43] font-black uppercase text-[10px] border-b border-gray-800 whitespace-nowrap">
                          <th className="p-3">Order #</th>
                          <th className="p-3">Customer Details</th>
                          <th className="p-3">Suits / Items</th>
                          <th className="p-3 text-right">Total Bill</th>
                          <th className="p-3 text-right">Advance Paid</th>
                          <th className="p-3 text-right">Balance Due</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Counter Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {paginatedDeliveryOrders.map((order) => {
                          const balanceDue = Number(order.balanceAmount) || 0;
                          return (
                            <tr key={order._id} className="hover:bg-gray-50/80 transition">
                              
                              {/* Order Number & Booking Date */}
                              <td className="p-3 whitespace-nowrap">
                                <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-xs font-black px-2 py-0.5 rounded shadow-2xs block w-fit">
                                  #BT-{order.orderNumber}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono block mt-1">
                                  {order.bookingDate ? new Date(order.bookingDate).toLocaleDateString() : (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-')}
                                </span>
                              </td>

                              {/* Customer Details */}
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-bold text-gray-900 block">{order.customer?.name || 'Walk-in Customer'}</span>
                                <span className="text-[11px] text-gray-500 font-mono font-semibold flex items-center gap-1 mt-0.5">
                                  <FiPhone className="text-gray-400 text-[10px]" /> {formatPhone(order.customer?.phone)}
                                </span>
                              </td>

                              {/* Suits list summary */}
                              <td className="p-3 max-w-[220px]">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-gray-800 text-[11px] block">
                                    {order.suits?.length || 1} Suit(s)
                                  </span>
                                  <p className="text-[10px] text-gray-500 truncate">
                                    {order.suits && order.suits.map(s => s.serviceType || 'Shalwar Qameez').join(', ')}
                                  </p>
                                </div>
                              </td>

                              {/* Total Bill */}
                              <td className="p-3 text-right font-black text-gray-900 font-sans whitespace-nowrap">
                                Rs {Number(order.totalAmount || 0).toLocaleString()}
                              </td>

                              {/* Advance Paid */}
                              <td className="p-3 text-right font-bold text-green-700 font-sans whitespace-nowrap">
                                Rs {Number(order.advancePaid || 0).toLocaleString()}
                              </td>

                              {/* Balance Due */}
                              <td className="p-3 text-right whitespace-nowrap">
                                <span className={`font-black font-sans text-xs px-2 py-0.5 rounded ${
                                  balanceDue > 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>
                                  Rs {balanceDue.toLocaleString()}
                                </span>
                              </td>

                              {/* Order Status */}
                              <td className="p-3 text-center whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block ${
                                  order.orderStatus === 'Completed' 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="flex justify-end items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/print/${order._id}`)}
                                    className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition border border-gray-200 cursor-pointer"
                                    title="View & Print Customer Booking Slip"
                                  >
                                    <FiPrinter className="text-xs" />
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => setOrderToDeliver(order)}
                                    className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] text-xs font-black px-3 py-1.5 rounded transition flex items-center gap-1 cursor-pointer shadow-xs"
                                  >
                                    <FiCheckCircle className="text-xs" /> Deliver & Cash
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    <Pagination 
                      currentPage={deliveryPage}
                      totalItems={undeliveredOrders.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setDeliveryPage}
                    />
                  </div>
                )}
              </div>
            )}

          </div>

        </section>

      </main>

      {/* Suit Naap & Specifications Modal */}
      {selectedSuitForSpecs && (
        <SuitSpecsModal
          suit={selectedSuitForSpecs}
          allSuits={[...assignedSuits, ...underInspectionSuits, ...reworkSuits, ...stitchedSuits]}
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

      {/* Worker Order Delivery & Settlement Modal */}
      {orderToDeliver && (
        <WorkerOrderDeliveryModal
          order={orderToDeliver}
          worker={worker}
          closeModal={() => setOrderToDeliver(null)}
          onDelivered={(settlement) => {
            setDeliverySettlementData(settlement);
            setShowDeliveryReceipt(true);
          }}
        />
      )}

      {/* Official Delivery & Cash Receiving Slip */}
      {showDeliveryReceipt && orderToDeliver && (
        <DeliveryReceiptModal
          order={orderToDeliver}
          settlementData={deliverySettlementData}
          closeModal={() => {
            setShowDeliveryReceipt(false);
            setOrderToDeliver(null);
            setDeliverySettlementData(null);
          }}
        />
      )}

    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT: SUIT SPECIFICATIONS & AUTHENTIC JOB PARCHI MODAL
// -------------------------------------------------------------
const SuitSpecsModal = ({ suit: initialSuit, allSuits = [], worker, closeModal, onSubmitForQC, isSubmitting }) => {
  const [activeSuit, setActiveSuit] = useState(initialSuit);

  useEffect(() => {
    setActiveSuit(initialSuit);
  }, [initialSuit]);

  if (!activeSuit) return null;

  // Find all suits belonging to this same order assigned to the karigar
  const orderSuits = useMemo(() => {
    if (!activeSuit || !allSuits || allSuits.length === 0) return [activeSuit];
    const list = allSuits.filter(s => 
      (s.orderId && s.orderId === activeSuit.orderId) || 
      (s.orderNumber && s.orderNumber === activeSuit.orderNumber)
    );
    const seen = new Set();
    const deduped = [];
    for (const item of list) {
      const key = item.suitId || item._id || item.suitNumber || `${item.orderNumber}-${item.suitIndex}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(item);
      }
    }
    return deduped.length > 0 ? deduped : [activeSuit];
  }, [activeSuit, allSuits]);

  const suitIdBadge = activeSuit.suitNumber || (activeSuit.orderNumber ? `BT-${activeSuit.orderNumber}-${activeSuit.suitIndex || 1}` : 'BT-SUIT');
  const wearer = activeSuit.wearer || {};
  const measurements = (activeSuit.measurements && activeSuit.measurements.length > 0) 
    ? activeSuit.measurements 
    : (wearer.measurements || []);
  const prefs = activeSuit.stitchingPreferences || wearer.stitchingPreferences || {};

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
    ...(Array.isArray(activeSuit.staticTags) ? activeSuit.staticTags : [])
  ];

  // Deduplicate all active preferences
  const prefValues = Array.from(new Set([...prefValuesFromObj, ...rawTags])).filter(Boolean);

  const pendingSuitsInOrder = orderSuits.filter(s => s.stitchingStatus !== 'Stitched' && s.stitchingStatus !== 'Submitted for Inspection');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 font-sans">
      <div className="bg-white rounded shadow-2xl w-full max-w-4xl border overflow-hidden flex flex-col max-h-[94vh] animate-fade-in">
        
        {/* HEADER */}
        <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex justify-between items-center shrink-0 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-6 bg-[#DFAC43] rounded"></span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">Suit Specifications & Job Order Form</h3>
                <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2.5 py-0.5 rounded shadow-xs">
                  #{suitIdBadge}
                </span>
                {orderSuits.length > 1 && (
                  <span className="bg-blue-900/80 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-700">
                    {orderSuits.length} Suits in this Order
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Order #BT-{activeSuit.orderNumber} | Customer: {activeSuit.customerName || 'Walk-in'}</p>
            </div>
          </div>
          <button 
            onClick={closeModal} 
            className="text-gray-400 hover:text-white p-1 text-2xl leading-none transition cursor-pointer"
          >
            <FiX />
          </button>
        </div>

        {/* MULTI-SUIT SWITCHER TABS (IF CUSTOMER HAS MULTIPLE ASSIGNED SUITS) */}
        {orderSuits.length > 1 && (
          <div className="bg-[#1E293B] px-3 sm:px-5 py-2.5 border-b border-gray-700 flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
            <span className="text-gray-300 font-bold flex items-center gap-1.5 text-[11px]">
              <FiLayers className="text-[#DFAC43]" /> Select Garment / Fabric:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {orderSuits.map((s, idx) => {
                const isCurrent = (s.suitId && s.suitId === activeSuit.suitId) || (s.suitNumber && s.suitNumber === activeSuit.suitNumber);
                const badgeLabel = s.suitNumber || `Suit #${s.suitIndex || idx + 1}`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSuit(s)}
                    className={`px-3 py-1 rounded text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isCurrent 
                        ? 'bg-[#DFAC43] text-[#0F172A] ring-2 ring-white/20' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                    }`}
                  >
                    <span>{badgeLabel}</span>
                    {s.fabricDetails && (
                      <span className="text-[10px] font-medium opacity-80 truncate max-w-[90px]">({s.fabricDetails})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
                  Order #BT-{activeSuit.orderNumber} | Active Suit: <strong className="text-black">{suitIdBadge}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Delivery Due:</span>
                <span className="text-xs sm:text-sm font-black text-red-600">
                  {new Date(activeSuit.deliveryDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* PARCHI METADATA GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Customer:</span>
                <span className="font-black text-gray-900">{activeSuit.customerName || 'Walk-in'}</span>
                <p className="text-[10px] text-gray-500 font-semibold">{activeSuit.customerPhone || '-'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Wearer:</span>
                <span className="font-black text-blue-700">{activeSuit.wearerName || wearer.name || activeSuit.customerName || 'Customer'}</span>
                {wearer.relation && <p className="text-[10px] text-gray-500 font-medium">Rel: {wearer.relation}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Fabric & Volume:</span>
                <span className="font-black text-gray-900">{activeSuit.fabricDetails || 'Fabric Details'}</span>
                {activeSuit.volumeNo && <p className="text-[10px] text-gray-500 font-medium">Vol: {activeSuit.volumeNo}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Your Wage:</span>
                <span className="font-black text-green-700 text-sm">Rs {worker?.perSuitWage || activeSuit.price}</span>
              </div>
            </div>

            {/* ALL SUITS IN ORDER (EXPANDED GRID IF > 1 SUIT) */}
            {orderSuits.length > 1 && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center bg-gray-100 px-3 py-1.5 rounded border border-gray-200">
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FiLayers className="text-[#DFAC43]" /> All {orderSuits.length} Suits in this Order (Same Measurements & Style)
                  </span>
                  <span className="text-[10px] text-green-700 font-black">Shared Specifications</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {orderSuits.map((s, sIdx) => {
                    const isSelected = (s.suitId && s.suitId === activeSuit.suitId) || (s.suitNumber && s.suitNumber === activeSuit.suitNumber);
                    const cardBadge = s.suitNumber || `BT-${s.orderNumber}-${s.suitIndex || sIdx + 1}`;
                    return (
                      <div 
                        key={sIdx}
                        onClick={() => setActiveSuit(s)}
                        className={`p-3 rounded border-2 transition cursor-pointer relative ${
                          isSelected 
                            ? 'border-[#DFAC43] bg-amber-50/60 shadow-xs ring-1 ring-[#DFAC43]' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                            {cardBadge}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            s.stitchingStatus === 'Stitched' ? 'bg-green-100 text-green-800' :
                            s.stitchingStatus === 'Submitted for Inspection' ? 'bg-amber-100 text-amber-800' :
                            s.stitchingStatus === 'Rework' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {s.stitchingStatus || 'Assigned'}
                          </span>
                        </div>
                        
                        <p className="text-xs font-black text-gray-900 truncate">{s.fabricDetails || 'Fabric Details'}</p>
                        {s.volumeNo && <p className="text-[10px] text-gray-500 font-medium">Vol: {s.volumeNo}</p>}

                        {s.fabricImage?.url && (
                          <div className="mt-2 flex items-center gap-2">
                            <img src={s.fabricImage.url} alt="fabric" className="w-8 h-8 rounded object-cover border border-gray-300" />
                            <a href={s.fabricImage.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-blue-600 font-bold hover:underline">
                              View Photo
                            </a>
                          </div>
                        )}

                        {s.stitchingStatus !== 'Stitched' && s.stitchingStatus !== 'Submitted for Inspection' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSubmitForQC(s.orderId, s.suitId);
                            }}
                            disabled={isSubmitting}
                            className="mt-2.5 w-full bg-black hover:bg-[#DFAC43] hover:text-black text-white text-[10px] font-black py-1.5 rounded transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <FiCheckCircle /> Submit QC
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
            {activeSuit.customizations && activeSuit.customizations.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded flex items-center flex-wrap gap-2 text-xs">
                <span className="font-black text-amber-950 uppercase text-[10px] shrink-0 flex items-center gap-1">
                  <FiTag className="text-amber-700" /> Add-on Customizations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeSuit.customizations.map((c, cIdx) => (
                    <span key={`cust-${cIdx}`} className="bg-[#0F172A] text-[#DFAC43] px-2.5 py-0.5 rounded text-[10px] font-black shadow-2xs">
                      + {c.name} {c.urduName ? `(${c.urduName})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SPECIAL TAILOR INSTRUCTIONS */}
            {activeSuit.customDesign && (
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded p-3 space-y-1">
                <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <FiScissors className="text-amber-800" /> Special Tailor Instructions:
                </span>
                <p className="text-xs sm:text-sm font-black text-gray-900 leading-relaxed font-sans text-right" dir="rtl">
                  {activeSuit.customDesign}
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
                    No measurements saved for this suit / wearer.
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

            {/* FABRIC IMAGE PREVIEW (IF SINGLE SUIT SELECTED & AVAILABLE) */}
            {activeSuit.fabricImage?.url && (
              <div className="pt-2 border-t border-gray-200 flex items-center gap-3 bg-gray-50 p-2.5 rounded border">
                <img 
                  src={activeSuit.fabricImage.url} 
                  alt="Suit Fabric" 
                  className="h-16 w-16 object-cover rounded border border-gray-300 shadow-2xs"
                />
                <div className="text-xs">
                  <span className="font-bold text-gray-800 block">{activeSuit.fabricDetails || 'Fabric Photo Attached'}</span>
                  <a href={activeSuit.fabricImage.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 font-bold hover:underline">
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
            Active Suit Status: <span className="font-black text-black">{activeSuit.stitchingStatus || 'Assigned'}</span>
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>

            {activeSuit.stitchingStatus !== 'Stitched' && activeSuit.stitchingStatus !== 'Submitted for Inspection' && (
              <button
                type="button"
                onClick={() => onSubmitForQC(activeSuit.orderId, activeSuit.suitId)}
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

// -------------------------------------------------------------
// COMPONENT: WORKER ORDER DELIVERY MODAL
// -------------------------------------------------------------
const WorkerOrderDeliveryModal = ({ order, worker, closeModal, onDelivered }) => {
  const { mutate: deliverOrder, isPending } = useDeliverOrder();
  
  const balanceDue = Number(order.balanceAmount) || 0;
  const [receivedAmount, setReceivedAmount] = useState(balanceDue.toString());
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const numReceived = Number(receivedAmount) || 0;
  const diff = balanceDue - numReceived;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      receivedAmount: numReceived,
      paymentMethod,
      deliveredBy: {
        userType: 'worker',
        workerId: worker._id || worker.id,
        name: worker.name || 'Worker'
      }
    };

    deliverOrder({
      id: order._id,
      data: payload
    }, {
      onSuccess: () => {
        onDelivered({
          receivedAmount: numReceived,
          paymentMethod,
          diff,
          deliveredByName: worker.name || 'Worker'
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 font-sans">
      <div className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-scale-up">
        
        {/* Modal Header */}
        <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#DFAC43] rounded-sm"></span>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FiCheckCircle className="text-[#DFAC43]" /> Deliver Suit & Receive Payment
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">
                Order #BT-{order.orderNumber} | Customer: <strong className="text-gray-200">{order.customer?.name || 'Customer'}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={closeModal} 
            className="text-gray-400 hover:text-white p-1 text-xl leading-none transition cursor-pointer"
          >
            <FiX />
          </button>
        </div>

        {/* Financial Snapshot */}
        <div className="p-5 space-y-4 bg-gray-50/50">
          <div className="bg-white border border-gray-200 p-4 rounded space-y-2.5 shadow-2xs">
            <div className="flex justify-between text-xs font-bold text-gray-600">
              <span>Total Order Bill:</span>
              <span className="text-black font-black font-sans">Rs {order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-600">
              <span>Advance Paid Earlier:</span>
              <span className="text-green-700 font-black font-sans">Rs {order.advancePaid || 0}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-black pt-2 border-t border-gray-200">
              <span>Remaining Balance Due:</span>
              <span className="text-red-600 font-black font-sans text-base">Rs {balanceDue}</span>
            </div>
          </div>

          {/* Handover Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                Amount Received from Customer (PKR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-gray-500 text-xs">PKR</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-3 py-2.5 border-2 border-gray-200 focus:border-black rounded-lg text-base font-black outline-none font-sans text-gray-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-black rounded-lg p-2.5 text-xs font-bold outline-none bg-white cursor-pointer"
              >
                <option value="Cash">Cash (نقد)</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Bank">Bank Transfer / Card</option>
              </select>
            </div>

            {/* Dynamic Feedback Alert */}
            <div className={`p-3.5 rounded border text-xs font-bold ${
              diff > 0 
                ? 'bg-red-50 border-red-200 text-red-900' 
                : diff < 0 
                ? 'bg-green-50 border-green-200 text-green-900' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              {diff > 0 && (
                <p className="flex items-center gap-1.5">
                  <FiAlertTriangle className="text-red-600 shrink-0 text-sm" />
                  <span>Rs {diff.toLocaleString()} remaining balance will be recorded to customer ledger.</span>
                </p>
              )}
              {diff < 0 && (
                <p className="flex items-center gap-1.5">
                  <FiCheck className="text-green-600 shrink-0 text-sm" />
                  <span>Rs {Math.abs(diff).toLocaleString()} extra payment will be credited to customer advance balance.</span>
                </p>
              )}
              {diff === 0 && (
                <p className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-600 shrink-0 text-sm" />
                  <span>Full payment received! Zero balance (Account fully cleared).</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black rounded transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] text-xs font-black px-5 py-2.5 rounded-lg transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FiCheckCircle /> {isPending ? 'Processing...' : 'Confirm Delivery & Generate Slip'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default WorkerDashboard;
