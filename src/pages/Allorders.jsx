import React, { useState } from 'react';
import { useGetOrders, useGetOrderById, useUpdateOrder, useDeleteOrder, useDeliverOrder } from '../hooks/useOrder';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
import defaultLogo from '../assets/BT_Logo.png';
import { formatPhone } from '../utils/formatters';
import { 
  FiSearch, 
  FiPrinter, 
  FiTrash2, 
  FiBox, 
  FiFilter, 
  FiEye, 
  FiX, 
  FiCalendar, 
  FiCreditCard, 
  FiUser, 
  FiScissors, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiClock,
  FiCheck,
  FiSend,
  FiShoppingBag,
  FiTag,
  FiLayers,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiPhone,
  FiUserCheck,
  FiStar,
  FiTruck,
  FiEdit,
  FiImage,
  FiSave
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { 
  useGetWorkers, 
  useAssignWorker, 
  useMarkSuitStitched, 
  useApproveSuit, 
  useRejectSuit, 
  useAssignSuitStage 
} from '../hooks/useWorkers';
import Pagination from '../components/Pagination';

// Order Status Badge Color Logic (Module Scope)
const getStatusColor = (status) => {
  switch(status) {
    case 'Pending':
    case 'Booked':
      return 'bg-amber-50 text-amber-900 border-amber-200';
    case 'In Progress':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'Cutting':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    case 'Stitching':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'Ready':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    case 'Completed':
      return 'bg-amber-50 text-[#DFAC43] border-[#DFAC43]';
    case 'Delivered':
      return 'bg-[#0F172A] text-white border-[#0F172A]';
    case 'Cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const Allorders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters & Server Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [viewingOrder, setViewingOrder] = useState(null);

  const queryViewOrderId = searchParams.get('viewOrderId');
  const activeViewOrderId = viewingOrder?._id || queryViewOrderId;

  // Delivery & Handover modal state
  const [deliveryModalOrder, setDeliveryModalOrder] = useState(null);

  const handleOpenViewOrder = (order) => {
    setViewingOrder(order);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('viewOrderId', order._id);
      return p;
    }, { replace: true });
  };

  const handleCloseViewOrder = () => {
    setViewingOrder(null);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.delete('viewOrderId');
      return p;
    }, { replace: true });
  };

  // Server-side paginated orders fetch
  const { data: ordersResponse, isLoading } = useGetOrders({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchTerm,
    status: statusFilter
  });

  const { mutate: updateOrder } = useUpdateOrder();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

  const orders = Array.isArray(ordersResponse) 
    ? ordersResponse 
    : (ordersResponse?.data || []);

  const pagination = ordersResponse?.pagination || {
    totalRecords: orders.length,
    currentPage: 1,
    totalPages: 1,
    pageSize: PAGE_SIZE
  };

  const counts = ordersResponse?.counts || {};
  const totalPendingQC = ordersResponse?.totalPendingQC || counts.pendingQC || 0;

  // Reset page to 1 when filters change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Order Status Options (Including Delivered)
  const statusOptions = ['Pending', 'In Progress', 'Completed', 'Delivered', 'Cancelled'];

  const filteredOrders = orders;

  // Tabs Definition
  const tabs = [
    { id: 'All', label: t('common.all'), count: counts.all ?? pagination.totalRecords, icon: FiBox },
    { id: 'Active', label: t('dashboard.activeOrders'), count: counts.active, icon: FiScissors },
    { id: 'Delivered', label: t('orders.delivered'), count: counts.delivered, icon: FiTruck },
    { id: 'PendingQC', label: t('orders.qcInspection'), count: totalPendingQC, icon: FiClock, isAlert: totalPendingQC > 0 }
  ];

  // Handlers
  const handleStatusChange = (order, newStatus) => {
    if (newStatus === 'Delivered') {
      setDeliveryModalOrder(order);
    } else {
      updateOrder({ id: order._id, data: { orderStatus: newStatus } });
    }
  };

  const handleDelete = (id) => {
    deleteOrder(id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-3.5 sm:p-6 min-h-[85vh] relative">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-gray-100 pb-5 mb-4 gap-4">
        <div className="w-full xl:w-auto">
          <h2 className="text-xl sm:text-2xl font-black text-black flex items-center gap-2">
            <FiBox className="text-[#D4AF37] shrink-0" /> <span>{t('orders.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{t('orders.subtitle')}</p>
        </div>

        {/* Controls: Status Dropdown & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full xl:w-auto">
          {/* Status Filter Dropdown */}
          <div className="relative w-full sm:w-56 md:w-60 shrink-0">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-100 focus:border-black rounded-lg outline-none font-bold text-xs sm:text-sm bg-white appearance-none cursor-pointer shadow-2xs"
            >
              <option value="All">{t('orders.filterByStatus')}</option>
              <option value="Active">{t('dashboard.activeOrders')}</option>
              <option value="Delivered">{t('orders.delivered')}</option>
              <option value="PendingQC">{t('orders.qcInspection')} ({totalPendingQC})</option>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('orders.searchPlaceholder')} 
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-8 py-2.5 border-2 border-gray-100 focus:border-black rounded-lg outline-none text-xs sm:text-sm font-medium transition shadow-2xs"
            />
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5 rounded-full cursor-pointer"
                title={t('common.clear')}
              >
                <FiX className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QUICK STATUS TABS (RESPONSIVE GRID WITHOUT TEXT TRUNCATION) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pb-4 mb-4 border-b border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleStatusFilterChange(tab.id)}
              className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-black transition flex items-center justify-between sm:justify-center gap-1 sm:gap-1.5 cursor-pointer shadow-2xs ${
                isActive
                  ? 'bg-[#0F172A] text-white shadow-md'
                  : tab.isAlert
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <Icon className={`shrink-0 text-xs sm:text-sm ${isActive ? 'text-[#DFAC43]' : tab.isAlert ? 'text-amber-600' : 'text-gray-500'}`} />
                <span className="truncate">{tab.label}</span>
              </div>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shrink-0 ${
                  isActive 
                    ? 'bg-[#DFAC43] text-[#0F172A]' 
                    : tab.isAlert
                    ? 'bg-amber-400 text-black'
                    : 'bg-white text-gray-700 shadow-2xs'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ORDERS TABLE */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-bold">{t('common.loading')}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 font-medium">{t('orders.noOrdersFound')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. DESKTOP VIEW (TABLE) */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0F172A] text-[#DFAC43] uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <th className="py-3 px-3 rounded-tl min-w-[150px] lg:min-w-[165px]">{t('orders.orderNo')}</th>
                  <th className="py-3 px-3 min-w-[120px] lg:min-w-[135px]">{t('orders.customer')}</th>
                  <th className="py-3 px-3 text-center min-w-[80px] lg:min-w-[95px]">{t('orders.garments')}</th>
                  <th className="py-3 px-3 min-w-[95px] lg:min-w-[110px]">{t('orders.totalBill')}</th>
                  <th className="py-3 px-3 text-center min-w-[95px] lg:min-w-[110px]">{t('orders.status')}</th>
                  <th className="py-3 px-3 rounded-tr text-right min-w-[125px] lg:min-w-[145px]">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredOrders.map((order) => {
                  const hasPendingQC = order.suits?.some(s => s.stitchingStatus === 'Submitted for Inspection');
                  const hasRework = order.suits?.some(s => s.stitchingStatus === 'Rework Required');

                  return (
                    <tr key={order._id} className={`hover:bg-gray-50/80 transition-colors group ${hasPendingQC ? 'bg-amber-50/30' : ''}`}>
                      
                      {/* Order ID & Dates & Handlers */}
                      <td className="py-3 px-3">
                        <span className="font-black text-black text-xs sm:text-sm uppercase">#BT-{order.orderNumber}</span>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5">
                          <span>{new Date(order.bookingDate).toLocaleDateString()}</span>
                          <span className="text-gray-300">•</span>
                          <span className="font-bold text-amber-950">Due: {new Date(order.deliveryDate).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Compact Handler Badges */}
                        <div className="flex flex-wrap items-center gap-1 mt-1 text-[9px] sm:text-[10px]">
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded border border-slate-200" title="Booked by">
                            <FiUser className="text-[8px] text-slate-400" /> {order.createdBy?.name || 'Admin'}
                          </span>
                          {order.orderStatus === 'Delivered' && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-black px-1.5 py-0.5 rounded border border-emerald-200" title="Delivered by">
                              <FiCheck className="text-[8px] text-emerald-600" /> {order.deliveredBy?.name || order.receivedAtDelivery?.receivedBy || 'Admin'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-3">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm whitespace-nowrap">{order.customer?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">{formatPhone(order.customer?.phone)}</p>
                      </td>

                      {/* Suit Count & QC Badges */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <span className="bg-gray-100 text-black font-bold px-2 py-0.5 rounded-md text-[11px] sm:text-xs">
                            {order.suits?.length || 0} Suits
                          </span>
                          {hasPendingQC && (
                            <span className="bg-[#DFAC43] text-[#0F172A] text-[8px] sm:text-[9px] font-black px-1 py-0.5 rounded uppercase inline-flex items-center gap-0.5 animate-pulse whitespace-nowrap">
                              <FiClock /> Needs QC
                            </span>
                          )}
                          {hasRework && (
                            <span className="bg-red-100 text-red-800 text-[8px] sm:text-[9px] font-black px-1 py-0.5 rounded uppercase inline-flex items-center gap-0.5 whitespace-nowrap">
                              <FiAlertTriangle /> Rework
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cash Flow */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="text-xs sm:text-sm font-black text-black font-sans">Rs {Number(order.totalAmount || 0).toLocaleString()}</p>
                        {order.balanceAmount > 0 ? (
                          <p className="text-[10px] sm:text-[11px] font-black text-amber-950 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-block mt-0.5 font-sans">
                            Bal: Rs {Number(order.balanceAmount).toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-[10px] sm:text-[11px] font-bold text-green-700 mt-0.5">Fully Paid</p>
                        )}
                      </td>

                      {/* Live Status Updater Dropdown */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          className={`text-[11px] sm:text-xs font-bold px-2 py-1 sm:py-1.5 rounded-lg border outline-none cursor-pointer text-center ${getStatusColor(order.orderStatus)}`}
                        >
                          {statusOptions.map(opt => <option key={opt} value={opt} className="bg-white text-black">{opt}</option>)}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-1 sm:gap-1.5">
                          {/* Quick Deliver Button */}
                          {order.orderStatus !== 'Delivered' && (
                            <button
                              onClick={() => setDeliveryModalOrder(order)}
                              className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] text-[11px] sm:text-xs font-black px-2 py-1 sm:py-1.5 rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                              title="Deliver Suit & Receive Payment"
                            >
                              <FiCheckCircle className="text-xs" /> <span>Deliver</span>
                            </button>
                          )}

                          <button 
                            onClick={() => handleOpenViewOrder(order)}
                            className={`p-1 sm:p-1.5 rounded-lg transition shadow-2xs cursor-pointer ${
                              hasPendingQC 
                                ? 'bg-[#DFAC43] text-[#0F172A] font-bold hover:bg-white ring-1 ring-[#DFAC43]' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                            title="View Details / QC Inspect / Assign Worker"
                          >
                            <FiEye className="text-xs sm:text-sm" />
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/print/${order._id}`)}
                            className="bg-[#0F172A] hover:bg-gray-800 text-[#DFAC43] p-1 sm:p-1.5 rounded-lg transition shadow-2xs cursor-pointer"
                            title="Print Invoice"
                          >
                            <FiPrinter className="text-xs sm:text-sm" />
                          </button>
                          <button 
                            onClick={() => handleDelete(order._id)}
                            disabled={isDeleting}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1 sm:p-1.5 rounded-lg transition shadow-2xs cursor-pointer"
                            title="Delete Order"
                          >
                            <FiTrash2 className="text-xs sm:text-sm" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2. MOBILE VIEW (TABLE-TO-CARD PATTERN) */}
          <div className="block md:hidden space-y-3">
            {filteredOrders.map((order) => {
              const hasPendingQC = order.suits?.some(s => s.stitchingStatus === 'Submitted for Inspection');
              const hasRework = order.suits?.some(s => s.stitchingStatus === 'Rework Required');
              const total = Number(order.totalAmount || 0);
              const advance = Number(order.advancePaid || 0);
              const balance = Number(order.balanceAmount || 0);

              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-xl border border-gray-200 shadow-2xs p-3.5 space-y-3 transition hover:border-gray-300 ${
                    hasPendingQC ? 'bg-amber-50/30 ring-1 ring-[#DFAC43]/40' : ''
                  }`}
                >
                  {/* Header: Order #, Dates & Status Dropdown */}
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div>
                      <span className="font-black text-base text-[#0F172A] block">
                        #BT-{order.orderNumber}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium mt-0.5">
                        <span>Booked: {new Date(order.bookingDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-bold text-amber-950">Due: {new Date(order.deliveryDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order, e.target.value)}
                        className={`text-[11px] font-black px-2 py-1 rounded-md border outline-none cursor-pointer text-center ${getStatusColor(order.orderStatus)}`}
                      >
                        {statusOptions.map(opt => <option key={opt} value={opt} className="bg-white text-black">{opt}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Customer & Suits Info */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Customer</span>
                      <span className="font-bold text-gray-900 text-sm">{order.customer?.name || 'Customer'}</span>
                      <span className="text-[11px] text-gray-500 font-mono block">{formatPhone(order.customer?.phone)}</span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="inline-block bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-xs">
                        {order.suits?.length || 0} Suits
                      </span>
                      {hasPendingQC && (
                        <span className="block bg-[#DFAC43] text-[#0F172A] text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                          Needs QC Pass
                        </span>
                      )}
                      {hasRework && (
                        <span className="block bg-red-100 text-red-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                          In Rework
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Handlers Row (Booked by & Delivered by) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
                      <FiUser className="text-[9px] text-slate-400" /> Booked: {order.createdBy?.name || 'Admin'}
                    </span>
                    {order.orderStatus === 'Delivered' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        <FiCheck className="text-[9px] text-emerald-600" /> Delivered: {order.deliveredBy?.name || order.receivedAtDelivery?.receivedBy || 'Admin'}
                      </span>
                    )}
                  </div>

                  {/* Financials Grid */}
                  <div className="grid grid-cols-3 gap-1.5 text-center bg-gray-50/90 p-2.5 rounded-lg border border-gray-150 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Total Bill</span>
                      <span className="font-black text-gray-900 text-[11px] font-sans">Rs {total.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Advance</span>
                      <span className="font-bold text-green-700 text-[11px] font-sans">Rs {advance.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Balance</span>
                      {balance > 0 ? (
                        <span className="font-black text-amber-950 bg-amber-100/70 px-1 py-0.5 rounded text-[11px] font-sans block">
                          Rs {balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="font-bold text-green-700 text-[11px] block">Rs 0</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                    {order.orderStatus !== 'Delivered' && (
                      <button
                        onClick={() => setDeliveryModalOrder(order)}
                        className="flex-1 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black rounded-lg text-xs transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FiCheckCircle className="shrink-0" /> <span>Deliver</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenViewOrder(order)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        hasPendingQC 
                          ? 'bg-[#DFAC43] text-[#0F172A] ring-1 ring-[#DFAC43]' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      <FiEye className="shrink-0" /> <span>View Details</span>
                    </button>

                    <button
                      onClick={() => navigate(`/admin/print/${order._id}`)}
                      className="p-2 bg-gray-100 hover:bg-[#0F172A] text-gray-700 hover:text-[#DFAC43] rounded-lg transition border border-gray-200 cursor-pointer shrink-0"
                      title="Print Invoice"
                    >
                      <FiPrinter className="text-xs" />
                    </button>

                    <button
                      onClick={() => handleDelete(order._id)}
                      disabled={isDeleting}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition text-xs border border-red-100 cursor-pointer shrink-0"
                      title="Delete Order"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SERVER-SIDE PAGINATION */}
      {pagination.totalRecords > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            Showing <span className="font-bold text-gray-800">{Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalRecords)}</span> to <span className="font-bold text-gray-800">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)}</span> of <span className="font-bold text-gray-800">{pagination.totalRecords}</span> orders
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* ORDER DETAILS & QC MODAL */}
      {activeViewOrderId && (
        <OrderDetailsModal 
          orderId={activeViewOrderId} 
          closeModal={handleCloseViewOrder} 
          onOpenDelivery={(ord) => setDeliveryModalOrder(ord)}
        />
      )}

      {/* ORDER HANDOVER & DELIVERY MODAL */}
      {deliveryModalOrder && (
        <OrderDeliveryModal
          order={deliveryModalOrder}
          closeModal={() => setDeliveryModalOrder(null)}
        />
      )}
    </div>
  );
};

// Helper: Map measurement keys to Urdu labels
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
// COMPONENT: ORDER DETAILS, SPECS, NAAP & QC INSPECTION MODAL
// -------------------------------------------------------------
const OrderDetailsModal = ({ orderId, closeModal, onOpenDelivery }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isWorker = user?.role === 'worker';

  const { data: orderByIdData, isLoading: isLoadingOrder } = useGetOrderById(orderId);
  const { data: ordersResponse = [] } = useGetOrders();
  const { data: workers = [] } = useGetWorkers();
  const { mutate: assignStage, isPending: isAssigningStage } = useAssignSuitStage();
  const { mutate: approveSuit, isPending: isApproving } = useApproveSuit();
  const { mutate: rejectSuit, isPending: isRejecting } = useRejectSuit();
  const { mutate: updateOrder, isPending: isUpdatingStatus } = useUpdateOrder();

  const [selectedSuitIndex, setSelectedSuitIndex] = useState(0);
  const [reworkModalSuit, setReworkModalSuit] = useState(null);
  const [reworkNotes, setReworkNotes] = useState('');
  
  // Track selected worker draft per suit (suitId -> workerId | 'self')
  const [workerDrafts, setWorkerDrafts] = useState({});
  // State for printing individual suit job card / parchi
  const [printJobSuit, setPrintJobSuit] = useState(null);

  const ordersList = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.data || []);
  const order = orderByIdData || ordersList.find(o => o._id === orderId);

  if (!order) {
    if (isLoadingOrder) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white rounded-xl p-8 text-center space-y-3 max-w-sm w-full shadow-2xl border border-gray-200">
            <div className="w-9 h-9 border-4 border-[#0F172A] border-t-[#DFAC43] rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-800">Loading Order Details...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  const suitsList = order.suits || [];
  const activeSuit = suitsList[selectedSuitIndex] || suitsList[0] || {};
  const suitKey = activeSuit._id || `suit-${selectedSuitIndex}`;
  const suitIdBadge = activeSuit.suitNumber || `BT-${order.orderNumber}-${selectedSuitIndex + 1}`;

  const isUnderInspection = activeSuit.stitchingStatus === 'Submitted for Inspection';
  const isRework = activeSuit.stitchingStatus === 'Rework Required';
  const isStitched = activeSuit.stitchingStatus === 'Stitched';
  
  const wearer = activeSuit.wearer || {};
  const measurements = (activeSuit.measurements && activeSuit.measurements.length > 0)
    ? activeSuit.measurements
    : (wearer.measurements || order.customer?.measurements || []);
  const measurementRows = formatMeasurementsForParchi(measurements);

  const prefs = activeSuit.stitchingPreferences || wearer.stitchingPreferences || order.customer?.stitchingPreferences || {};
  
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

  // Current assigned worker ID or 'self'
  const currentAssignedId = activeSuit.stitching?.isSelf 
    ? 'self' 
    : (activeSuit.assignedWorker?._id || activeSuit.assignedWorker || '');
  
  // Draft selection
  const draftValue = workerDrafts[suitKey] !== undefined ? workerDrafts[suitKey] : currentAssignedId;

  // Active assigned worker object
  const activeWorkerObj = workers.find(w => w._id === currentAssignedId) || (typeof activeSuit.assignedWorker === 'object' ? activeSuit.assignedWorker : null);

  const statusOptions = ['Booked', 'In Progress', 'Cutting', 'Stitching', 'Ready', 'Completed', 'Delivered', 'Cancelled'];

  const handleWorkerDraftChange = (sId, value) => {
    setWorkerDrafts(prev => ({
      ...prev,
      [sId]: value
    }));
  };

  const handleAssignWorker = (suitId) => {
    const selected = workerDrafts[suitKey] !== undefined ? workerDrafts[suitKey] : currentAssignedId;
    if (selected === undefined || selected === '') {
      assignStage({
        orderId: order._id,
        suitId: suitId,
        data: { stage: 'stitching', isSelf: false, workerId: null }
      });
      return;
    }

    if (selected === 'self') {
      assignStage({
        orderId: order._id,
        suitId: suitId,
        data: { stage: 'stitching', isSelf: true }
      });
    } else {
      assignStage({
        orderId: order._id,
        suitId: suitId,
        data: { stage: 'stitching', isSelf: false, workerId: selected }
      });
    }
  };

  const handleModalStatusChange = (newStatus) => {
    if (newStatus === 'Delivered') {
      closeModal();
      if (onOpenDelivery) onOpenDelivery(order);
    } else {
      updateOrder({ id: order._id, data: { orderStatus: newStatus } }, {
        onSuccess: () => {
          toast.success(`Order status updated to "${newStatus}"`);
        }
      });
    }
  };

  const handleApprove = (suitId) => {
    approveSuit({ orderId: order._id, suitId });
  };

  const handleOpenReworkModal = (suit) => {
    setReworkModalSuit(suit);
    setReworkNotes('');
  };

  const handleSubmitRework = () => {
    if (!reworkNotes.trim()) {
      toast.error('Please specify the reason for alteration / rework.');
      return;
    }
    rejectSuit({ 
      orderId: order._id, 
      suitId: reworkModalSuit._id, 
      reworkNotes 
    }, {
      onSuccess: () => {
        setReworkModalSuit(null);
      }
    });
  };

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
                    #BT-{order.orderNumber}
                  </span>
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
            
            {/* 1. TOP 4 SUMMARY CARDS: Customer, Timeline, Financials, Staff Handling */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              
              {/* Customer Details Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiUser className="text-[#DFAC43]" /> Customer Information
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{order.customer?.name || 'Walk-in Customer'}</p>
                <p className="text-[11px] text-gray-600 font-semibold flex items-center gap-1 font-mono">
                  <FiPhone className="text-gray-400 text-[9px]" /> {formatPhone(order.customer?.phone)}
                </p>
                {order.customer?.address && (
                  <p className="text-[10px] text-gray-400 truncate">{order.customer.address}</p>
                )}
              </div>

              {/* Dates Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiCalendar className="text-[#DFAC43]" /> Timeline & Schedule
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Booked:</span>
                  <span className="text-gray-900">{new Date(order.bookingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Delivery Due:</span>
                  <span className="text-red-600 font-black">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Financial Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiCreditCard className="text-[#DFAC43]" /> Financial Summary
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Total Bill:</span>
                  <span className="text-black font-black font-sans">Rs {order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Advance / Bal:</span>
                  <span>
                    <span className="text-green-600 font-bold font-sans">Rs {order.advancePaid || 0}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-red-500 font-black font-sans">Rs {order.balanceAmount || 0}</span>
                  </span>
                </div>
              </div>

              {/* Staff Handling & Audit Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiUserCheck className="text-[#DFAC43]" /> Staff Audit
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Booked By:</span>
                  <span className="text-gray-900 font-bold truncate max-w-[110px]">{order.createdBy?.name || 'Admin'}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Delivered By:</span>
                  <span className={`font-bold truncate max-w-[110px] ${order.orderStatus === 'Delivered' ? 'text-emerald-700' : 'text-gray-400'}`}>
                    {order.orderStatus === 'Delivered' 
                      ? (order.deliveredBy?.name || order.receivedAtDelivery?.receivedBy || 'Admin')
                      : 'Not Delivered'}
                  </span>
                </div>
              </div>

            </div>

            {/* SUIT SELECTION TABS (If multiple suits in order) */}
            {suitsList.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase shrink-0">Suits:</span>
                {suitsList.map((s, sIdx) => (
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
                    <span>Suit #{sIdx + 1} ({s.suitNumber || `BT-${order.orderNumber}-${sIdx + 1}`})</span>
                    {s.fabricDetails && <span className="text-[10px] opacity-75">[{s.fabricDetails}]</span>}
                  </button>
                ))}
              </div>
            )}

            {/* 2. MAIN SPLIT SECTION: LEFT SIDE (PARCHI DETAIL) & RIGHT SIDE (IMAGE, STATUS, EDIT, ASSIGN) */}
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
                      Stitching: Rs {activeSuit.price || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPrintJobSuit({ order, suit: activeSuit, suitIndex: selectedSuitIndex })}
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

                      {/* Fabric Details & Volume Badge (ONLY actual order data) */}
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

              {/* RIGHT SIDE (lg:col-span-5): FABRIC IMAGE + LIVE STATUS CHANGER + EDIT FORM LINK + ASSIGN KARIGAR */}
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

                {/* 2. LIVE ORDER STATUS & FULL EDIT BUTTON */}
                <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <FiBox className="text-[#DFAC43]" /> Order Status & Actions
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleModalStatusChange(e.target.value)}
                      disabled={isUpdatingStatus}
                      className="flex-1 border-2 border-gray-200 focus:border-black rounded-lg py-2 px-2.5 text-xs font-bold outline-none bg-white cursor-pointer"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        navigate(isWorker ? `/worker/orders/edit/${order._id}` : `/admin/orders/edit/${order._id}`);
                      }}
                      className="bg-[#DFAC43] hover:bg-yellow-400 text-[#0F172A] font-black px-3.5 py-2 rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0 uppercase tracking-wider active:scale-98"
                      title="Open full order in order creation/edit form"
                    >
                      <FiEdit className="text-xs" /> Edit Order
                    </button>
                  </div>
                </div>

                {/* 3. STITCHER / KARIGAR ASSIGNMENT CARD (Compact) */}
                <div className="bg-slate-50 border border-gray-200 rounded-xl p-3 shadow-2xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FiUserCheck className="text-[#DFAC43]" /> Karigar Assignment
                    </label>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                      isStitched ? 'bg-green-600 text-white' :
                      isUnderInspection ? 'bg-amber-400 text-black' :
                      isRework ? 'bg-red-600 text-white' :
                      activeSuit.stitchingStatus === 'Assigned' ? 'bg-blue-600 text-white' :
                      'bg-gray-700 text-gray-200'
                    }`}>
                      {activeSuit.stitchingStatus || 'Pending'}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-gray-600 bg-white p-2 rounded-lg border border-gray-200">
                    <span className="text-[9px] text-gray-400 block uppercase mb-0.5">Current Assigned Status:</span>
                    {activeSuit.stitching?.isSelf ? (
                      <span className="text-purple-700 font-black inline-flex items-center gap-1">
                        <FiStar className="text-amber-500" /> Owner / Self Stitched
                      </span>
                    ) : activeWorkerObj ? (
                      <span className="text-blue-700 font-black inline-flex items-center gap-1 truncate">
                        <FiUser className="text-blue-600 shrink-0" /> {activeWorkerObj.name} (Rs {activeWorkerObj.perSuitWage})
                      </span>
                    ) : (
                      <span className="text-amber-800 font-black inline-flex items-center gap-1">
                        <FiClock className="text-amber-600" /> Unassigned (Pending)
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <select
                      value={draftValue}
                      disabled={isStitched || isAssigningStage}
                      onChange={(e) => handleWorkerDraftChange(suitKey, e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-black rounded-lg p-2 outline-none text-xs font-bold bg-white disabled:bg-gray-200 cursor-pointer"
                    >
                      <option value="">-- Select Karigar (Unassigned) --</option>
                      <option value="self">★ Owner / Self (In-House Stitched)</option>
                      <optgroup label="Registered Karigars">
                        {workers.filter(w => w.isActive).map(w => (
                          <option key={w._id} value={w._id}>{w.name} - Wage: Rs {w.perSuitWage}</option>
                        ))}
                      </optgroup>
                    </select>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAssignWorker(activeSuit._id)}
                        disabled={isStitched || isAssigningStage}
                        className="flex-1 bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black py-1.5 px-2.5 rounded-lg text-xs uppercase tracking-wider transition shadow-2xs flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                      >
                        <FiUserCheck /> Assign
                      </button>

                      {!isStitched && (
                        <button
                          type="button"
                          onClick={() => handleApprove(activeSuit._id)}
                          disabled={isApproving}
                          className="bg-green-700 hover:bg-green-800 text-white font-black py-1.5 px-2.5 rounded-lg text-xs uppercase tracking-wider transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                          title="Directly mark suit as QC Passed & Stitched"
                        >
                          <FiScissors /> Pass & Stitched
                        </button>
                      )}
                    </div>
                  </div>

                  {/* QC Approval / Rework Actions if under inspection */}
                  {isUnderInspection && (
                    <div className="bg-amber-100 border border-amber-300 rounded-lg p-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-950 font-black text-xs">
                        <FiClock className="text-amber-800 text-sm shrink-0" />
                        <span>Submitted for QC Inspection!</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApprove(activeSuit._id)}
                          disabled={isApproving}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-xs py-1.5 px-2 rounded-lg transition shadow flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FiCheck /> Approve (+ Rs {activeWorkerObj?.perSuitWage || 600})
                        </button>
                        <button
                          onClick={() => handleOpenReworkModal(activeSuit)}
                          disabled={isRejecting}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs py-1.5 px-2 rounded-lg transition shadow flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FiAlertTriangle /> Rework
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Alterations if any */}
            {order.alterations && order.alterations.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1">
                  Alterations Details
                </h3>
                
                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs space-y-1.5">
                  {order.alterations.map((alt, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-gray-100 last:border-b-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{alt.description || 'Alteration'}</span>
                        {alt.wearer && (
                          <span className="text-[10px] text-gray-400 font-semibold">For Wearer ID: {alt.wearer}</span>
                        )}
                      </div>
                      <span className="font-black text-black">Rs {alt.price || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="py-2.5 px-4 border-t border-gray-200 bg-white flex justify-end gap-2.5 shrink-0">
            {order.orderStatus !== 'Delivered' && onOpenDelivery && (
              <button
                onClick={() => {
                  closeModal();
                  onOpenDelivery(order);
                }}
                className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] px-4 py-2 rounded-lg text-xs font-black transition shadow flex items-center gap-1.5 cursor-pointer"
              >
                <FiCheckCircle /> Deliver & Settle Payment
              </button>
            )}
            <button 
              onClick={closeModal} 
              className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-xs font-bold transition shadow cursor-pointer"
            >
              Close Details
            </button>
          </div>

        </div>

        {/* REWORK NOTES POPUP MODAL */}
        {reworkModalSuit && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-red-200 animate-scale-up">
              <div className="flex items-center gap-2 text-red-600">
                <FiAlertTriangle className="text-2xl" />
                <h3 className="text-base font-black uppercase tracking-wider">Send Suit for Rework / Alteration</h3>
              </div>
              
              <p className="text-xs text-gray-500 font-medium">
                Suit: <strong>{reworkModalSuit.fabricDetails}</strong> (Wearer: {reworkModalSuit.wearer?.name || 'Customer'})
              </p>

              <div className="space-y-1">
                <label className="block text-[11px] font-black text-gray-700 uppercase">
                  Alteration / Defect Reason:
                </label>
                <textarea
                  rows={3}
                  value={reworkNotes}
                  onChange={(e) => setReworkNotes(e.target.value)}
                  placeholder="e.g. Collar adjustment, shorten length by 1 inch, loosen sleeve..."
                  className="w-full border-2 border-gray-200 focus:border-red-500 rounded-lg p-3 text-xs outline-none font-medium text-gray-800"
                />
              </div>

              <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded font-bold flex items-center gap-1">
                <FiAlertTriangle className="text-red-600 shrink-0" /> Note: Worker wage will remain on hold until alteration is completed and approved.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReworkModalSuit(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black rounded transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRework}
                  disabled={isRejecting}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-5 py-2 rounded transition shadow cursor-pointer"
                >
                  Submit Rework Request
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DEDICATED SUIT CUTTING & STITCHING JOB PARCHI PRINT MODAL */}
      {printJobSuit && (
        <SuitJobCardPrintModal
          order={printJobSuit.order}
          suit={printJobSuit.suit}
          suitIndex={printJobSuit.suitIndex}
          closeModal={() => setPrintJobSuit(null)}
        />
      )}
    </>
  );
};



// -------------------------------------------------------------
// COMPONENT: ORDER DELIVERY & CASH/KHATA SETTLEMENT MODAL
// -------------------------------------------------------------
const OrderDeliveryModal = ({ order, closeModal }) => {
  const { mutate: deliverOrder, isPending } = useDeliverOrder();
  
  const balanceDue = Number(order.balanceAmount) || 0;
  const [receivedAmount, setReceivedAmount] = useState(balanceDue.toString());
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [settlementData, setSettlementData] = useState(null);

  const numReceived = Number(receivedAmount) || 0;
  const diff = balanceDue - numReceived;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      receivedAmount: numReceived,
      paymentMethod,
      deliveredBy: {
        userType: 'admin',
        name: 'Admin'
      }
    };

    deliverOrder({
      id: order._id,
      data: payload
    }, {
      onSuccess: () => {
        setSettlementData({
          receivedAmount: numReceived,
          paymentMethod,
          diff
        });
        setShowSlipModal(true);
      }
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 font-sans">
        <div className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-scale-up">
          
          {/* Modal Header */}
          <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#DFAC43] rounded-sm"></span>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FiCheckCircle className="text-[#DFAC43]" /> Handover Suit & Receive Payment
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
                  Amount Receiving at Handover
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
                  <option value="Cash">Cash</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Bank">Bank Transfer / Card</option>
                </select>
              </div>

              {/* Dynamic Khata Feedback Alert */}
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
                    <span>Rs {diff.toLocaleString()} baqiya balance customer ke Khata/Ledger mein udhar darj ho jayega.</span>
                  </p>
                )}
                {diff < 0 && (
                  <p className="flex items-center gap-1.5">
                    <FiCheck className="text-green-600 shrink-0 text-sm" />
                    <span>Rs {Math.abs(diff).toLocaleString()} extra payment customer ke advance balance mein jama ho jayegi.</span>
                  </p>
                )}
                {diff === 0 && (
                  <p className="flex items-center gap-1.5">
                    <FiCheckCircle className="text-emerald-600 shrink-0 text-sm" />
                    <span>Full payment received! Nill balance (Khata mukamal clear).</span>
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
                  <FiCheckCircle /> {isPending ? 'Processing...' : 'Confirm Delivery & Update Khata'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* DELIVERY & PAID RECEIPT SLIP MODAL */}
      {showSlipModal && (
        <DeliveryReceiptModal
          order={order}
          settlementData={settlementData || { receivedAmount: numReceived, paymentMethod, diff }}
          closeModal={() => {
            setShowSlipModal(false);
            closeModal();
          }}
        />
      )}
    </>
  );
};

// -------------------------------------------------------------
// COMPONENT: DELIVERED & PAID RECEIPT SLIP MODAL (PRINTABLE)
// -------------------------------------------------------------
const DeliveryReceiptModal = ({ order, settlementData, closeModal }) => {
  const [paperSize, setPaperSize] = useState('80mm'); // '56mm' | '80mm' | 'a4'
  const { data: shopSettings } = useGetShopSettings();

  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';
  const tagline = shopSettings?.tagline || 'Gents Shalwar Qameez Specialist';
  const proprietor = shopSettings?.proprietor || 'Zubair Balouch';
  const primaryPhone = shopSettings?.primaryPhone || '0313-4389192';
  const secondaryPhone = shopSettings?.secondaryPhone || '0306-7379919';
  const address = shopSettings?.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan';

  const { receivedAmount = 0, paymentMethod = 'Cash', diff = 0 } = settlementData || {};
  const totalBill = Number(order.totalAmount) || 0;
  const advancePaid = Number(order.advancePaid) || 0;
  const remainingBal = diff;

  const handlePrint = () => {
    try {
      const originalTitle = document.title;
      document.title = `DeliverySlip_BT-${order.orderNumber}`;
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
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 font-sans overflow-y-auto">
      
      {/* Print Specific CSS */}
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
          #delivery-printable-slip, #delivery-printable-slip * {
            visibility: visible !important;
          }
          #delivery-printable-slip {
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

      <div className="bg-white rounded shadow-2xl max-w-2xl w-full border  overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        
        {/* TOP CONTROLS BAR (SCREEN ONLY) */}
        <div className="bg-[#0F172A] text-white p-4 flex flex-wrap justify-between items-center gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 bg-[#DFAC43] rounded-sm"></span>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <FiPrinter className="text-[#DFAC43]" /> Delivery & Handover Paid Slip
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Paper Size Switcher */}
            <div className="flex items-center bg-gray-800 p-1 rounded border border-gray-700 text-xs font-bold">
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
              onClick={handlePrint}
              className="bg-[#DFAC43] hover:bg-yellow-400 text-[#0F172A] font-black text-xs px-4 py-1.5 rounded transition shadow flex items-center gap-1 cursor-pointer"
            >
              <FiPrinter /> Print Slip
            </button>

            <button
              type="button"
              onClick={closeModal}
              className="text-gray-400 hover:text-white p-1 text-lg transition cursor-pointer"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-100 flex justify-center items-start">
          
          <div 
            id="delivery-printable-slip"
            className={`bg-white shadow-md border border-gray-300 text-black leading-tight ${containerWidthClass}`}
          >
            {/* SHOP HEADER */}
            <div className="text-center pb-2 border-b-2 border-black space-y-1">
              {/* Logo */}
              <div className="flex justify-center mb-0.5">
                <img 
                  src={currentLogo} 
                  alt={shopName} 
                  className={paperSize === '56mm' ? 'h-9 w-auto object-contain' : paperSize === '80mm' ? 'h-11 w-auto object-contain' : 'h-14 w-auto object-contain'} 
                />
              </div>

              {/* Shop Name */}
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
                  DELIVERY & PAYMENT SLIP
                </span>
              </div>
            </div>

            {/* ORDER & CUSTOMER METADATA */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>Order No:</span>
                <span className="font-black font-sans text-sm">#BT-{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Date:</span>
                <span className="font-bold">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-black">{order.customer?.name || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-bold">{formatPhone(order.customer?.phone)}</span>
              </div>
            </div>

            {/* DELIVERED SUITS LIST */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-1.5">
              <div className="flex justify-between font-black text-[10px] uppercase border-b border-gray-200 pb-1">
                <span>Delivered Suit Items</span>
                <span>Qty: {order.suits?.length || 1}</span>
              </div>
              
              {order.suits && order.suits.map((suit, idx) => (
                <div key={idx} className="flex justify-between items-start text-[10px] py-0.5">
                  <div>
                    <span className="font-black font-mono bg-gray-100 px-1 py-0.2 rounded border border-gray-200">
                      {suit.suitNumber || `BT-${order.orderNumber}-${idx + 1}`}
                    </span>
                    <p className="font-bold text-gray-800 mt-0.5">{suit.serviceType || 'Shalwar Qameez'} ({suit.fabricDetails})</p>
                    {suit.wearer?.name && <p className="text-gray-500 text-[9px]">Wearer: {suit.wearer.name}</p>}
                  </div>
                  <span className="font-black text-right font-sans">Rs {suit.price}</span>
                </div>
              ))}
            </div>

            {/* FINANCIAL SETTLEMENT BREAKDOWN */}
            <div className="py-2 border-b-2 border-black space-y-1 text-[11px]">
              <div className="flex justify-between font-bold text-gray-700">
                <span>Total Order Bill:</span>
                <span className="font-black font-sans">Rs {totalBill.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Advance Paid Earlier:</span>
                <span className="font-bold font-sans">Rs {advancePaid.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-green-800 font-bold bg-green-50 px-1 py-0.5 rounded border border-green-200">
                <span>Handover Paid ({paymentMethod}):</span>
                <span className="font-black font-sans">Rs {Number(receivedAmount).toLocaleString()}</span>
              </div>

              {/* REMAINING BALANCE ROW */}
              <div className="flex justify-between items-center pt-1 border-t border-gray-200 text-xs font-black">
                <span>Net Balance Status:</span>
                <span>
                  {remainingBal === 0 ? (
                    <span className="text-green-800 font-black">Rs 0 (NILL / FULLY PAID)</span>
                  ) : remainingBal > 0 ? (
                    <span className="text-red-700 font-black">Rs {remainingBal.toLocaleString()} (Udhar / Khata)</span>
                  ) : (
                    <span className="text-blue-700 font-black">Rs {Math.abs(remainingBal).toLocaleString()} (Credit)</span>
                  )}
                </span>
              </div>
            </div>

            {/* STATUS BADGE / ACKNOWLEDGEMENT */}
            <div className="text-center py-2 space-y-1.5">
              
              <p className="text-[9px] text-gray-500 italic">
                Suit checked & received in good order. Thank you for choosing {shopName}!
              </p>

             

              {/* Shop & Proprietor Footer Stamp */}
              <div className="pt-2 border-t-2 border-black text-center space-y-0.5 text-black">
                <p className="font-black text-[9px] sm:text-[10px] uppercase tracking-wider">
                  Proprietor: {proprietor}
                </p>
                <p className="font-black text-[9px] sm:text-[10px] font-sans">
                  Phone: {primaryPhone}{secondaryPhone ? ` | ${secondaryPhone}` : ''}
                </p>
                <p className="text-[7px] sm:text-[8px] text-gray-600">
                  {address}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* MODAL FOOTER */}
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
            <FiPrinter /> Print Receipt Slip
          </button>
        </div>

      </div>

    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT: SUIT CUTTING & STITCHING JOB PARCHI PRINT MODAL
// -------------------------------------------------------------
const SuitJobCardPrintModal = ({ order, suit, suitIndex = 0, closeModal }) => {
  const [paperSize, setPaperSize] = useState('80mm'); // '56mm' | '80mm' | 'a4'
  const { data: shopSettings } = useGetShopSettings();
  const { data: workers = [] } = useGetWorkers();

  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';
  const tagline = shopSettings?.tagline || 'Gents Shalwar Qameez Specialist';
  const proprietor = shopSettings?.proprietor || 'Zubair Balouch';
  const primaryPhone = shopSettings?.primaryPhone || '0313-4389192';
  const secondaryPhone = shopSettings?.secondaryPhone || '0306-7379919';
  const address = shopSettings?.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan';

  const suitIdBadge = suit?.suitNumber || `BT-${order?.orderNumber}-${suitIndex + 1}`;
  const wearer = suit?.wearer || {};
  const measurements = (suit?.measurements && suit?.measurements.length > 0)
    ? suit?.measurements
    : (wearer.measurements || order?.customer?.measurements || []);
  const prefs = suit?.stitchingPreferences || wearer.stitchingPreferences || order?.customer?.stitchingPreferences || {};

  // Extract direct selected preferences from all sources
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

  // Current assigned worker name
  const currentAssignedId = suit?.stitching?.isSelf 
    ? 'self' 
    : (suit?.assignedWorker?._id || suit?.assignedWorker || '');
  const activeWorkerObj = workers.find(w => w._id === currentAssignedId) || (typeof suit?.assignedWorker === 'object' ? suit?.assignedWorker : null);
  const workerDisplay = suit?.stitching?.isSelf 
    ? 'Owner / Self Stitched' 
    : activeWorkerObj ? `${activeWorkerObj.name} (Rs ${activeWorkerObj.perSuitWage})` : 'Unassigned / Pending';

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
      
      {/* Print Specific CSS */}
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

      <div className="bg-white rounded shadow-2xl max-w-2xl w-full border  overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        
        {/* TOP CONTROLS BAR (SCREEN ONLY) */}
        <div className="bg-[#0F172A] text-white p-4 flex flex-wrap justify-between items-center gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 bg-[#DFAC43] rounded"></span>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <FiPrinter className="text-[#DFAC43]" /> Print Suit Cutting & Job Parchi
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Paper Size Switcher */}
            <div className="flex items-center bg-gray-800 p-1 rounded  text-xs font-bold">
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

            {/* <button
              type="button"
              onClick={handlePrint}
              className="bg-[#DFAC43] hover:bg-yellow-400 text-[#0F172A] font-black text-xs px-4 py-1.5 rounded transition shadow flex items-center gap-1 cursor-pointer"
            >
              <FiPrinter /> Print Parchi
            </button> */}

            <button
              type="button"
              onClick={closeModal}
              className="text-gray-400 hover:text-white p-1 text-lg transition cursor-pointer"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-100 flex justify-center items-start">
          
          <div 
            id="suit-job-printable-slip"
            className={`bg-white shadow-md  text-black leading-tight ${containerWidthClass}`}
          >
            {/* SHOP HEADER */}
            <div className="text-center pb-2 border-b-2 border-black space-y-1">
              {/* Logo */}
              <div className="flex justify-center mb-0.5">
                <img 
                  src={currentLogo} 
                  alt={shopName} 
                  className={paperSize === '56mm' ? 'h-9 w-auto object-contain' : paperSize === '80mm' ? 'h-11 w-auto object-contain' : 'h-14 w-auto object-contain'} 
                />
              </div>

              {/* Shop Name */}
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

            {/* ORDER & SUIT METADATA */}
            <div className="py-2 border-b border-dashed  space-y-1 text-[11px]">
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
                  {new Date(order?.deliveryDate).toLocaleDateString()}
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
                <span className="font-bold">{suit?.fabricDetails} {suit?.volumeNo ? `[Vol: ${suit?.volumeNo}]` : ''}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-600">Stitching Price:</span>
                <span className="font-black font-sans">Rs {suit?.price || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Karigar:</span>
                <span className="font-bold">{workerDisplay}</span>
              </div>
            </div>

            {/* STYLE & DESIGN PREFERENCES (DIRECT CHOICES) */}
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

            {/* ADD-ONS ON DEDICATED SEPARATE LINE */}
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

            {/* SPECIAL TAILOR INSTRUCTIONS (خصوصی ہدایات) */}
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

            {/* FULL BODY MEASUREMENTS */}
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

            {/* CUTTING & STAMP FOOTER */}
            <div className="text-center py-2 space-y-1.5">
              {/* <div className="flex justify-between text-[9px] font-bold text-gray-600 pt-1">
                <span>Cutter Sign: _____________</span>
                <span>Master Sign: _____________</span>
              </div> */}

              {/* Shop & Proprietor Footer Stamp */}
              {/* <div className="pt-2 border-t-2 border-black text-center space-y-0.5 text-black">
                <p className="font-black text-[9px] sm:text-[10px] uppercase tracking-wider">
                  Proprietor: {proprietor}
                </p>
                <p className="font-black text-[9px] sm:text-[10px] font-sans">
                  Phone: {primaryPhone}{secondaryPhone ? ` | ${secondaryPhone}` : ''}
                </p>
                <p className="text-[7px] sm:text-[8px] text-gray-600">
                  {address}
                </p>
              </div> */}
            </div>

          </div>

        </div>

        {/* MODAL FOOTER */}
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

export default Allorders;