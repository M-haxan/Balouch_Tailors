import React, { useState, useMemo, useEffect } from 'react';
import { useGetWorkerDashboard, useSubmitSuitForInspection, useGetWorkerLedger, useGetWorkerPayments } from '../hooks/useWorkers';
import { useGetOrders, useGetOrderById, useDeliverOrder } from '../hooks/useOrder';
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
// HELPER: MAP MEASUREMENT KEYS TO URDU LABELS FOR JOB PARCHI
// -------------------------------------------------------------
const MEASUREMENT_URDU_MAP = {
  length: 'لمبائی',
  lambai: 'لمبائی',
  kameezLength: 'قمیض لمبائی',
  kameez_length: 'قمیض لمبائی',
  sleeves: 'بازو',
  bazu: 'بازو',
  collar: 'گلہ / بین',
  neck: 'گلہ',
  gala: 'گلہ',
  chest: 'چھاتی',
  chati: 'چھاتی',
  ghera: 'گھیرا',
  daman: 'دامن / گھیرا',
  shoulder: 'تیرا',
  tera: 'تیرا',
  teera: 'تیرا',
  shalwar: 'شلوار',
  shalwarLength: 'شلوار لمبائی',
  trouser: 'شلوار',
  paincha: 'پانچہ',
  paicha: 'پانچہ',
  bottom: 'پانچہ',
  waist: 'کمر',
  kamar: 'کمر',
  hip: 'کولہے',
  thigh: 'تھائی / ران',
  frontPatti: 'سامنے پٹی',
  cuff: 'کف',
  armhole: 'موڈھا',
  modha: 'موڈھا'
};

const formatMeasurementsForParchi = (measurements) => {
  if (!measurements || measurements.length === 0) return [];
  
  const merged = {};
  measurements.forEach(m => {
    const dataObj = m.data instanceof Map ? Object.fromEntries(m.data) : (m.data || {});
    Object.entries(dataObj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        merged[k] = v;
      }
    });
  });

  const standardKeys = [
    { keys: ['length', 'lambai', 'kameezLength', 'kameez_length', 'لمبائی'], label: 'لمبائی' },
    { keys: ['sleeves', 'bazu', 'بازو'], label: 'بازو' },
    { keys: ['collar', 'neck', 'gala', 'گلہ', 'بین', 'گلہ / بین'], label: 'گلہ' },
    { keys: ['chest', 'chati', 'چھاتی'], label: 'چھاتی' },
    { keys: ['ghera', 'daman', 'گھیرا', 'دامن'], label: 'گھیرا' },
    { keys: ['shoulder', 'tera', 'teera', 'تیرا'], label: 'تیرا' },
    { keys: ['shalwar', 'shalwarLength', 'trouser', 'شلوار', 'شلوار لمبائی'], label: 'شلوار' },
    { keys: ['paincha', 'paicha', 'bottom', 'پانچہ'], label: 'پانچہ' },
  ];

  const rows = [];
  const handledKeys = new Set();

  standardKeys.forEach(std => {
    for (const k of std.keys) {
      if (merged[k] !== undefined) {
        rows.push({ label: std.label, val: merged[k] });
        handledKeys.add(k);
        break;
      }
    }
  });

  Object.entries(merged).forEach(([k, v]) => {
    if (!handledKeys.has(k)) {
      const urduLabel = MEASUREMENT_URDU_MAP[k] || k;
      rows.push({ label: urduLabel, val: v });
    }
  });

  return rows;
};

// -------------------------------------------------------------
// COMPONENT: SUIT CUTTING & STITCHING JOB PARCHI PRINT MODAL (WORKER)
// -------------------------------------------------------------
const SuitJobCardPrintModal = ({ order, suit, suitIndex = 0, worker, closeModal }) => {
  const [paperSize, setPaperSize] = useState('80mm'); // '56mm' | '80mm' | 'a4'
  const { data: shopSettings } = useGetShopSettings();

  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';
  const tagline = shopSettings?.tagline || 'Gents Shalwar Qameez Specialist';
  const proprietor = shopSettings?.proprietor || 'Zubair Balouch';
  const primaryPhone = shopSettings?.primaryPhone || '0313-4389192';
  const secondaryPhone = shopSettings?.secondaryPhone || '0306-7379919';
  const address = shopSettings?.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan';

  const suitIdBadge = suit?.suitNumber || (order?.orderNumber ? `BT-${order.orderNumber}-${suitIndex + 1}` : 'BT-SUIT');
  const wearer = suit?.wearer || {};
  const measurements = (suit?.measurements && suit?.measurements.length > 0)
    ? suit?.measurements
    : (wearer.measurements || order?.customer?.measurements || []);
  const prefs = suit?.stitchingPreferences || wearer.stitchingPreferences || order?.customer?.stitchingPreferences || {};

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
    ...(Array.isArray(suit?.staticTags) ? suit.staticTags : [])
  ];

  const prefValues = Array.from(new Set([...prefValuesFromObj, ...rawTags])).filter(Boolean);

  const handlePrint = () => {
    try {
      const originalTitle = document.title;
      document.title = `JobParchi_${suitIdBadge}`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    } catch (err) {
      console.error('Print error:', err);
      window.print();
    }
  };

  const containerWidthClass = 
    paperSize === '56mm' ? 'w-[56mm] max-w-[56mm] text-[10px] p-2.5' :
    paperSize === '80mm' ? 'w-[80mm] max-w-[80mm] text-xs p-4' :
    'w-full max-w-xl text-xs p-6';

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 font-sans overflow-y-auto">
      <style>{`
        @media print {
          @page {
            size: ${paperSize === '56mm' ? '56mm auto' : paperSize === '80mm' ? '80mm auto' : 'A4 portrait'};
            margin: ${paperSize === '56mm' ? '0mm' : paperSize === '80mm' ? '0mm' : '8mm'};
          }
          *, *:before, *:after {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, aside, footer, .no-print, .Toastify {
            display: none !important;
          }
          body * {
            visibility: hidden !important;
          }
          #suit-job-printable-slip, #suit-job-printable-slip * {
            visibility: visible !important;
          }
          #suit-job-printable-slip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            width: ${paperSize === '56mm' ? '54mm' : paperSize === '80mm' ? '76mm' : '100%'} !important;
            max-width: ${paperSize === '56mm' ? '54mm' : paperSize === '80mm' ? '76mm' : '100%'} !important;
            padding: ${paperSize === '56mm' ? '1.5mm' : paperSize === '80mm' ? '2.5mm' : '0mm'} !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      <div className="bg-white rounded shadow-2xl max-w-2xl w-full border overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Top Controls Bar */}
        <div className="bg-[#0F172A] text-white p-4 flex flex-wrap justify-between items-center gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 bg-[#DFAC43] rounded"></span>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <FiPrinter className="text-[#DFAC43]" /> Print Suit Cutting & Job Parchi
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-800 p-1 rounded text-xs font-bold">
              {['56mm', '80mm', 'a4'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPaperSize(size)}
                  className={`px-2.5 py-1 rounded transition uppercase cursor-pointer ${
                    paperSize === size ? 'bg-[#DFAC43] text-[#0F172A] font-black' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="text-gray-400 hover:text-white p-1 text-lg transition cursor-pointer"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-100 flex justify-center items-start">
          <div 
            id="suit-job-printable-slip"
            className={`bg-white shadow-md text-black leading-tight ${containerWidthClass}`}
          >
            {/* Shop Header */}
            <div className="text-center pb-2 border-b-2 border-black space-y-1">
              <div className="flex justify-center mb-0.5">
                <img 
                  src={currentLogo} 
                  alt={shopName} 
                  className={paperSize === '56mm' ? 'h-9 w-auto object-contain' : paperSize === '80mm' ? 'h-11 w-auto object-contain' : 'h-14 w-auto object-contain'} 
                />
              </div>

              <h1 className={`font-black uppercase tracking-wider text-black leading-tight ${
                paperSize === '56mm' ? 'text-xs' : paperSize === '80mm' ? 'text-base sm:text-lg' : 'text-2xl sm:text-3xl'
              }`}>
                {shopName}
              </h1>
              
              <p className={`font-bold tracking-widest text-gray-500 uppercase -mt-0.5 ${
                paperSize === '56mm' ? 'text-[7px]' : paperSize === '80mm' ? 'text-[8px]' : 'text-xs'
              }`}>
                {tagline}
              </p>
              
              <div className="pt-1 pb-0.5">
                <span className="inline-block bg-[#0F172A] text-white text-[9px] sm:text-[10px] font-black px-3 py-0.5 uppercase tracking-widest rounded-xs">
                  SUIT CUTTING & STITCHING JOB PARCHI
                </span>
              </div>
            </div>

            {/* Order & Suit Metadata */}
            <div className="py-2 border-b border-dashed space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>Suit ID:</span>
                <span className="font-black font-sans text-sm bg-gray-100 px-1 py-0.2 rounded border border-gray-300">
                  #{suitIdBadge}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-bold">#BT-{order?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Due:</span>
                <span className="font-black text-red-600 font-sans">
                  {order?.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-black">{order?.customer?.name || 'Walk-in'} ({formatPhone(order?.customer?.phone)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wearer:</span>
                <span className="font-black">{wearer.name || order?.customer?.name || 'Customer'} {wearer.relation ? `(${wearer.relation})` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fabric & Vol:</span>
                <span className="font-bold">{suit?.fabricDetails || 'Standard'} {suit?.volumeNo ? `[Vol: ${suit?.volumeNo}]` : ''}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-600">Karigar Wage:</span>
                <span className="font-black font-sans text-emerald-700">Rs {worker?.perSuitWage || suit?.price || 0}</span>
              </div>
            </div>

            {/* Style & Design Preferences */}
            {prefValues.length > 0 && (
              <div className="py-2 border-b border-dashed border-gray-400 space-y-1.5 text-[10px]">
                <div className="font-black uppercase border-b border-gray-200 pb-0.5 flex items-center gap-1">
                  <span>Style & Design Specifications</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {prefValues.map((val, pIdx) => (
                    <div key={pIdx} className="font-bold text-gray-900 flex items-center gap-1">
                      <span className="text-black font-black">✓</span>
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {suit?.customizations && suit?.customizations.length > 0 && (
              <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[10px]">
                <div className="flex items-center flex-wrap gap-1">
                  <span className="text-gray-700 font-black text-[9px] uppercase">Add-on Customizations:</span>
                  {suit.customizations.map((c, cIdx) => (
                    <span key={cIdx} className="bg-gray-100 border border-gray-300 px-1.5 py-0.2 rounded text-[9px] font-black">
                      + {c.name} {c.urduName ? `(${c.urduName})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {suit?.customDesign && (
              <div className="py-2 border-b border-dashed border-gray-400 space-y-1 bg-gray-50/60 p-1.5 rounded">
                <span className="font-black text-[10px] uppercase text-black block">
                  Special Tailor Instructions:
                </span>
                <p className="font-black text-xs text-gray-900 font-sans leading-relaxed text-right" dir="rtl">
                  {suit?.customDesign}
                </p>
              </div>
            )}

            {/* Measurements Table */}
            <div className="py-2 border-b-2 border-black space-y-1.5">
              <div className="font-black text-[10px] uppercase border-b border-black pb-0.5 flex justify-between">
                <span>Body Measurements</span>
                <span>Qty: 1 Suit</span>
              </div>

              {(!measurements || measurements.length === 0) ? (
                <p className="text-[10px] text-gray-400 italic py-1 text-center">No measurements recorded.</p>
              ) : (
                measurements.map((meas, mIdx) => {
                  const dataObj = meas.data instanceof Map ? Object.fromEntries(meas.data) : (meas.data || {});
                  const entries = Object.entries(dataObj);
                  return (
                    <div key={mIdx} className="space-y-1">
                      {meas.category && (
                        <span className="font-black text-[9px] bg-black text-white px-1.5 py-0.2 rounded uppercase inline-block">
                          {meas.category}
                        </span>
                      )}
                      <table className="w-full text-left border-collapse border border-gray-400 text-[10px]">
                        <tbody>
                          {Array.from({ length: Math.ceil(entries.length / 2) }).map((_, rIdx) => {
                            const item1 = entries[rIdx * 2];
                            const item2 = entries[rIdx * 2 + 1];
                            return (
                              <tr key={rIdx} className="border-b border-gray-300">
                                <td className="p-1 font-bold text-gray-600 border-r border-gray-300 w-1/4 uppercase bg-gray-50/50">
                                  {item1 ? item1[0] : ''}
                                </td>
                                <td className="p-1 font-black text-black border-r border-gray-400 w-1/4 font-sans text-xs">
                                  {item1 ? item1[1] : ''}
                                </td>
                                <td className="p-1 font-bold text-gray-600 border-r border-gray-300 w-1/4 uppercase bg-gray-50/50">
                                  {item2 ? item2[0] : ''}
                                </td>
                                <td className="p-1 font-black text-black w-1/4 font-sans text-xs">
                                  {item2 ? item2[1] : ''}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })
              )}
            </div>

            <div className="text-center py-2 space-y-1.5"></div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 no-print">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] rounded font-black text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
          >
            <FiPrinter /> Print Suit Parchi
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT: SUIT SPECIFICATIONS & AUTHENTIC JOB PARCHI MODAL
// -------------------------------------------------------------
const SuitSpecsModal = ({ suit: initialSuit, allSuits = [], worker, closeModal, onSubmitForQC, isSubmitting }) => {
  const [selectedSuitIndex, setSelectedSuitIndex] = useState(0);
  const [printJobSuit, setPrintJobSuit] = useState(null);

  // Fetch full order data if available for complete customer details & all order suits
  const orderId = initialSuit?.orderId;
  const { data: orderData, isLoading: isLoadingOrder } = useGetOrderById(orderId);

  // Deduplicate and resolve all suits in this order
  const orderSuits = useMemo(() => {
    if (orderData?.suits && orderData.suits.length > 0) {
      return orderData.suits;
    }
    if (!initialSuit || !allSuits || allSuits.length === 0) return [initialSuit];
    const list = allSuits.filter(s => 
      (s.orderId && s.orderId === initialSuit.orderId) || 
      (s.orderNumber && s.orderNumber === initialSuit.orderNumber)
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
    return deduped.length > 0 ? deduped : [initialSuit];
  }, [orderData, initialSuit, allSuits]);

  // Sync selected index to matching initialSuit when opened
  useEffect(() => {
    if (orderSuits.length > 0 && initialSuit) {
      const foundIdx = orderSuits.findIndex(s => 
        (s._id && s._id === initialSuit.suitId) ||
        (s.suitId && s.suitId === initialSuit.suitId) ||
        (s.suitNumber && s.suitNumber === initialSuit.suitNumber)
      );
      if (foundIdx !== -1) {
        setSelectedSuitIndex(foundIdx);
      }
    }
  }, [orderSuits, initialSuit]);

  const activeSuit = orderSuits[selectedSuitIndex] || orderSuits[0] || initialSuit;
  if (!activeSuit) return null;

  // Resolved metadata
  const orderNumber = orderData?.orderNumber || activeSuit.orderNumber || initialSuit.orderNumber;
  const customerName = orderData?.customer?.name || activeSuit.customerName || initialSuit.customerName || 'Walk-in Customer';
  const customerPhone = orderData?.customer?.phone || activeSuit.customerPhone || initialSuit.customerPhone;
  const customerAddress = orderData?.customer?.address || '';
  const bookingDate = orderData?.bookingDate || activeSuit.createdAt || initialSuit.createdAt;
  const deliveryDate = orderData?.deliveryDate || activeSuit.deliveryDate || initialSuit.deliveryDate;
  
  const wearer = activeSuit.wearer || initialSuit.wearer || {};
  const wearerName = activeSuit.wearerName || wearer.name || customerName;
  const suitIdBadge = activeSuit.suitNumber || (orderNumber ? `BT-${orderNumber}-${selectedSuitIndex + 1}` : 'BT-SUIT');

  const measurements = (activeSuit.measurements && activeSuit.measurements.length > 0)
    ? activeSuit.measurements
    : (wearer.measurements || orderData?.customer?.measurements || []);
  const measurementRows = formatMeasurementsForParchi(measurements);

  const prefs = activeSuit.stitchingPreferences || wearer.stitchingPreferences || orderData?.customer?.stitchingPreferences || {};

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

  const prefValues = Array.from(new Set([...prefValuesFromObj, ...rawTags])).filter(Boolean);

  const suitStatus = activeSuit.stitchingStatus || initialSuit.stitchingStatus || 'Assigned';
  const isUnderInspection = suitStatus === 'Submitted for Inspection';
  const isRework = suitStatus === 'Rework Required' || suitStatus === 'Rework';
  const isStitched = suitStatus === 'Stitched';
  const reworkNotes = activeSuit.reworkNotes || initialSuit.reworkNotes || '';
  const workerWage = worker?.perSuitWage || activeSuit.price || 0;

  const suitOrderId = orderId || activeSuit.orderId || initialSuit.orderId;
  const suitId = activeSuit._id || activeSuit.suitId || initialSuit.suitId;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-3 font-sans">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl relative flex flex-col max-h-[92vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center py-2.5 px-4 sm:px-5 border-b border-gray-100 bg-[#0F172A] text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 bg-[#DFAC43] rounded-sm"></span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-white">
                    Order Details & Specifications
                  </h2>
                  <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2 py-0.5 rounded shadow-2xs">
                    #BT-{orderNumber}
                  </span>
                  {orderSuits.length > 1 && (
                    <span className="bg-blue-900/80 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-700">
                      {orderSuits.length} Suits
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  Job Sheet, Full Naap Measurements, Specs & Direct Actions
                </p>
              </div>
            </div>
            <button 
              onClick={closeModal} 
              className="p-1 text-gray-400 hover:text-white transition rounded hover:bg-gray-800 cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-3 sm:p-4 space-y-3 flex-1 bg-gray-100/70">
            
            {/* 1. TOP 4 SUMMARY CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              
              {/* Customer Details Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiUser className="text-[#DFAC43]" /> Customer Information
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{customerName}</p>
                <p className="text-[11px] text-gray-600 font-semibold flex items-center gap-1 font-mono">
                  <FiPhone className="text-gray-400 text-[9px]" /> {formatPhone(customerPhone)}
                </p>
                {customerAddress && (
                  <p className="text-[10px] text-gray-400 truncate">{customerAddress}</p>
                )}
              </div>

              {/* Dates Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiCalendar className="text-[#DFAC43]" /> Timeline & Schedule
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Booked:</span>
                  <span className="text-gray-900">{bookingDate ? new Date(bookingDate).toLocaleDateString() : '-'}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Delivery Due:</span>
                  <span className="text-red-600 font-black">{deliveryDate ? new Date(deliveryDate).toLocaleDateString() : '-'}</span>
                </div>
              </div>

              {/* Karigar Wage & Status Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiCreditCard className="text-[#DFAC43]" /> Karigar Wage & Status
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Your Wage:</span>
                  <span className="text-emerald-700 font-black font-sans text-xs">Rs {workerWage}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">QC Status:</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase ${
                    isStitched ? 'bg-green-100 text-green-800' :
                    isUnderInspection ? 'bg-amber-100 text-amber-800' :
                    isRework ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {suitStatus}
                  </span>
                </div>
              </div>

              {/* Garment & Wearer Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiScissors className="text-[#DFAC43]" /> Garment & Wearer
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Wearer:</span>
                  <span className="text-gray-900 font-bold truncate max-w-[110px]">{wearerName}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Service:</span>
                  <span className="text-gray-900 font-bold truncate max-w-[110px]">{activeSuit.serviceType || 'Shalwar Qameez'}</span>
                </div>
              </div>

            </div>

            {/* SUIT SELECTION TABS (If multiple suits in order) */}
            {orderSuits.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase shrink-0">Suits:</span>
                {orderSuits.map((s, sIdx) => {
                  const sBadge = s.suitNumber || `BT-${orderNumber}-${sIdx + 1}`;
                  return (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setSelectedSuitIndex(sIdx)}
                      className={`py-1 px-2.5 rounded-lg text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        selectedSuitIndex === sIdx
                          ? 'bg-[#0F172A] text-[#DFAC43] shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <span>Suit #{sIdx + 1} ({sBadge})</span>
                      {s.fabricDetails && <span className="text-[10px] opacity-75">[{s.fabricDetails}]</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. MAIN SPLIT SECTION: LEFT SIDE (PARCHI DETAIL) & RIGHT SIDE (IMAGE & QC ACTIONS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
              
              {/* LEFT SIDE (lg:col-span-7): AUTHENTIC JOB PARCHI / NAAP DETAIL CARD */}
              <div className="lg:col-span-7 bg-white rounded-xl border-2 border-black overflow-hidden shadow-xs">
                
                {/* Parchi Top Header Bar */}
                <div className="bg-[#0F172A] text-white px-3.5 py-2 flex flex-wrap justify-between items-center gap-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2 py-0.5 rounded shadow-2xs">
                      {suitIdBadge}
                    </span>
                    <span className="font-bold text-xs text-gray-200">
                      {activeSuit.serviceType || 'Shalwar Qameez'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-[#DFAC43]">
                      Wage: Rs {workerWage}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPrintJobSuit({ 
                        order: orderData || {
                          orderNumber,
                          deliveryDate,
                          customer: { name: customerName, phone: customerPhone, address: customerAddress },
                          bookingDate
                        },
                        suit: activeSuit,
                        suitIndex: selectedSuitIndex 
                      })}
                      className="bg-[#DFAC43] hover:bg-yellow-400 text-[#0F172A] font-black px-2.5 py-0.5 rounded text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                      title="Print Suit Job Parchi"
                    >
                      <FiPrinter className="text-xs" /> Print Parchi
                    </button>
                  </div>
                </div>

                {/* Split Parchi: Left (اضافی تفصیل) + Right (ناپ ٹیبل) */}
                <div className="grid grid-cols-1 sm:grid-cols-12">
                  
                  {/* Left Column: اضافی تفصیل + Fabric + Tags + Custom Notes */}
                  <div className="sm:col-span-7 p-3 sm:p-4 flex flex-col justify-between space-y-3 border-b sm:border-b-0 sm:border-r-2 border-black bg-white">
                    
                    <div className="space-y-2.5">
                      {/* Heading */}
                      <div className="text-center">
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-wide font-serif">
                          اضافی تفصیل
                        </h3>
                        <div className="w-20 h-0.5 bg-gray-300 mx-auto mt-0.5"></div>
                      </div>

                      {/* Fabric Details & Volume Badge */}
                      <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-1">
                        <span className="font-black text-sm sm:text-base text-gray-900 font-serif underline decoration-2">
                          {activeSuit.fabricDetails || 'کپڑا درج نہیں'}
                        </span>
                        {activeSuit.volumeNo && (
                          <span className="bg-black text-white font-mono font-black text-[11px] px-2 py-0.5 rounded">
                            VOL: {activeSuit.volumeNo}
                          </span>
                        )}
                      </div>

                      {/* Style / Design Preference Tags */}
                      {prefValues.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {prefValues.map((tag, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="border border-black text-black font-black text-[11px] px-2 py-0.5 rounded bg-white shadow-2xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Add-on Customizations (if any) */}
                      {activeSuit.customizations && activeSuit.customizations.length > 0 && (
                        <div className="pt-1.5 border-t border-dashed border-gray-300">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                            Add-on Customizations:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {activeSuit.customizations.map((c, cIdx) => (
                              <span key={cIdx} className="bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px] px-1.5 py-0.5 rounded">
                                + {c.name} {c.price ? `(+Rs ${c.price})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Special Tailor Instructions (خصوصی ہدایات) ONLY if present */}
                    {activeSuit.customDesign && activeSuit.customDesign.trim() !== '' && (
                      <div className="border-t-2 border-dashed border-gray-400 pt-2 mt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block text-right mb-0.5">خصوصی ہدایات:</span>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 text-right leading-relaxed font-sans" dir="rtl">
                          {activeSuit.customDesign}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Right Column: Complete Measurement Table */}
                  <div className="sm:col-span-5 bg-white flex flex-col justify-start">
                    {measurementRows.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 italic text-xs">
                        Is suit ke liye koi naap darj nahi hai.
                      </div>
                    ) : (
                      <table className="w-full text-center border-collapse">
                        <tbody>
                          {measurementRows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-black last:border-b-0">
                              <td className="p-1.5 font-sans font-black text-sm text-gray-900 border-r-2 border-black w-1/2 bg-gray-50/60">
                                {row.val || '-'}
                              </td>
                              <td className="p-1.5 font-bold text-xs text-gray-900 text-right pr-2.5 font-serif w-1/2">
                                {row.label}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                </div>

              </div>

              {/* RIGHT SIDE (lg:col-span-5): FABRIC IMAGE + WORK STATUS + QC SUBMISSION ACTIONS */}
              <div className="lg:col-span-5 space-y-3">
                
                {/* 1. FABRIC / SUIT IMAGE CARD (Compact) */}
                <div className="bg-white rounded-xl border border-gray-200 p-2.5 sm:p-3 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <FiImage className="text-[#DFAC43]" /> Suit & Fabric Photo
                    </span>
                    {activeSuit.fabricImage?.url && (
                      <a 
                        href={activeSuit.fabricImage.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        Open Full Photo
                      </a>
                    )}
                  </div>
                  
                  <div className="w-full h-36 sm:h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center relative group">
                    {activeSuit.fabricImage?.url ? (
                      <img 
                        src={activeSuit.fabricImage.url} 
                        alt="Suit Fabric" 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="text-center p-3 text-gray-400 space-y-1">
                        <FiImage className="text-3xl mx-auto text-gray-300" />
                        <p className="text-[11px] font-bold text-gray-600">No Fabric Photo Attached</p>
                        <p className="text-[10px] text-gray-400">{activeSuit.fabricDetails || 'Standard Fabric'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. QC INSPECTION ACTIONS & WORK STATUS CARD */}
                <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <FiScissors className="text-[#DFAC43]" /> Work & QC Status
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      isStitched ? 'bg-green-100 text-green-800 border border-green-300' :
                      isUnderInspection ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      isRework ? 'bg-red-100 text-red-800 border border-red-300' :
                      'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {suitStatus}
                    </span>
                  </div>

                  {/* REWORK REQUIRED STATE */}
                  {isRework && (
                    <div className="bg-red-50 border-2 border-red-500 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2 text-red-900 font-black text-xs">
                        <FiAlertTriangle className="text-red-600 text-base shrink-0 animate-bounce" />
                        <span>Admin Alteration / Rework Instructions:</span>
                      </div>
                      <p className="text-xs font-bold text-red-800 bg-white p-2.5 rounded-lg border border-red-200">
                        {reworkNotes || 'Please correct stitching defects and re-submit for QC inspection.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSubmitForQC(suitOrderId, suitId)}
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-2 px-3 rounded-lg text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <FiCheckCircle /> Re-Submit for QC Inspection
                      </button>
                    </div>
                  )}

                  {/* SUBMITTED FOR INSPECTION STATE */}
                  {isUnderInspection && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                        <FiClock className="text-amber-700 text-base shrink-0 animate-spin" />
                        <span>Submitted for QC Inspection!</span>
                      </div>
                      <p className="text-[11px] text-amber-900 font-medium">
                        Suit is currently with the shop master/admin for quality inspection. Once approved, wage of <strong>Rs {workerWage}</strong> will be added to your approved balance.
                      </p>
                    </div>
                  )}

                  {/* STITCHED / COMPLETED STATE */}
                  {isStitched && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-950 font-black text-xs">
                        <FiCheckCircle className="text-emerald-700 text-base shrink-0" />
                        <span>QC Passed & Stitched!</span>
                      </div>
                      <p className="text-[11px] text-emerald-900 font-medium">
                        Suit has passed quality inspection. Your wage of <strong>Rs {workerWage}</strong> has been approved.
                      </p>
                    </div>
                  )}

                  {/* ASSIGNED / IN-PROGRESS STATE */}
                  {!isRework && !isUnderInspection && !isStitched && (
                    <div className="space-y-2.5">
                      <div className="bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-700">
                        <p className="font-medium text-[11px]">
                          Once you finish cutting and stitching this suit according to the job parchi measurements, submit it for inspection.
                        </p>
                        <p className="font-black text-emerald-700 mt-1">
                          Wage to earn: Rs {workerWage}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSubmitForQC(suitOrderId, suitId)}
                        disabled={isSubmitting}
                        className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <FiCheckCircle /> Submit for QC Inspection
                      </button>
                    </div>
                  )}

                </div>

                {/* 3. MULTI-SUIT LIST IN THIS ORDER (IF MULTIPLE SUITS) */}
                {orderSuits.length > 1 && (
                  <div className="bg-slate-50 border border-gray-200 rounded-xl p-3 shadow-2xs space-y-2">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <FiLayers className="text-[#DFAC43]" /> All Suits in this Order ({orderSuits.length})
                    </span>
                    <div className="space-y-1.5">
                      {orderSuits.map((s, idx) => {
                        const isCur = idx === selectedSuitIndex;
                        const sBadge = s.suitNumber || `BT-${orderNumber}-${idx + 1}`;
                        const isSStitched = s.stitchingStatus === 'Stitched';
                        const isSInspection = s.stitchingStatus === 'Submitted for Inspection';
                        const isSRework = s.stitchingStatus === 'Rework Required' || s.stitchingStatus === 'Rework';
                        
                        return (
                          <div 
                            key={idx}
                            onClick={() => setSelectedSuitIndex(idx)}
                            className={`p-2 rounded-lg border text-xs flex justify-between items-center cursor-pointer transition ${
                              isCur ? 'bg-amber-50 border-[#DFAC43] shadow-2xs' : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="truncate mr-2">
                              <span className="font-mono font-black text-[11px] mr-1.5 text-black">
                                #{sBadge}
                              </span>
                              <span className="text-gray-600 font-medium truncate text-[11px]">
                                {s.fabricDetails || 'Fabric'}
                              </span>
                            </div>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 ${
                              isSStitched ? 'bg-green-600 text-white' :
                              isSInspection ? 'bg-amber-400 text-black' :
                              isSRework ? 'bg-red-600 text-white' :
                              'bg-blue-600 text-white'
                            }`}>
                              {s.stitchingStatus || 'Assigned'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="py-2.5 px-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-gray-500">
              Active Suit: <span className="font-black text-black">{suitIdBadge}</span> ({suitStatus})
            </span>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={closeModal} 
                className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-xs font-bold transition shadow cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SUIT JOB PARCHI PRINT MODAL */}
      {printJobSuit && (
        <SuitJobCardPrintModal
          order={printJobSuit.order}
          suit={printJobSuit.suit}
          suitIndex={printJobSuit.suitIndex}
          worker={worker}
          closeModal={() => setPrintJobSuit(null)}
        />
      )}
    </>
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
