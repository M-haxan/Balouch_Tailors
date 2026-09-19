import React, { useState } from 'react';
import { useGetOrders, useUpdateOrder, useDeleteOrder, useDeliverOrder } from '../hooks/useOrder';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/BT_Logo.png';
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
  FiUserCheck
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { 
  useGetWorkers, 
  useAssignWorker, 
  useMarkSuitStitched, 
  useApproveSuit, 
  useRejectSuit, 
  useAssignSuitStage 
} from '../hooks/useWorkers';

const Allorders = () => {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetOrders();
  const { mutate: updateOrder } = useUpdateOrder();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingOrder, setViewingOrder] = useState(null);

  // Delivery & Handover modal state
  const [deliveryModalOrder, setDeliveryModalOrder] = useState(null);

  // Count suits waiting for inspection across all orders
  let totalPendingQC = 0;
  orders.forEach(ord => {
    ord.suits?.forEach(s => {
      if (s.stitchingStatus === 'Submitted for Inspection') totalPendingQC++;
    });
  });

  // Order Status Options (Including Delivered)
  const statusOptions = ['Pending', 'In Progress', 'Completed', 'Delivered', 'Cancelled'];

  // Filter Logic - Robust Search by Order ID, Suit ID, Customer, Phone, Wearer, Fabric, Vol
  const filteredOrders = orders.filter(order => {
    const rawSearch = searchTerm.trim().toLowerCase();
    
    // Check if matching status filter first if no search
    if (!rawSearch) {
      if (statusFilter === 'PendingQC') {
        return order.suits?.some(s => s.stitchingStatus === 'Submitted for Inspection');
      }
      return statusFilter === 'All' || order.orderStatus === statusFilter;
    }

    // Strip out prefixes like '#', 'bt-', 'bt ' for flexible matching
    const searchClean = rawSearch.replace(/^#/, '').replace(/^bt[-\s]?/i, '').trim();

    const customerName = (order.customer?.name || '').toLowerCase();
    const customerPhone = (order.customer?.phone ? order.customer.phone.toString() : '');
    const orderNum = (order.orderNumber ? order.orderNumber.toString() : '');
    const orderIdFull = `bt-${orderNum}`.toLowerCase();

    const matchesDirect = 
      customerName.includes(rawSearch) || 
      customerPhone.includes(rawSearch) ||
      customerPhone.includes(searchClean) ||
      orderNum === searchClean ||
      orderNum.includes(searchClean) ||
      orderIdFull.includes(rawSearch);

    const matchesSuit = order.suits && order.suits.some((s, idx) => {
      const suitNumStr = (s.suitNumber || '').toLowerCase();
      const suitIndexStr = `${orderNum}-${idx + 1}`.toLowerCase();
      const formattedSuitId = `bt-${orderNum}-${idx + 1}`.toLowerCase();
      const wearerName = (s.wearer?.name || '').toLowerCase();
      const fabric = (s.fabricDetails || '').toLowerCase();
      const vol = (s.volumeNo || '').toLowerCase();
      const notes = (s.customDesign || '').toLowerCase();
      const tags = (s.staticTags || []).join(' ').toLowerCase();

      return (
        suitNumStr.includes(rawSearch) ||
        suitNumStr.includes(searchClean) ||
        suitIndexStr.includes(searchClean) ||
        suitIndexStr.includes(rawSearch) ||
        formattedSuitId.includes(rawSearch) ||
        wearerName.includes(rawSearch) ||
        fabric.includes(rawSearch) ||
        vol.includes(rawSearch) ||
        notes.includes(rawSearch) ||
        tags.includes(rawSearch)
      );
    });

    const matchesSearch = matchesDirect || matchesSuit;

    if (statusFilter === 'PendingQC') {
      const hasPendingQC = order.suits?.some(s => s.stitchingStatus === 'Submitted for Inspection');
      return matchesSearch && hasPendingQC;
    }

    const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleStatusChange = (order, newStatus) => {
    if (newStatus === 'Delivered') {
      setDeliveryModalOrder(order);
    } else {
      updateOrder({ id: order._id, data: { orderStatus: newStatus } });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Kya aap waqai is order ko hamesha ke liye delete karna chahte hain?')) {
      deleteOrder(id);
    }
  };

  // Badge Color Logic
  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'In Progress': return 'bg-slate-100 text-gray-800 border-slate-200';
      case 'Completed': return 'bg-amber-50 text-[#DFAC43] border-[#DFAC43]';
      case 'Delivered': return 'bg-[#0F172A] text-white border-[#0F172A]';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[85vh] relative">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-black flex items-center gap-2">
            <FiBox className="text-[#D4AF37]" /> All Orders Directory
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage tailoring jobs, statuses, QC approvals, and cash flow.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Quick QC Filter Button */}
          {totalPendingQC > 0 && (
            <button
              onClick={() => setStatusFilter(statusFilter === 'PendingQC' ? 'All' : 'PendingQC')}
              className={`px-4 py-2 rounded-lg font-black text-xs transition border flex items-center gap-1.5 ${
                statusFilter === 'PendingQC' 
                  ? 'bg-amber-400 text-black border-amber-500 shadow-md' 
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 animate-pulse'
              }`}
            >
              <FiClock /> {totalPendingQC} Suits Waiting QC
            </button>
          )}

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border-2 border-gray-100 focus:border-black rounded-lg outline-none font-bold text-sm bg-white appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="PendingQC">Waiting QC Approval ({totalPendingQC})</option>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Suit ID (e.g. 1001-1), Name, Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border-2 border-gray-100 focus:border-black rounded-lg outline-none text-xs sm:text-sm font-medium transition"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5 rounded-full"
                title="Clear search"
              >
                <FiX className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-bold">Fetching latest orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 font-medium">Koi order nahi mila.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#0F172A] text-[#DFAC43] text-xs uppercase tracking-widest">
                <th className="p-4 rounded-tl">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4 text-center">Suits & QC Status</th>
                <th className="p-4">Financials</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 rounded-tr text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const hasPendingQC = order.suits?.some(s => s.stitchingStatus === 'Submitted for Inspection');
                const hasRework = order.suits?.some(s => s.stitchingStatus === 'Rework Required');

                return (
                  <tr key={order._id} className={`hover:bg-gray-50/80 transition-colors group ${hasPendingQC ? 'bg-amber-50/40' : ''}`}>
                    
                    {/* Order ID & Dates */}
                    <td className="p-4">
                      <p className="font-black text-black text-sm uppercase">#BT-{order.orderNumber}</p>
                      <p className="text-[11px] text-gray-500 font-bold mt-1">Booked: {new Date(order.bookingDate).toLocaleDateString()}</p>
                      <p className="text-[11px] text-amber-900 font-black">Due: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                    </td>

                    {/* Customer Info */}
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{order.customer?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 font-semibold">{order.customer?.phone || '-'}</p>
                    </td>

                    {/* Suit Count & QC Badges */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-gray-100 text-black font-black px-3 py-0.5 rounded text-xs">
                          {order.suits?.length || 0} Suits
                        </span>
                        {hasPendingQC && (
                          <span className="bg-[#DFAC43] text-[#0F172A] text-[10px] font-black px-2 py-0.5 rounded uppercase inline-flex items-center gap-1 animate-pulse">
                            <FiClock /> Needs QC Pass
                          </span>
                        )}
                        {hasRework && (
                          <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded uppercase inline-flex items-center gap-1">
                            <FiAlertTriangle /> In Rework
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cash Flow */}
                    <td className="p-4">
                      <p className="text-sm font-black text-black">Rs {order.totalAmount}</p>
                      {order.balanceAmount > 0 ? (
                        <p className="text-[11px] font-bold text-amber-900">Balance: Rs {order.balanceAmount}</p>
                      ) : (
                        <p className="text-[11px] font-bold text-gray-600">Fully Paid</p>
                      )}
                    </td>

                    {/* Live Status Updater Dropdown */}
                    <td className="p-4 text-center">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded border outline-none cursor-pointer text-center ${getStatusColor(order.orderStatus)}`}
                      >
                        {statusOptions.map(opt => <option key={opt} value={opt} className="bg-white text-black">{opt}</option>)}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Quick Deliver Button */}
                        {order.orderStatus !== 'Delivered' && (
                          <button
                            onClick={() => setDeliveryModalOrder(order)}
                            className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] text-xs font-black px-2.5 py-1.5 rounded transition shadow flex items-center gap-1 cursor-pointer"
                            title="Deliver Suit & Receive Payment"
                          >
                            <FiCheckCircle /> Deliver
                          </button>
                        )}

                        <button 
                          onClick={() => setViewingOrder(order)}
                          className={`p-2 rounded transition shadow-sm cursor-pointer ${
                            hasPendingQC 
                              ? 'bg-[#DFAC43] text-[#0F172A] font-bold hover:bg-white ring-2 ring-[#DFAC43]' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                          title="View Details / QC Inspect / Assign Worker"
                        >
                          <FiEye />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/print/${order._id}`)}
                          className="bg-[#0F172A] hover:bg-gray-800 text-[#DFAC43] p-2 rounded transition shadow-sm cursor-pointer"
                          title="Print Invoice"
                        >
                          <FiPrinter />
                        </button>
                        <button 
                          onClick={() => handleDelete(order._id)}
                          disabled={isDeleting}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded transition shadow-sm cursor-pointer"
                          title="Delete Order"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDER DETAILS & QC MODAL */}
      {viewingOrder && (
        <OrderDetailsModal 
          orderId={viewingOrder._id} 
          closeModal={() => setViewingOrder(null)} 
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

// -------------------------------------------------------------
// COMPONENT: ORDER DETAILS, SPECS, NAAP & QC INSPECTION MODAL
// -------------------------------------------------------------
const OrderDetailsModal = ({ orderId, closeModal, onOpenDelivery }) => {
  const { data: orders = [] } = useGetOrders();
  const { data: workers = [] } = useGetWorkers();
  const { mutate: assignStage, isPending: isAssigningStage } = useAssignSuitStage();
  const { mutate: approveSuit, isPending: isApproving } = useApproveSuit();
  const { mutate: rejectSuit, isPending: isRejecting } = useRejectSuit();

  const [reworkModalSuit, setReworkModalSuit] = useState(null);
  const [reworkNotes, setReworkNotes] = useState('');
  
  // Track selected worker draft per suit (suitId -> workerId | 'self')
  const [workerDrafts, setWorkerDrafts] = useState({});
  // Track open/collapsed Naap chart per suit
  const [openNaapMap, setOpenNaapMap] = useState({});

  const order = orders.find(o => o._id === orderId);
  if (!order) return null;

  const toggleNaap = (suitKey) => {
    setOpenNaapMap(prev => ({
      ...prev,
      [suitKey]: !prev[suitKey]
    }));
  };

  const handleWorkerDraftChange = (suitId, value) => {
    setWorkerDrafts(prev => ({
      ...prev,
      [suitId]: value
    }));
  };

  const handleAssignWorker = (suitId) => {
    const selected = workerDrafts[suitId];
    if (selected === undefined) {
      toast.info('Pehle worker ya Self-Stitch select karein.');
      return;
    }

    if (selected === 'self') {
      assignStage({
        orderId: order._id,
        suitId: suitId,
        data: { stage: 'stitching', isSelf: true }
      });
    } else if (selected === '') {
      assignStage({
        orderId: order._id,
        suitId: suitId,
        data: { stage: 'stitching', isSelf: false, workerId: null }
      });
    } else {
      assignStage({
        orderId: order._id,
        suitId: suitId,
        data: { stage: 'stitching', isSelf: false, workerId: selected }
      });
    }
  };

  const handleApprove = (suitId) => {
    if (window.confirm('Kya yeh suit quality pass hai? Approve karne par karigar ke ledger mein wage credit ho jayegi.')) {
      approveSuit({ orderId: order._id, suitId });
    }
  };

  const handleOpenReworkModal = (suit) => {
    setReworkModalSuit(suit);
    setReworkNotes('');
  };

  const handleSubmitRework = () => {
    if (!reworkNotes.trim()) {
      toast.error('Baraye meherbani alteration / rework ki wajah likhein.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl relative flex flex-col max-h-[92vh] overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-100 bg-[#0F172A] text-white">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-6 bg-[#DFAC43] rounded-sm"></span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Order Details & Specifications
                </h2>
                <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2.5 py-0.5 rounded shadow-xs">
                  #BT-{order.orderNumber}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                Full Naap measurements, styling specs, and Karigar work allocation
              </p>
            </div>
          </div>
          <button 
            onClick={closeModal} 
            className="p-1.5 text-gray-400 hover:text-white transition rounded-full hover:bg-gray-800 cursor-pointer"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 bg-gray-50/50">
          
          {/* Top Info Grid: Customer, Dates, Financials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Customer Details Card */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiUser className="text-[#DFAC43]" /> Customer Information
              </span>
              <p className="text-base font-bold text-gray-900">{order.customer?.name || 'Walk-in Customer'}</p>
              <p className="text-xs text-gray-600 font-semibold flex items-center gap-1">
                <FiPhone className="text-gray-400 text-[10px]" /> {order.customer?.phone || '-'}
              </p>
              {order.customer?.address && (
                <p className="text-[11px] text-gray-400 mt-1">{order.customer.address}</p>
              )}
            </div>

            {/* Dates Card */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiCalendar className="text-[#DFAC43]" /> Timeline & Schedule
              </span>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Booking Date:</span>
                <span className="text-gray-900">{new Date(order.bookingDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Delivery Due:</span>
                <span className="text-red-600 font-black">{new Date(order.deliveryDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Financial Card */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiCreditCard className="text-[#DFAC43]" /> Financial Summary
              </span>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Total Price:</span>
                <span className="text-black font-black">Rs {order.totalAmount}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Advance Paid:</span>
                <span className="text-green-600 font-bold">Rs {order.advancePaid || 0}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Balance Due:</span>
                <span className="text-red-500 font-black">Rs {order.balanceAmount || 0}</span>
              </div>
            </div>

          </div>

          {/* Suits List with Full Specs, Naap, and Assignment Button */}
          <div className="space-y-5">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <FiScissors className="text-[#DFAC43]" /> Suits & Stitching Specifications ({order.suits?.length || 0})
              </h3>
              <span className="text-[11px] text-gray-500 font-medium">Click "View Naap" to see full measurements</span>
            </div>
            
            {order.suits && order.suits.length > 0 ? (
              order.suits.map((suit, index) => {
                const suitKey = suit._id || `suit-${index}`;
                const suitIdBadge = suit.suitNumber || `BT-${order.orderNumber}-${index + 1}`;
                const isUnderInspection = suit.stitchingStatus === 'Submitted for Inspection';
                const isRework = suit.stitchingStatus === 'Rework Required';
                const isStitched = suit.stitchingStatus === 'Stitched';
                
                const wearer = suit.wearer || {};
                const measurements = (suit.measurements && suit.measurements.length > 0)
                  ? suit.measurements
                  : (wearer.measurements || order.customer?.measurements || []);
                const prefs = suit.stitchingPreferences || wearer.stitchingPreferences || order.customer?.stitchingPreferences || {};

                // Current assigned worker ID or 'self'
                const currentAssignedId = suit.stitching?.isSelf 
                  ? 'self' 
                  : (suit.assignedWorker?._id || suit.assignedWorker || '');
                
                // Draft selection
                const draftValue = workerDrafts[suitKey] !== undefined ? workerDrafts[suitKey] : currentAssignedId;
                const isNaapOpen = openNaapMap[suitKey] !== undefined ? openNaapMap[suitKey] : true;

                // Active assigned worker object
                const activeWorkerObj = workers.find(w => w._id === currentAssignedId) || (typeof suit.assignedWorker === 'object' ? suit.assignedWorker : null);

                return (
                  <div 
                    key={suitKey} 
                    className={`bg-white border rounded-xl overflow-hidden shadow-sm transition ${
                      isUnderInspection ? 'border-amber-400 ring-2 ring-amber-300/60 bg-amber-50/10' : 
                      isRework ? 'border-red-300 bg-red-50/10' : 
                      'border-gray-200'
                    }`}
                  >
                    {/* SUIT CARD TOP BAR */}
                    <div className="bg-[#0F172A] text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2.5 py-0.5 rounded shadow-xs">
                          ID: {suitIdBadge}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-gray-200">
                          {suit.serviceType || 'Shalwar Qameez'} - <span className="text-[#DFAC43]">{suit.fabricDetails}</span>
                        </span>
                        {suit.volumeNo && (
                          <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[10px] font-sans font-bold">
                            VOL: {suit.volumeNo}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#DFAC43]">
                          Stitching: Rs {suit.price}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase ${
                          isStitched ? 'bg-green-600 text-white' :
                          isUnderInspection ? 'bg-amber-400 text-black animate-pulse' :
                          isRework ? 'bg-red-600 text-white' :
                          suit.stitchingStatus === 'Assigned' ? 'bg-blue-600 text-white' :
                          'bg-gray-700 text-gray-200'
                        }`}>
                          {suit.stitchingStatus || 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* SUIT CARD BODY */}
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        
                        {/* Fabric Image & Wearer Info */}
                        <div className="lg:col-span-4 space-y-3">
                          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 p-3 min-h-[140px] relative">
                            {suit.fabricImage?.url ? (
                              <a href={suit.fabricImage.url} target="_blank" rel="noreferrer" className="block text-center w-full">
                                <img 
                                  src={suit.fabricImage.url} 
                                  alt="Suit Fabric" 
                                  className="max-h-36 w-full object-contain rounded shadow-xs hover:opacity-95 transition"
                                />
                                <span className="text-[10px] text-blue-600 font-bold block mt-1">Zoom Fabric Photo</span>
                              </a>
                            ) : (
                              <div className="text-center text-gray-400 py-4">
                                <FiBox className="text-3xl mx-auto mb-1 text-gray-300" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">No Fabric Image</span>
                              </div>
                            )}
                          </div>

                          {/* Wearer Card */}
                          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-xs space-y-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block">Wearer (Kiske liye hai):</span>
                            <p className="font-bold text-gray-900 text-sm">
                              {wearer.name ? (
                                <span className="text-blue-700 font-bold">{wearer.name}</span>
                              ) : (
                                <span className="text-gray-700">{order.customer?.name || 'Main Customer'}</span>
                              )}
                            </p>
                            {wearer.relation && (
                              <span className="text-[10px] text-gray-500 font-medium">Relation: {wearer.relation}</span>
                            )}
                          </div>

                          {/* Add-ons if any */}
                          {suit.customizations && suit.customizations.length > 0 && (
                            <div className="bg-amber-50/60 border border-amber-200 p-2.5 rounded-lg">
                              <span className="text-[9px] font-bold text-amber-900 uppercase block mb-1">Add-on Customizations:</span>
                              <div className="flex flex-wrap gap-1">
                                {suit.customizations.map((c, i) => (
                                  <span key={i} className="bg-[#0F172A] text-[#DFAC43] font-bold text-[9px] px-2 py-0.5 rounded">
                                    + {c.name} {c.urduName ? `(${c.urduName})` : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Styling Specs & Design Preferences */}
                        <div className="lg:col-span-8 space-y-3.5">
                          
                          {/* Style Preferences (Collar, Sleeves, Daman, Pockets, Patti) */}
                          <div className="bg-white border border-gray-200 rounded-lg p-3.5 space-y-2">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                              <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                                <FiTag className="text-[#DFAC43]" /> Style & Stitching Preferences (ڈیزائننگ / ترجیحات)
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              {prefs.collar && (
                                <div className="bg-gray-50 p-2 rounded border border-gray-150">
                                  <span className="text-[9px] text-gray-400 uppercase block font-semibold">Collar / Bain:</span>
                                  <span className="font-bold text-gray-900">{prefs.collar}</span>
                                </div>
                              )}
                              {prefs.sleeves && (
                                <div className="bg-gray-50 p-2 rounded border border-gray-150">
                                  <span className="text-[9px] text-gray-400 uppercase block font-semibold">Sleeves / Astin:</span>
                                  <span className="font-bold text-gray-900">{prefs.sleeves}</span>
                                </div>
                              )}
                              {prefs.daman && (
                                <div className="bg-gray-50 p-2 rounded border border-gray-150">
                                  <span className="text-[9px] text-gray-400 uppercase block font-semibold">Daman:</span>
                                  <span className="font-bold text-gray-900">{prefs.daman}</span>
                                </div>
                              )}
                              {prefs.frontPocket && (
                                <div className="bg-gray-50 p-2 rounded border border-gray-150">
                                  <span className="text-[9px] text-gray-400 uppercase block font-semibold">Front Pocket:</span>
                                  <span className="font-bold text-gray-900">{prefs.frontPocket}</span>
                                </div>
                              )}
                              {prefs.sidePockets && (
                                <div className="bg-gray-50 p-2 rounded border border-gray-150">
                                  <span className="text-[9px] text-gray-400 uppercase block font-semibold">Side Pockets:</span>
                                  <span className="font-bold text-gray-900">{prefs.sidePockets}</span>
                                </div>
                              )}
                              {prefs.shalwarPocket && (
                                <div className="bg-gray-50 p-2 rounded border border-gray-150">
                                  <span className="text-[9px] text-gray-400 uppercase block font-semibold">Shalwar Pocket:</span>
                                  <span className="font-bold text-gray-900">{prefs.shalwarPocket}</span>
                                </div>
                              )}
                              {prefs.patti && (
                                <div className="bg-gray-50 p-2 rounded border border-gray-150">
                                  <span className="text-[9px] text-gray-400 uppercase block font-semibold">Patti:</span>
                                  <span className="font-bold text-gray-900">{prefs.patti}</span>
                                </div>
                              )}
                              {prefs.stitchingStyle && (
                                <div className="bg-gray-50 p-2 rounded border border-gray-150">
                                  <span className="text-[9px] text-gray-400 uppercase block font-semibold">Stitching Style:</span>
                                  <span className="font-bold text-gray-900">{prefs.stitchingStyle}</span>
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            {suit.staticTags && suit.staticTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {suit.staticTags.map((tag, tIdx) => (
                                  <span key={tIdx} className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                    ✓ {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Custom Tailor Instructions */}
                          {suit.customDesign && (
                            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-right" dir="rtl">
                              <span className="block text-[9px] font-bold text-amber-900 uppercase tracking-wider mb-1 text-left" dir="ltr">
                                Special Tailor Instructions (خصوصی ہدایات):
                              </span>
                              <p className="text-xs sm:text-sm font-black text-gray-900 leading-relaxed font-sans">{suit.customDesign}</p>
                            </div>
                          )}

                          {/* Rework Note if present */}
                          {isRework && suit.stitching?.reworkNotes && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-900">
                              <strong className="block text-[10px] uppercase font-black text-red-700 flex items-center gap-1">
                                <FiAlertTriangle /> Alteration / Rework Reason:
                              </strong>
                              <p className="mt-1 font-semibold">{suit.stitching.reworkNotes}</p>
                            </div>
                          )}

                          {/* QC APPROVAL / REWORK ACTIONS (PROMINENT BANNER) */}
                          {isUnderInspection && (
                            <div className="bg-amber-100 border border-amber-300 rounded-lg p-3.5 space-y-2.5">
                              <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                                <FiClock className="text-amber-800 text-base" />
                                <span>Karigar has completed this suit and submitted for QC Inspection!</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleApprove(suit._id)}
                                  disabled={isApproving}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-xs py-2 px-3 rounded transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <FiCheck /> Approve & Credit Wage (+ Rs {activeWorkerObj?.perSuitWage || 600})
                                </button>
                                <button
                                  onClick={() => handleOpenReworkModal(suit)}
                                  disabled={isRejecting}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2 px-3 rounded transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <FiAlertTriangle /> Send for Rework
                                </button>
                              </div>
                            </div>
                          )}

                          {/* WORKER / KARIGAR ASSIGNMENT CONTROLS */}
                          <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-lg space-y-2.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                <FiUserCheck className="text-[#DFAC43]" /> Assign Stitcher / Karigar (کاریگر مقرر کریں)
                              </label>
                              <span className="text-[10px] font-bold text-gray-500">
                                Current: {suit.stitching?.isSelf ? (
                                  <span className="text-purple-700 font-black">Owner / Self Stitched</span>
                                ) : activeWorkerObj ? (
                                  <span className="text-blue-700 font-black">{activeWorkerObj.name} (Rs {activeWorkerObj.perSuitWage})</span>
                                ) : (
                                  <span className="text-amber-700 font-black">Unassigned</span>
                                )}
                              </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                              <select
                                value={draftValue}
                                disabled={isStitched || isAssigningStage}
                                onChange={(e) => handleWorkerDraftChange(suitKey, e.target.value)}
                                className="flex-1 border-2 border-gray-200 focus:border-black rounded-lg p-2 outline-none text-xs font-bold bg-white disabled:bg-gray-100 cursor-pointer"
                              >
                                <option value="">-- Unassigned (Pending) --</option>
                                <option value="self">⭐ Owner / Self (In-House Stitched)</option>
                                <optgroup label="Registered Karigars">
                                  {workers.filter(w => w.isActive).map(w => (
                                    <option key={w._id} value={w._id}>{w.name} - Wage: Rs {w.perSuitWage}</option>
                                  ))}
                                </optgroup>
                              </select>

                              {/* Dedicated Assign Worker Button */}
                              <button
                                type="button"
                                onClick={() => handleAssignWorker(suit._id)}
                                disabled={isStitched || isAssigningStage}
                                className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition shadow-sm shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                title="Click to assign or re-assign worker"
                              >
                                <FiUserCheck /> Assign Karigar
                              </button>

                              {/* Direct Admin Pass Button */}
                              {!isStitched && (
                                <button
                                  onClick={() => handleApprove(suit._id)}
                                  disabled={isApproving}
                                  className="bg-green-700 hover:bg-green-800 text-white font-black px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider transition shadow-sm shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                                  title="Directly mark suit as QC Passed"
                                >
                                  <FiScissors /> Pass & Stitched
                                </button>
                              )}
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* FULL BODY MEASUREMENTS (مکمل ناپ کا چارٹ) */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => toggleNaap(suitKey)}
                          className="w-full bg-gray-100/80 hover:bg-gray-200/80 px-4 py-2.5 flex justify-between items-center transition cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2">
                            <FiScissors className="text-[#DFAC43]" />
                            <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                              Full Body Measurements (ناپ کا چارٹ)
                            </span>
                            <span className="text-[10px] bg-white border border-gray-300 text-gray-700 px-2 py-0.5 rounded font-bold">
                              {measurements.length > 0 ? `${measurements.length} Profile(s)` : 'No Naap Saved'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                            <span>{isNaapOpen ? 'Hide' : 'View'} Naap</span>
                            {isNaapOpen ? <FiChevronUp /> : <FiChevronDown />}
                          </div>
                        </button>

                        {isNaapOpen && (
                          <div className="p-4 bg-gray-50/40 space-y-3 text-xs border-t border-gray-200">
                            {(!measurements || measurements.length === 0) ? (
                              <p className="text-xs text-gray-400 italic py-2 text-center">Is wearer ka koi size/measurement save nahi hai.</p>
                            ) : (
                              <div className="space-y-3">
                                {measurements.map((meas, mIdx) => {
                                  const dataObj = meas.data instanceof Map ? Object.fromEntries(meas.data) : (meas.data || {});
                                  const keys = Object.keys(dataObj);
                                  return (
                                    <div key={mIdx} className="space-y-1.5">
                                      {meas.category && (
                                        <span className="inline-block bg-[#0F172A] text-[#DFAC43] text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                                          {meas.category}
                                        </span>
                                      )}
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                        {keys.map((key) => (
                                          <div key={key} className="bg-white border border-gray-200 p-2 rounded-lg text-center shadow-2xs">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase block truncate">{key}</span>
                                            <span className="text-sm sm:text-base font-black text-gray-900 font-sans">{dataObj[key] || '-'}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 bg-gray-50 border-2 border-dashed border-gray-150 rounded-xl">
                <p className="text-sm text-gray-400 font-bold">No suits added to this order.</p>
              </div>
            )}
          </div>

          {/* Alterations if any */}
          {order.alterations && order.alterations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
                Alterations Details
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2">
                {order.alterations.map((alt, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs sm:text-sm py-1.5 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{alt.description || 'Alteration'}</span>
                      {alt.wearer && (
                        <span className="text-[10px] text-gray-400 font-semibold mt-0.5">For Wearer ID: {alt.wearer}</span>
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
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          {order.orderStatus !== 'Delivered' && onOpenDelivery && (
            <button
              onClick={() => {
                closeModal();
                onOpenDelivery(order);
              }}
              className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] px-5 py-2.5 rounded-lg text-xs font-black transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <FiCheckCircle /> Deliver & Settle Payment
            </button>
          )}
          <button 
            onClick={closeModal} 
            className="bg-black hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition shadow cursor-pointer"
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
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-5 py-2 rounded-lg transition shadow cursor-pointer"
              >
                Submit Rework Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
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
      paymentMethod
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
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-scale-up">
          
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
            <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-2.5 shadow-2xs">
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
                  Amount Receiving at Handover (وصولی رقم):
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
                  Payment Method (ادائیگی کا طریقہ):
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

              {/* Dynamic Khata Feedback Alert */}
              <div className={`p-3.5 rounded-lg border text-xs font-bold ${
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

      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        
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
                  src={logo} 
                  alt="Balouch Tailors" 
                  className={paperSize === '56mm' ? 'h-9 w-auto object-contain' : paperSize === '80mm' ? 'h-11 w-auto object-contain' : 'h-14 w-auto object-contain'} 
                />
              </div>

              <h1 className="text-base sm:text-lg font-black tracking-wider uppercase font-serif">
                BALOUCH TAILORS
              </h1>
              
              <div>
                <span className="inline-block bg-gray-100 text-gray-800 text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Gents Shalwar Qameez Specialist
                </span>
              </div>

              <p className="text-[9px] sm:text-[10px] font-bold text-gray-900">
                Proprietor: <span className="font-black">Zubair Balouch</span> | Ph: <span className="font-black">0313-4389192, 0306-7379919</span>
              </p>

              <p className="text-[8px] sm:text-[9px] font-medium text-gray-600">
                Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan
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
                <span className="font-bold">{order.customer?.phone || '-'}</span>
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
              <p className="text-[10px] font-black text-gray-800" dir="rtl">
                گاہک نے سوٹ مکمل تسلی اور فٹنگ چیک کر کے وصول پایا۔
              </p>
              <p className="text-[9px] text-gray-500 italic">
                Suit checked & received in good order. Thank you for choosing Balouch Tailors!
              </p>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-4 text-[9px] font-bold text-gray-700">
                <div className="text-center">
                  <div className="w-20 border-t border-black mb-0.5"></div>
                  <span>Customer Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-20 border-t border-black mb-0.5"></div>
                  <span>Balouch Tailors</span>
                </div>
              </div>

              {/* Shop & Proprietor Footer Stamp */}
              <div className="pt-2 border-t-2 border-black text-center space-y-0.5 text-black">
                <p className="font-black text-[9px] sm:text-[10px] uppercase tracking-wider">
                  Proprietor: Zubair Balouch
                </p>
                <p className="font-black text-[9px] sm:text-[10px] font-sans">
                  📞 0313-4389192 | 0306-7379919
                </p>
                <p className="text-[7px] sm:text-[8px] text-gray-600">
                  Hazori Bagh Road, Street 1, Muhallah Muhammadi, Multan
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

export default Allorders;