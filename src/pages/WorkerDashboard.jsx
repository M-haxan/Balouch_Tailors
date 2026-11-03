import React, { useState } from 'react';
import { useGetWorkerDashboard, useSubmitSuitForInspection, useGetWorkerLedger, useGetWorkerPayments } from '../hooks/useWorkers';
import { useGetOrders } from '../hooks/useOrder';
import useAuthStore from '../Store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiX, 
  FiClock, 
  FiAlertTriangle, 
  FiTruck 
} from 'react-icons/fi';
import Preloader from '../components/Preloader';
import DeliveryReceiptModal from '../components/DeliveryReceiptModal';
import WorkerHeader from '../components/WorkerHeader';
import WorkerStatsCards from '../components/WorkerStatsCards';
import WorkerSuitsTab from '../components/WorkerSuitsTab';
import WorkerLedgerTab from '../components/WorkerLedgerTab';
import WorkerDeliveryCounterTab from '../components/WorkerDeliveryCounterTab';
import WorkerSuitSpecsModal from '../components/WorkerSuitSpecsModal';
import WorkerPaymentReceiptModal from '../components/WorkerPaymentReceiptModal';
import WorkerOrderDeliveryModal from '../components/WorkerOrderDeliveryModal';

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
      <WorkerHeader
        worker={worker}
        canCreateOrder={canCreateOrder}
        canDeliverOrder={canDeliverOrder}
        handleLogout={handleLogout}
        navigate={navigate}
      />

      <main className="w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        
        {/* FINANCIAL & WORK STATUS CARDS */}
        <WorkerStatsCards stats={stats} worker={worker} />

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
            
            {/* 1-4. SUIT WORKFLOW TABS (ASSIGNED, INSPECTION, REWORK, COMPLETED) */}
            {['assigned', 'inspection', 'rework', 'completed'].includes(activeTab) && (
              <WorkerSuitsTab
                activeTab={activeTab}
                currentSuits={currentSuits}
                worker={worker}
                searchTerm={searchTerm}
                assignedCount={assignedCount}
                inspectionCount={inspectionCount}
                reworkCount={reworkCount}
                completedCount={completedCount}
                pagination={pagination}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                PAGE_SIZE={PAGE_SIZE}
                isSubmitting={isSubmitting}
                setSelectedSuitForSpecs={setSelectedSuitForSpecs}
                handleSubmitForQC={handleSubmitForQC}
              />
            )}

            {/* 5. LEDGER TAB */}
            {activeTab === 'ledger' && (
              <WorkerLedgerTab
                loadingLedger={loadingLedger}
                pendingLedger={pendingLedger}
                paginatedLedger={paginatedLedger}
                loadingPayments={loadingPayments}
                paymentsData={paymentsData}
                paginatedPayments={paginatedPayments}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                PAGE_SIZE={PAGE_SIZE}
                setViewingPayment={setViewingPayment}
              />
            )}

            {/* 6. DELIVERY & CASH COUNTER TAB */}
            {activeTab === 'delivery_counter' && canDeliverOrder && (
              <WorkerDeliveryCounterTab
                canCreateOrder={canCreateOrder}
                navigate={navigate}
                deliverySearchTerm={deliverySearchTerm}
                setDeliverySearchTerm={setDeliverySearchTerm}
                deliveryPage={deliveryPage}
                setDeliveryPage={setDeliveryPage}
                loadingOrders={loadingOrders}
                undeliveredOrders={undeliveredOrders}
                paginatedDeliveryOrders={paginatedDeliveryOrders}
                PAGE_SIZE={PAGE_SIZE}
                setOrderToDeliver={setOrderToDeliver}
              />
            )}

          </div>

        </section>

      </main>

      {/* Suit Naap & Specifications Modal */}
      {selectedSuitForSpecs && (
        <WorkerSuitSpecsModal
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
        <WorkerPaymentReceiptModal
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

export default WorkerDashboard;
