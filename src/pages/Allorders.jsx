import React, { useState } from 'react';
import { useGetOrders, useUpdateOrder, useDeleteOrder, useDeliverOrder } from '../hooks/useOrder';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { useNavigate } from 'react-router-dom';
import defaultLogo from '../assets/BT_Logo.png';
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
  FiStar
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
              className="pl-9 pr-4 py-2 border-2 border-gray-100 focus:border-black rounded outline-none font-bold text-sm bg-white appearance-none cursor-pointer"
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
  // State for printing individual suit job card / parchi
  const [printJobSuit, setPrintJobSuit] = useState(null);

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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 font-sans">
        <div className="bg-white rounded shadow-2xl w-full max-w-5xl relative flex flex-col max-h-[94vh] overflow-hidden ">
          
          {/* Header */}
          <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-100 bg-[#0F172A] text-white">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-6 bg-[#DFAC43] rounded"></span>
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
                  Job Order Sheet, Full Naap Measurements, Styling Specs & Karigar Assignment
                </p>
              </div>
            </div>
            <button 
              onClick={closeModal} 
              className="p-1.5 text-gray-400 hover:text-white transition rounded hover:bg-gray-800 cursor-pointer"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-3 sm:p-6 space-y-6 flex-1 bg-gray-100/70">
            
            {/* Top 3 Info Cards: Customer, Timeline, Financials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Customer Details Card */}
              <div className="bg-white p-4 rounded border border-gray-200 shadow-xs space-y-1.5">
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
              <div className="bg-white p-4 rounded border border-gray-200 shadow-xs space-y-1.5">
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
              <div className="bg-white p-4 rounded border border-gray-200 shadow-xs space-y-1.5">
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

            {/* Suits List with Top Karigar Control & Order Form Parchi */}
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between items-center border-b pb-2 gap-2">
                <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <FiScissors className="text-[#DFAC43]" /> Suit Cutting & Stitching Parchi Sheets ({order.suits?.length || 0})
                </h3>
                <span className="text-[11px] text-gray-500 font-medium">
                  Har suit ki alag parchi or naap form niche maujood hai
                </span>
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
                  
                  // Extract only the direct active preferences chosen by customer from all sources
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

                  const prefValues = Array.from(new Set([...prefValuesFromObj, ...rawTags])).filter(Boolean);

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
                      className={`bg-white  rounded overflow-hidden shadow-sm transition ${
                        isUnderInspection ? 'border-amber-400 ring-2 ring-amber-300/60' : 
                        isRework ? 'border-red-300 ring-1 ring-red-200' : 
                        'border-gray-300'
                      }`}
                    >
                      {/* 1. SUIT TOP HEADER & STATUS BAR */}
                      <div className="bg-[#0F172A] text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2">
                        {/* <div className="flex items-center gap-2.5">
                          <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2.5 py-0.5 rounded shadow-xs">
                            SUIT #{index + 1} ({suitIdBadge})
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-gray-200">
                            {suit.serviceType || 'Shalwar Qameez'} - <span className="text-[#DFAC43]">{suit.fabricDetails}</span>
                          </span>
                          {suit.volumeNo && (
                            <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[10px] font-sans font-bold">
                              VOL: {suit.volumeNo}
                            </span>
                          )}
                        </div> */}

                        <div className="flex items-center gap-2">
                          {/* <span className="text-xs font-black text-[#DFAC43]">
                            Stitching: Rs {suit.price}
                          </span> */}
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

                      {/* 2. TOP KARIGAR ASSIGNMENT & WORK CONTROLS PANEL */}
                      <div className="bg-slate-100/90 p-3 sm:p-4 border-b border-gray-200 space-y-2.5">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <label className="text-[11px] font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                            <FiUserCheck className="text-[#DFAC43] text-sm" /> Stitcher / Karigar Assignment:
                          </label>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-gray-600">
                              Current Status: {suit.stitching?.isSelf ? (
                                <span className="text-purple-700 font-black bg-purple-50 px-2.5 py-1 rounded border border-purple-200 inline-flex items-center gap-1">
                                  <FiStar className="text-amber-500" /> Owner / Self Stitched
                                </span>
                              ) : activeWorkerObj ? (
                                <span className="text-blue-700 font-black bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-flex items-center gap-1">
                                  <FiUser className="text-blue-600" /> {activeWorkerObj.name} (Wage: Rs {activeWorkerObj.perSuitWage})
                                </span>
                              ) : (
                                <span className="text-amber-800 font-black bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-flex items-center gap-1">
                                  <FiClock className="text-amber-600" /> Unassigned (Pending)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                          <select
                            value={draftValue}
                            disabled={isStitched || isAssigningStage}
                            onChange={(e) => handleWorkerDraftChange(suitKey, e.target.value)}
                            className="flex-1 w-full border-2 border-gray-300 focus:border-black rounded p-2 outline-none text-xs font-bold bg-white disabled:bg-gray-200 cursor-pointer shadow-2xs"
                          >
                            <option value="">-- Select Karigar (Unassigned) --</option>
                            <option value="self">★ Owner / Self (In-House Stitched)</option>
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
                            className="w-full sm:w-auto bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow-sm shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            <FiUserCheck /> Assign Karigar
                          </button>

                          {/* Direct Admin Pass Button */}
                          {!isStitched && (
                            <button
                              onClick={() => handleApprove(suit._id)}
                              disabled={isApproving}
                              className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-black px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow-sm shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                              title="Directly mark suit as QC Passed & Stitched"
                            >
                              <FiScissors /> Pass & Stitched
                            </button>
                          )}
                        </div>

                        {/* QC APPROVAL / REWORK ACTIONS (IF UNDER INSPECTION) */}
                        {isUnderInspection && (
                          <div className="bg-amber-100 border border-amber-300 rounded p-3 mt-2 space-y-2">
                            <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                              <FiClock className="text-amber-800 text-base" />
                              <span>Karigar has completed stitching and submitted for QC Inspection!</span>
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
                      </div>

                      {/* 3. AUTHENTIC TAILORING ORDER FORM / PARCHI (پرچی) */}
                      <div className="p-4 sm:p-5 bg-white">
                        
                        <div className="border-2  rounded p-4 sm:p-5 bg-linear-to-b from-white to-gray-50/50 shadow-xs space-y-4">
                          
                          {/* PARCHI HEADER BANNER WITH SINGLE PRINT BUTTON */}
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
                                Order #BT-{order.orderNumber} | Suit ID: <strong className="text-black">{suitIdBadge}</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block">Delivery Due:</span>
                                <span className="text-xs sm:text-sm font-black text-red-600">
                                  {new Date(order.deliveryDate).toLocaleDateString()}
                                </span>
                              </div>
                              {/* SINGLE CLEAR PRINT BUTTON PER SUIT */}
                              <button
                                type="button"
                                onClick={() => setPrintJobSuit({ order, suit, suitIndex: index })}
                                className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black px-3.5 py-1.5 rounded text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                                title="Print this Parchi (56mm / 80mm / A4)"
                              >
                                <FiPrinter className="text-sm" /> Print Suit Parchi
                              </button>
                            </div>
                          </div>

                          {/* PARCHI METADATA GRID */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Customer:</span>
                              <span className="font-black text-gray-900">{order.customer?.name || 'Walk-in'}</span>
                              <p className="text-[10px] text-gray-500 font-semibold">{order.customer?.phone || '-'}</p>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Wearer </span>
                              <span className="font-black text-blue-700">{wearer.name || order.customer?.name || 'Customer'}</span>
                              {wearer.relation && <p className="text-[10px] text-gray-500 font-medium">Rel: {wearer.relation}</p>}
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Fabric & Volume:</span>
                              <span className="font-black text-gray-900">{suit.fabricDetails}</span>
                              {suit.volumeNo && <p className="text-[10px] text-gray-500 font-medium">Vol: {suit.volumeNo}</p>}
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Stitching Rate:</span>
                              <span className="font-black text-[#0F172A] text-sm">Rs {suit.price}</span>
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
                                <FiTag className="text-amber-700" /> Add-on Customizations 
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {suit.customizations.map((c, cIdx) => (
                                  <span key={`cust-${cIdx}`} className="bg-[#0F172A] text-[#DFAC43] px-2.5 py-0.5 rounded text-[10px] font-black shadow-2xs">
                                    + {c.name} {c.urduName ? `(${c.urduName})` : ''} {c.price ? `(+Rs ${c.price})` : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* SPECIAL TAILOR INSTRUCTIONS (خصوصی ہدایات) */}
                          {suit.customDesign && (
                            <div className="bg-amber-50/80 border-2 border-amber-300 rounded p-3 space-y-1">
                              <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                                <FiScissors className="text-amber-800" /> Special Tailor Instructions 
                              </span>
                              <p className="text-xs sm:text-sm font-black text-gray-900 leading-relaxed font-sans text-right" dir="rtl">
                                {suit.customDesign}
                              </p>
                            </div>
                          )}

                          {/* REWORK NOTE IF PRESENT */}
                          {isRework && suit.stitching?.reworkNotes && (
                            <div className="bg-red-50 border border-red-300 rounded p-3 text-xs text-red-900">
                              <strong className="block text-[10px] uppercase font-black text-red-700 flex items-center gap-1">
                                <FiAlertTriangle /> Alteration / Rework Reason:
                              </strong>
                              <p className="mt-1 font-bold">{suit.stitching.reworkNotes}</p>
                            </div>
                          )}

                          {/* FULL BODY MEASUREMENTS TABLE (مکمل ناپ کا چارٹ) */}
                          <div className="space-y-2 pt-1">
                            <div className="flex justify-between items-center bg-gray-100 px-3 py-1.5 rounded border border-gray-200">
                              <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                <FiScissors className="text-[#DFAC43]" /> Complete Measurements 
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleNaap(suitKey)}
                                className="text-[11px] font-bold text-gray-600 hover:text-black flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isNaapOpen ? 'Collapse' : 'Expand'}</span>
                                {isNaapOpen ? <FiChevronUp /> : <FiChevronDown />}
                              </button>
                            </div>

                            {isNaapOpen && (
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
                            )}
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
                              * Attach this cutting sheet with fabric bundle for Master / Stitching Karigar.
                            </p>
                          </div>

                        </div>

                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 bg-white border-2 border-dashed border-gray-300 rounded-xl">
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
          <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
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
              className="bg-black hover:bg-gray-900 text-white px-6 py-2.5 rounded text-xs font-bold transition shadow cursor-pointer"
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
                <span className="font-black">{order?.customer?.name || 'Walk-in'} ({order?.customer?.phone || '-'})</span>
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