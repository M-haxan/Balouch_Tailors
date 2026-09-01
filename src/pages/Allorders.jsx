import React, { useState } from 'react';
import { useGetOrders, useUpdateOrder, useDeleteOrder } from '../hooks/useOrder';
import { useNavigate } from 'react-router-dom';
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
  FiCheck
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

  // Count suits waiting for inspection across all orders
  let totalPendingQC = 0;
  orders.forEach(ord => {
    ord.suits?.forEach(s => {
      if (s.stitchingStatus === 'Submitted for Inspection') totalPendingQC++;
    });
  });

  // Order Status Options
  const statusOptions = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const searchStr = searchTerm.toLowerCase();
    
    const customerName = order.customer?.name || '';
    const customerPhone = order.customer?.phone ? order.customer.phone.toString() : '';
    const orderNum = order.orderNumber ? order.orderNumber.toString() : '';

    const matchesSearch = 
      customerName.toLowerCase().includes(searchStr) || 
      customerPhone.includes(searchStr) ||
      orderNum.includes(searchStr);
    
    if (statusFilter === 'PendingQC') {
      const hasPendingQC = order.suits?.some(s => s.stitchingStatus === 'Submitted for Inspection');
      return matchesSearch && hasPendingQC;
    }

    const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleStatusChange = (id, newStatus) => {
    updateOrder({ id, data: { orderStatus: newStatus } });
  };

  const handleDelete = (id) => {
    if (window.confirm('Kya aap waqai is order ko hamesha ke liye delete karna chahte hain?')) {
      deleteOrder(id);
    }
  };

  // Badge Color Logic
  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
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
              className="pl-9 pr-4 py-2 border-2 border-gray-100 focus:border-black rounded-lg outline-none font-bold text-sm bg-white appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="PendingQC">⚠️ Waiting QC Approval ({totalPendingQC})</option>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID, Name or Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 focus:border-black rounded-lg outline-none text-sm font-medium transition"
            />
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
              <tr className="bg-black text-[#D4AF37] text-xs uppercase tracking-widest">
                <th className="p-4 rounded-tl-lg">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4 text-center">Suits & QC Status</th>
                <th className="p-4">Financials</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 rounded-tr-lg text-right">Actions</th>
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
                      <p className="text-[11px] text-red-500 font-black">Due: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                    </td>

                    {/* Customer Info */}
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{order.customer?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 font-semibold">{order.customer?.phone || '-'}</p>
                    </td>

                    {/* Suit Count & QC Badges */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-gray-100 text-black font-black px-3 py-0.5 rounded-full text-xs">
                          {order.suits?.length || 0} Suits
                        </span>
                        {hasPendingQC && (
                          <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1 animate-pulse">
                            <FiClock /> Needs QC Pass
                          </span>
                        )}
                        {hasRework && (
                          <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1">
                            <FiAlertTriangle /> In Rework
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cash Flow */}
                    <td className="p-4">
                      <p className="text-sm font-black text-black">Rs {order.totalAmount}</p>
                      {order.balanceAmount > 0 ? (
                        <p className="text-[11px] font-bold text-red-500">Balance: Rs {order.balanceAmount}</p>
                      ) : (
                        <p className="text-[11px] font-bold text-green-600">Fully Paid</p>
                      )}
                    </td>

                    {/* Live Status Updater Dropdown */}
                    <td className="p-4 text-center">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer text-center ${getStatusColor(order.orderStatus)}`}
                      >
                        {statusOptions.map(opt => <option key={opt} value={opt} className="bg-white text-black">{opt}</option>)}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setViewingOrder(order)}
                          className={`p-2 rounded-lg transition shadow-sm ${
                            hasPendingQC 
                              ? 'bg-amber-400 text-black font-bold hover:bg-amber-500 ring-2 ring-amber-400' 
                              : 'bg-green-50 hover:bg-green-100 text-green-600'
                          }`}
                          title="View Details / QC Inspect"
                        >
                          <FiEye />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/print/${order._id}`)}
                          className="bg-black hover:bg-gray-800 text-[#D4AF37] p-2 rounded-lg transition shadow-sm"
                          title="Print Invoice"
                        >
                          <FiPrinter />
                        </button>
                        <button 
                          onClick={() => handleDelete(order._id)}
                          disabled={isDeleting}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition shadow-sm"
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
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT: ORDER DETAILS & QC INSPECTION MODAL
// -------------------------------------------------------------
const OrderDetailsModal = ({ orderId, closeModal }) => {
  const { data: orders = [] } = useGetOrders();
  const { data: workers = [] } = useGetWorkers();
  const { mutate: assignWorker } = useAssignWorker();
  const { mutate: assignStage } = useAssignSuitStage();
  const { mutate: approveSuit, isPending: isApproving } = useApproveSuit();
  const { mutate: rejectSuit, isPending: isRejecting } = useRejectSuit();

  const [reworkModalSuit, setReworkModalSuit] = useState(null);
  const [reworkNotes, setReworkNotes] = useState('');

  const order = orders.find(o => o._id === orderId);
  if (!order) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-black flex items-center gap-2">
              <FiBox className="text-[#D4AF37]" /> Order Details & QC: #BT-{order.orderNumber}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Stage assignments, Karigar QC Approvals, and Specifications</p>
          </div>
          <button 
            onClick={closeModal} 
            className="p-2 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-200"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-gray-50/30">
          
          {/* Top Info Grid: Customer, Dates, Financials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Customer Details Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiUser /> Customer Information
              </span>
              <p className="text-base font-bold text-gray-900">{order.customer?.name || 'Walk-in Customer'}</p>
              <p className="text-xs text-gray-500 font-semibold">Phone: {order.customer?.phone || '-'}</p>
              {order.customer?.address && (
                <p className="text-xs text-gray-400 mt-1">{order.customer.address}</p>
              )}
            </div>

            {/* Dates Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiCalendar /> Important Dates
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
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiCreditCard /> Financial Summary
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

          {/* Suits List with Multi-Stage & QC Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
              Suits in this Order ({order.suits?.length || 0})
            </h3>
            
            {order.suits && order.suits.length > 0 ? (
              order.suits.map((suit, index) => {
                const isUnderInspection = suit.stitchingStatus === 'Submitted for Inspection';
                const isRework = suit.stitchingStatus === 'Rework Required';
                const isStitched = suit.stitchingStatus === 'Stitched';

                return (
                  <div 
                    key={suit._id || index} 
                    className={`bg-white border rounded-xl p-5 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 ${
                      isUnderInspection ? 'border-amber-400 ring-2 ring-amber-300/50 bg-amber-50/20' : 
                      isRework ? 'border-red-300 bg-red-50/20' : 
                      'border-gray-200'
                    }`}
                  >
                    
                    {/* Fabric Image Preview */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-150 p-3 min-h-[160px] relative">
                      {suit.fabricImage?.url ? (
                        <img 
                          src={suit.fabricImage.url} 
                          alt="Suit Fabric" 
                          className="max-h-40 w-full object-contain rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <FiBox className="text-3xl mx-auto mb-1 text-gray-300" />
                          <span className="text-xs font-bold uppercase">No Fabric Image</span>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-black text-[#D4AF37] px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        Suit #{index + 1}
                      </span>
                    </div>

                    {/* Suit Details & QC Controls */}
                    <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Fabric & Color</span>
                          <p className="font-bold text-gray-900 text-sm">{suit.fabricDetails}</p>
                        </div>
                        
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Design Volume Number</span>
                          <span className="inline-block bg-black text-[#D4AF37] px-2 py-0.5 rounded text-xs font-sans font-bold tracking-wider">
                            VOL: {suit.volumeNo}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Wearer (Kiske liye hai)</span>
                          <p className="font-bold text-gray-900 text-sm">
                            {suit.wearer?.name ? (
                              <span className="text-blue-600 font-semibold">{suit.wearer.name}</span>
                            ) : (
                              <span className="text-gray-500">Main Customer</span>
                            )}
                          </p>
                        </div>

                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Stitching Price</span>
                          <p className="font-black text-black text-sm">Rs {suit.price}</p>
                        </div>

                        {/* Stitching Status Badge */}
                        <div className="sm:col-span-2">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Stitching & QC Status</span>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`inline-block text-[11px] font-black px-3 py-1 rounded-full border uppercase ${
                              isStitched ? 'bg-green-100 text-green-800 border-green-200' :
                              isUnderInspection ? 'bg-amber-400 text-black border-amber-500 animate-pulse' :
                              isRework ? 'bg-red-100 text-red-800 border-red-200' :
                              suit.stitchingStatus === 'Assigned' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}>
                              {suit.stitchingStatus || 'Pending'}
                            </span>
                            {suit.stitching?.isSelf && (
                              <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                                👑 Stitched by Owner (Self)
                              </span>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Rework Note if present */}
                      {isRework && suit.stitching?.reworkNotes && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900">
                          <strong className="block text-[10px] uppercase font-black text-red-700">Current Alteration Reason:</strong>
                          {suit.stitching.reworkNotes}
                        </div>
                      )}

                      {/* Custom Styling Instructions */}
                      {suit.customDesign && (
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-right" dir="rtl">
                          <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1 text-left" dir="ltr">Custom Instructions</span>
                          <p className="text-xs font-bold text-gray-800 leading-relaxed font-sans">{suit.customDesign}</p>
                        </div>
                      )}

                      {/* QC APPROVAL / REWORK ACTIONS (PROMINENT BANNER) */}
                      {isUnderInspection && (
                        <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                            <FiClock className="text-amber-800 text-base" />
                            <span>Karigar has finished this suit and submitted for QC Inspection!</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(suit._id)}
                              disabled={isApproving}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-xs py-2.5 px-4 rounded-xl transition shadow flex items-center justify-center gap-1.5"
                            >
                              <FiCheck /> Approve & Credit Wage (+ Rs {suit.assignedWorker?.perSuitWage || 600})
                            </button>
                            <button
                              onClick={() => handleOpenReworkModal(suit)}
                              disabled={isRejecting}
                              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2.5 px-4 rounded-xl transition shadow flex items-center justify-center gap-1.5"
                            >
                              <FiAlertTriangle /> Send for Rework
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Assignment Section (Worker OR Owner/Self) */}
                      <div className="bg-gray-50 p-4 border border-gray-150 rounded-xl space-y-3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Assign Stitcher (Worker vs. Owner Self-Stitch)
                        </label>
                        
                        <div className="flex gap-2">
                          <select
                            value={suit.stitching?.isSelf ? 'self' : (suit.assignedWorker?._id || suit.assignedWorker || '')}
                            disabled={isStitched}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'self') {
                                assignStage({
                                  orderId: order._id,
                                  suitId: suit._id,
                                  data: { stage: 'stitching', isSelf: true }
                                });
                              } else {
                                assignStage({
                                  orderId: order._id,
                                  suitId: suit._id,
                                  data: { stage: 'stitching', isSelf: false, workerId: val }
                                });
                              }
                            }}
                            className="flex-1 border border-gray-300 focus:border-black rounded-lg p-2.5 outline-none text-xs font-bold bg-white disabled:bg-gray-100"
                          >
                            <option value="">-- Unassigned (Pending) --</option>
                            <option value="self">👑 Owner / Self (In-House Stitched)</option>
                            <optgroup label="Registered Karigars">
                              {workers.filter(w => w.isActive).map(w => (
                                <option key={w._id} value={w._id}>{w.name} - Wage: Rs {w.perSuitWage}</option>
                              ))}
                            </optgroup>
                          </select>

                          {/* Direct Quick Approve for Admin */}
                          {!isStitched && (
                            <button
                              onClick={() => handleApprove(suit._id)}
                              disabled={isApproving}
                              className="bg-black hover:bg-[#D4AF37] text-white hover:text-black font-black px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition shadow-sm shrink-0 flex items-center gap-1"
                              title="Directly mark suit as QC Passed"
                            >
                              <FiScissors /> Pass & Stitched
                            </button>
                          )}
                        </div>
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
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
                Alterations Details
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                {order.alterations.map((alt, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-b-0 last:pb-0">
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
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            onClick={closeModal} 
            className="bg-black hover:bg-gray-900 text-[#D4AF37] px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-md"
          >
            Close Details
          </button>
        </div>

      </div>

      {/* REWORK NOTES POPUP MODAL */}
      {reworkModalSuit && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-red-200 animate-scale-up">
            <div className="flex items-center gap-2 text-red-600">
              <FiAlertTriangle className="text-2xl" />
              <h3 className="text-base font-black uppercase tracking-wider">Send Suit for Rework / Alteration</h3>
            </div>
            
            <p className="text-xs text-gray-500 font-medium">
              Suit: <strong>{reworkModalSuit.fabricDetails}</strong> (Wearer: {reworkModalSuit.wearer?.name || 'Customer'})
            </p>

            <div className="space-y-1">
              <label className="block text-[11px] font-black text-gray-700 uppercase">
                Alteration / Defect Reason (الٹریشن کی تفصیل):
              </label>
              <textarea
                rows={3}
                value={reworkNotes}
                onChange={(e) => setReworkNotes(e.target.value)}
                placeholder="Maslan: Gala theek nahi hai, lambai 1 inch kam karein ya bazoo loose karein..."
                className="w-full border-2 border-gray-200 focus:border-red-500 rounded-xl p-3 text-xs outline-none font-medium text-gray-800"
              />
            </div>

            <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded-lg font-bold">
              ⚠️ Note: Karigar ke ledger mein wage hold rahegi jab tak alteration mukammal ho kar dubara pass na ho jaye.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReworkModalSuit(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRework}
                disabled={isRejecting}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-5 py-2 rounded-xl transition shadow"
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

export default Allorders;