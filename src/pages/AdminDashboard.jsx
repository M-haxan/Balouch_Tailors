import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetOrders } from '../hooks/useOrder';
import { useGetWorkers, useGetFinancialSummary } from '../hooks/useWorkers';
import { useGetCustomers } from '../hooks/useCustomers';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { 
  FiBox, 
  FiScissors, 
  FiUsers, 
  FiTrendingUp, 
  FiClock, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiCalendar, 
  FiPlus, 
  FiArrowRight, 
  FiPrinter, 
  FiEye,
  FiShoppingBag,
  FiAward,
  FiCreditCard,
  FiPhone,
  FiAlertCircle
} from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import Preloader from '../components/Preloader';
import Pagination from '../components/Pagination';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [deliveryFilter, setDeliveryFilter] = useState('today'); // 'today' | 'in3days' | 'nextWeek' | 'overdue' | 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  
  const { data: orders = [], isLoading: loadingOrders } = useGetOrders();
  const { data: workers = [], isLoading: loadingWorkers } = useGetWorkers();
  const { data: customers = [], isLoading: loadingCustomers } = useGetCustomers();
  const { data: financialData = {}, isLoading: loadingFinancial } = useGetFinancialSummary();
  const { data: shopSettings } = useGetShopSettings();
  const shopName = shopSettings?.shopName || 'Balouch Tailors';

  const isLoading = loadingOrders || loadingWorkers || loadingCustomers || loadingFinancial;

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Preloader />
      </div>
    );
  }

  const {
    totalSuitsCount = 0,
    counts = {}
  } = financialData;

  // Pipeline calculations
  let cuttingPendingCount = 0;
  let stitchingActiveCount = 0;
  let readySuitsCount = 0;

  orders.forEach(ord => {
    ord.suits?.forEach(s => {
      if (s.stitchingStatus === 'Stitched') {
        readySuitsCount++;
      } else if (s.stitchingStatus === 'Assigned') {
        stitchingActiveCount++;
      } else if (s.stitchingStatus === 'Pending') {
        cuttingPendingCount++;
      }
    });
  });

  const activeOrders = orders.filter(o => o.orderStatus !== 'Completed' && o.orderStatus !== 'Cancelled');
  const completedOrdersCount = orders.filter(o => o.orderStatus === 'Completed').length;

  // --- SMART DELIVERY TIMING CALCULATIONS ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDeliveryInfo = (dateString) => {
    if (!dateString) return { key: 'later', label: 'No Date', days: 999 };
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { key: 'overdue', label: `${Math.abs(diffDays)}d Overdue`, days: diffDays };
    }
    if (diffDays === 0) {
      return { key: 'today', label: 'Today', days: diffDays };
    }
    if (diffDays === 1) {
      return { key: 'in3days', label: 'Tomorrow', days: diffDays };
    }
    if (diffDays <= 3) {
      return { key: 'in3days', label: `In ${diffDays} days`, days: diffDays };
    }
    return { key: 'nextWeek', label: `In ${diffDays} days`, days: diffDays };
  };

  const overdueOrders = activeOrders.filter(o => getDeliveryInfo(o.deliveryDate).key === 'overdue')
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));

  const todayOrders = activeOrders.filter(o => getDeliveryInfo(o.deliveryDate).key === 'today')
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));

  const in3DaysOrders = activeOrders.filter(o => getDeliveryInfo(o.deliveryDate).key === 'in3days')
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));

  const nextWeekOrders = activeOrders.filter(o => getDeliveryInfo(o.deliveryDate).key === 'nextWeek')
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));

  // Determine filtered list based on tab
  let displayedOrders = [];
  if (deliveryFilter === 'today') {
    displayedOrders = todayOrders;
  } else if (deliveryFilter === 'in3days') {
    displayedOrders = in3DaysOrders;
  } else if (deliveryFilter === 'nextWeek') {
    displayedOrders = nextWeekOrders;
  } else if (deliveryFilter === 'overdue') {
    displayedOrders = overdueOrders;
  } else {
    // All active sorted by date
    displayedOrders = [...activeOrders].sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
  }

  const paginatedDisplayedOrders = displayedOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDeliveryFilterChange = (filterKey) => {
    setDeliveryFilter(filterKey);
    setCurrentPage(1);
  };

  // WhatsApp quick action
  const handleOpenWhatsApp = (customer) => {
    const rawNum = customer?.whatsapp || customer?.phone;
    if (!rawNum) return;
    const cleanPhone = rawNum.toString().replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone;
    const text = `Assalam-o-Alaikum ${customer.name || ''},\nThis is an update regarding your order from *${shopName}*.`;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      
      {/* 1. EXECUTIVE WELCOME BANNER & QUICK ACTIONS */}
      <section className="bg-[#0F172A] text-white rounded p-6 md:p-8 border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#DFAC43] animate-pulse"></span>
              <span className="text-xs text-gray-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {shopName}
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl font-medium">
              Real-time oversight of tailoring stages, QC approvals, upcoming delivery deadlines, and production workflow.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={() => navigate('/admin/orders/create')}
              className="h-11 bg-[#DFAC43] hover:bg-white text-[#0F172A] font-black px-3 rounded text-xs transition shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <FiPlus className="text-sm shrink-0" /> 
              <span>New Order</span>
            </button>
            <button
              onClick={() => navigate('/admin/allorders')}
              className={`h-11 px-3 rounded text-xs font-black transition border flex items-center justify-center gap-1.5 whitespace-nowrap ${
                counts.pendingInspectionCount > 0 
                  ? 'bg-[#DFAC43] text-[#0F172A] border-[#DFAC43] shadow-lg animate-pulse' 
                  : 'bg-[#1E293B] hover:bg-gray-800 text-white border-gray-700'
              }`}
            >
              <FiClock className="text-xs shrink-0" /> 
              <span>QC Approvals ({counts.pendingInspectionCount || 0})</span>
            </button>
            <button
              onClick={() => navigate('/admin/financial-reports')}
              className="h-11 bg-[#1E293B] hover:bg-gray-800 text-gray-200 hover:text-white font-bold px-3 rounded text-xs transition border border-gray-700 flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <FaMoneyBillWave className="text-xs shrink-0" /> 
              <span>Finance Reports</span>
            </button>
            <button
              onClick={() => navigate('/admin/customers')}
              className="h-11 bg-[#1E293B] hover:bg-gray-800 text-gray-200 hover:text-white font-bold px-3 rounded text-xs transition border border-gray-700 flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <FiUsers className="text-xs shrink-0" /> 
              <span>Customers</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. SUITS WORKFLOW & STAGE BREAKDOWN (6 STAGE CARDS) */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-black uppercase text-gray-800 tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#DFAC43] rounded-sm"></span>
            Suits Workflow & Stage Breakdown
          </h2>
          <span className="text-xs text-gray-500 font-bold">Total {totalSuitsCount} Suits Booked ({activeOrders.length} Active Orders)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Stage 1: Booked Total */}
          <div className="bg-white p-4 rounded border border-gray-200 text-center space-y-1 hover:border-gray-300 transition shadow-xs">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Total Booked</span>
            <p className="text-2xl font-black text-[#0F172A]">{totalSuitsCount}</p>
            <span className="text-[10px] text-gray-500 font-semibold">{orders.length} Orders</span>
          </div>

          {/* Stage 2: Cutting */}
          <div className="bg-white p-4 rounded border border-gray-200 text-center space-y-1 bg-slate-50/50 hover:border-gray-300 transition shadow-xs">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider block">In Cutting</span>
            <p className="text-2xl font-black text-gray-900">{cuttingPendingCount}</p>
            <span className="text-[10px] text-gray-500 font-semibold">Pending Cut</span>
          </div>

          {/* Stage 3: In Stitching */}
          <div className="bg-white p-4 rounded border border-gray-200 text-center space-y-1 bg-slate-50/50 hover:border-gray-300 transition shadow-xs">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider block">In Stitching</span>
            <p className="text-2xl font-black text-gray-900">{stitchingActiveCount}</p>
            <span className="text-[10px] text-gray-500 font-semibold">With Karigars</span>
          </div>

          {/* Stage 4: In QC Inspection */}
          <div className={`p-4 rounded border text-center space-y-1 transition shadow-xs ${
            counts.pendingInspectionCount > 0 
              ? 'bg-amber-50 border-[#DFAC43] text-amber-950 shadow-sm' 
              : 'bg-white border-gray-200 text-gray-700'
          }`}>
            <span className="text-[10px] font-black uppercase tracking-wider block text-gray-600">Waiting QC Pass</span>
            <p className={`text-2xl font-black ${counts.pendingInspectionCount > 0 ? 'text-[#DFAC43]' : 'text-gray-900'}`}>
              {counts.pendingInspectionCount || 0}
            </p>
            <span className="text-[10px] font-bold text-gray-500">Admin Approval</span>
          </div>

          {/* Stage 5: Rework / Alteration */}
          <div className={`p-4 rounded border text-center space-y-1 transition shadow-xs ${
            counts.reworkCount > 0 
              ? 'bg-red-50 border-red-300 text-red-900' 
              : 'bg-white border-gray-200 text-gray-600'
          }`}>
            <span className="text-[10px] font-black uppercase tracking-wider block text-gray-500">In Rework</span>
            <p className={`text-2xl font-black ${counts.reworkCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>
              {counts.reworkCount || 0}
            </p>
            <span className="text-[10px] font-bold text-gray-400">Alterations</span>
          </div>

          {/* Stage 6: Stitched & Ready */}
          <div className="bg-white p-4 rounded border border-[#DFAC43]/40 text-center space-y-1 bg-amber-50/20 hover:border-[#DFAC43] transition shadow-xs">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Completed</span>
            <p className="text-2xl font-black text-[#DFAC43]">{readySuitsCount}</p>
            <span className="text-[10px] text-gray-500 font-semibold">Ready for Delivery</span>
          </div>

        </div>
      </section>

      {/* 3. SMART DELIVERY SCHEDULE & TIMELINES */}
      <section className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden p-6 space-y-5">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#DFAC43] rounded-sm"></span>
              Order Deliveries Schedule
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Live delivery deadlines segmented by Today, Upcoming in 3 days, and Next week.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/allorders')}
            className="text-xs font-black text-[#DFAC43] hover:underline flex items-center gap-1 shrink-0"
          >
            Manage All Orders <FiArrowRight />
          </button>
        </div>

        {/* Segmented Delivery Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded border border-gray-200">
          
          {/* Tab 1: Today's Deliveries */}
          <button
            onClick={() => handleDeliveryFilterChange('today')}
            className={`px-3.5 py-2 rounded text-xs font-black transition flex items-center gap-1.5 ${
              deliveryFilter === 'today'
                ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm'
                : todayOrders.length > 0
                ? 'bg-amber-100 text-amber-950 hover:bg-amber-200'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Today's Deliveries</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              todayOrders.length > 0 ? 'bg-[#DFAC43] text-[#0F172A]' : 'bg-gray-200 text-gray-700'
            }`}>
              {todayOrders.length}
            </span>
          </button>

          {/* Tab 2: Upcoming in 3 Days */}
          <button
            onClick={() => handleDeliveryFilterChange('in3days')}
            className={`px-3.5 py-2 rounded text-xs font-black transition flex items-center gap-1.5 ${
              deliveryFilter === 'in3days'
                ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Upcoming in 3 Days</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-gray-200 text-gray-800 rounded-full font-bold">
              {in3DaysOrders.length}
            </span>
          </button>

          {/* Tab 3: Next Week Deliveries */}
          <button
            onClick={() => handleDeliveryFilterChange('nextWeek')}
            className={`px-3.5 py-2 rounded text-xs font-black transition flex items-center gap-1.5 ${
              deliveryFilter === 'nextWeek'
                ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Next Week Deliveries</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-gray-200 text-gray-800 rounded-full font-bold">
              {nextWeekOrders.length}
            </span>
          </button>

          {/* Tab 4: Overdue (Only if any overdue order exists) */}
          {overdueOrders.length > 0 && (
            <button
              onClick={() => handleDeliveryFilterChange('overdue')}
              className={`px-3.5 py-2 rounded text-xs font-black transition flex items-center gap-1.5 ${
                deliveryFilter === 'overdue'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <FiAlertCircle />
              <span>Overdue</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-red-200 text-red-900 rounded-full font-black">
                {overdueOrders.length}
              </span>
            </button>
          )}

          {/* Tab 5: All Active Orders */}
          <button
            onClick={() => handleDeliveryFilterChange('all')}
            className={`px-3.5 py-2 rounded text-xs font-black transition flex items-center gap-1.5 ${
              deliveryFilter === 'all'
                ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>All Active</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-gray-200 text-gray-800 rounded-full font-bold">
              {activeOrders.length}
            </span>
          </button>

        </div>

        {/* Deliveries Table */}
        {displayedOrders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded p-6">
            <FiCheckCircle className="text-3xl text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 text-xs font-bold">
              {deliveryFilter === 'today' ? 'No deliveries scheduled for today.' :
               deliveryFilter === 'in3days' ? 'No deliveries scheduled in next 3 days.' :
               deliveryFilter === 'nextWeek' ? 'No deliveries scheduled for next week.' :
               deliveryFilter === 'overdue' ? 'Awesome! No overdue orders.' :
               'No active orders found.'}
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 text-gray-600 font-black uppercase text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="p-3 w-28">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Delivery Due Date</th>
                    <th className="p-3 text-center">Suits</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Balance Due</th>
                    <th className="p-3 text-center w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {paginatedDisplayedOrders.map((ord) => {
                    const dInfo = getDeliveryInfo(ord.deliveryDate);
                    const isOverdue = dInfo.key === 'overdue';
                    const isToday = dInfo.key === 'today';
                    const isIn3Days = dInfo.key === 'in3days';

                    return (
                      <tr key={ord._id} className="hover:bg-gray-50/80 transition font-medium">
                        
                        {/* Order ID */}
                        <td className="p-3 font-black text-[#0F172A]">
                          #BT-{ord.orderNumber}
                        </td>

                        {/* Customer */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <span className="font-bold text-gray-900 block">
                                {ord.customer?.name || 'Customer'}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {ord.customer?.phone || '-'}
                              </span>
                            </div>
                            {ord.customer?.phone && (
                              <button
                                onClick={() => handleOpenWhatsApp(ord.customer)}
                                title="Chat on WhatsApp"
                                className="p-1 text-green-600 hover:text-green-700 bg-green-50 rounded transition"
                              >
                                <FiPhone className="text-xs" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Delivery Due Badge */}
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-800">
                              {ord.deliveryDate ? new Date(ord.deliveryDate).toLocaleDateString() : 'N/A'}
                            </span>
                            
                            {/* Colorful relative badge */}
                            <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                              isOverdue 
                                ? 'bg-red-100 text-red-800 border border-red-200' 
                                : isToday 
                                ? 'bg-[#DFAC43] text-[#0F172A] font-black shadow-xs' 
                                : isIn3Days 
                                ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {dInfo.label}
                            </span>
                          </div>
                        </td>

                        {/* Suits Count */}
                        <td className="p-3 text-center font-bold text-gray-800">
                          {ord.suits?.length || 0}
                        </td>

                        {/* Status */}
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            ord.orderStatus === 'In Progress' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                            ord.orderStatus === 'Pending' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                            ord.orderStatus === 'Ready' ? 'bg-green-50 text-green-800 border border-green-200' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {ord.orderStatus}
                          </span>
                        </td>

                        {/* Balance Due */}
                        <td className="p-3 text-right font-black font-sans text-gray-900">
                          {ord.balanceAmount > 0 ? (
                            <span className="text-red-700 font-bold">Rs {ord.balanceAmount.toLocaleString()}</span>
                          ) : (
                            <span className="text-green-700 font-bold">Paid</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => navigate('/admin/allorders')}
                            className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black px-3 py-1.5 rounded text-[10px] uppercase transition shadow-sm"
                          >
                            View & QC
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalItems={displayedOrders.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

      </section>

    </div>
  );
};

export default AdminDashboard;
