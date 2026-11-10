import React, { useState } from 'react';
import { useGetOrders, useUpdateOrderStatus, useDeleteOrder } from '../hooks/useOrder';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FiSearch, 
  FiBox, 
  FiFilter, 
  FiX, 
  FiScissors, 
  FiClock,
  FiTruck
} from 'react-icons/fi';
import Pagination from '../components/Pagination';
import OrderDesktopTable from '../components/OrderDesktopTable';
import OrderMobileCards from '../components/OrderMobileCards';
import OrderDetailsModal from '../components/OrderDetailsModal';
import OrderDeliveryModal from '../components/OrderDeliveryModal';
import { getStatusColor } from '../utils/orderStatus';

export { getStatusColor };

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

  const { mutate: changeOrderStatus } = useUpdateOrderStatus();
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
    if (!newStatus || newStatus === order.orderStatus) return;

    if (newStatus === 'Delivered') {
      setDeliveryModalOrder(order);
      return;
    }

    changeOrderStatus({ id: order._id, orderStatus: newStatus });
  };

  const handleDelete = (id) => {
    const targetOrder = (Array.isArray(orders) ? orders : (orders?.orders || [])).find(o => o._id === id);
    if (targetOrder) {
      if (Number(targetOrder.paidAmount || targetOrder.advancePaid || 0) > 0 || targetOrder.orderStatus === 'Delivered') {
        toast.error('Cannot delete order with active payments or delivered status. Please cancel the order instead.');
        return;
      }
    }
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrder(id);
    }
  };

  return (
    <div className="bg-white rounded shadow-sm p-3.5 sm:p-6 min-h-[85vh] relative">
      
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
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-100 focus:border-black rounded outline-none font-bold text-xs sm:text-sm bg-white appearance-none cursor-pointer shadow-2xs"
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
              className="w-full pl-9 pr-8 py-2.5 border-2 border-gray-100 focus:border-black rounded outline-none text-xs sm:text-sm font-medium transition shadow-2xs"
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
              className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 rounded text-[10px] sm:text-xs font-black transition flex items-center justify-between sm:justify-center gap-1 sm:gap-1.5 cursor-pointer shadow-2xs ${
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
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded">
          <p className="text-gray-500 font-medium">{t('orders.noOrdersFound')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. DESKTOP VIEW (TABLE) */}
          <OrderDesktopTable
            orders={filteredOrders}
            statusOptions={statusOptions}
            getStatusColor={getStatusColor}
            handleStatusChange={handleStatusChange}
            handleOpenViewOrder={handleOpenViewOrder}
            setDeliveryModalOrder={setDeliveryModalOrder}
            handleDelete={handleDelete}
            isDeleting={isDeleting}
            navigate={navigate}
            t={t}
          />

          {/* 2. MOBILE VIEW (TABLE-TO-CARD PATTERN) */}
          <OrderMobileCards
            orders={filteredOrders}
            statusOptions={statusOptions}
            getStatusColor={getStatusColor}
            handleStatusChange={handleStatusChange}
            handleOpenViewOrder={handleOpenViewOrder}
            setDeliveryModalOrder={setDeliveryModalOrder}
            handleDelete={handleDelete}
            isDeleting={isDeleting}
            navigate={navigate}
          />
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

export default Allorders;