import React, { useState } from 'react';
import { useGetOrders, useUpdateOrder, useDeleteOrder } from '../hooks/useOrder';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPrinter, FiTrash2, FiBox, FiFilter, FiEye, FiX, FiCalendar, FiCreditCard, FiUser, FiScissors } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useGetWorkers, useAssignWorker, useMarkSuitStitched } from '../hooks/useWorkers';

const Allorders = () => {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetOrders();
  const { mutate: updateOrder } = useUpdateOrder();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingOrder, setViewingOrder] = useState(null);

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
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage tailoring jobs, statuses, and cash flow.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border-2 border-gray-100 focus:border-black rounded-lg outline-none font-bold text-sm bg-white appearance-none"
            >
              <option value="All">All Statuses</option>
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
                <th className="p-4 text-center">Total Suits</th>
                <th className="p-4">Financials</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/80 transition-colors group">
                  
                  {/* Order ID & Dates */}
                  <td className="p-4">
                    <p className="font-black text-black text-sm uppercase">#BT-${order.orderNumber}</p>
                    <p className="text-[11px] text-gray-500 font-bold mt-1">Booked: {new Date(order.bookingDate).toLocaleDateString()}</p>
                    <p className="text-[11px] text-red-500 font-black">Due: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                  </td>

                  {/* Customer Info */}
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{order.customer?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 font-semibold">{order.customer?.phone || '-'}</p>
                  </td>

                  {/* Suit Count */}
                  <td className="p-4 text-center">
                    <span className="bg-gray-100 text-black font-black px-3 py-1 rounded-full text-xs">
                      {order.suits?.length || 0}
                    </span>
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
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer appearance-none text-center ${getStatusColor(order.orderStatus)}`}
                    >
                      {statusOptions.map(opt => <option key={opt} value={opt} className="bg-white text-black">{opt}</option>)}
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setViewingOrder(order)}
                        className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-lg transition shadow-sm"
                        title="View Details"
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
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
// COMPONENT: ORDER DETAILS MODAL
// -------------------------------------------------------------
const OrderDetailsModal = ({ orderId, closeModal }) => {
  const { data: orders = [] } = useGetOrders();
  const { data: workers = [] } = useGetWorkers();
  const { mutate: assignWorker } = useAssignWorker();
  const { mutate: markSuitStitched } = useMarkSuitStitched();

  const order = orders.find(o => o._id === orderId);
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-black flex items-center gap-2">
              <FiBox className="text-[#D4AF37]" /> Order Details: #BT-{order.orderNumber}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Specifications and Stitching Instructions</p>
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
            
            {/* Customer Information */}
            <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <FiUser className="text-[#D4AF37]" /> Customer Info
              </h3>
              <div className="space-y-2">
                <p className="font-bold text-gray-900 text-base">{order.customer?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-600 font-semibold">{order.customer?.phone || '-'}</p>
                {order.customer?.address && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed border-t border-gray-50 pt-2">{order.customer.address}</p>
                )}
              </div>
            </div>

            {/* Timings */}
            <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <FiCalendar className="text-[#D4AF37]" /> Important Dates
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-semibold">Booking Date:</span>
                  <span className="font-bold text-gray-900">{new Date(order.bookingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-500 font-semibold">Delivery Date:</span>
                  <span className="font-black text-red-600">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-black text-white rounded-xl p-5 shadow-sm border border-gray-900">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-3 flex items-center gap-1">
                <FiCreditCard /> Payment Details
              </h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Amount:</span>
                  <span className="font-bold text-[#D4AF37]">Rs {order.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Advance Paid:</span>
                  <span className="font-bold text-green-400">Rs {order.advancePaid}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-gray-800 font-black">
                  <span>Balance Due:</span>
                  <span className={order.balanceAmount > 0 ? 'text-red-400' : 'text-green-400'}>
                    Rs {order.balanceAmount}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Suits Listing */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-2">
              <FiScissors className="text-[#D4AF37]" /> Suits List ({order.suits?.length || 0})
            </h3>
            
            {order.suits && order.suits.length > 0 ? (
              order.suits.map((suit, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 hover:border-black/20 transition-all">
                  
                  {/* Suit Fabric Image Column (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[220px]">
                    <span className="text-xs font-black text-black bg-[#D4AF37] px-3 py-1 rounded-full mb-3 shadow-sm">
                      SUIT #{index + 1}
                    </span>
                    
                    {suit.fabricImage?.url ? (
                      <a 
                        href={suit.fabricImage.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full flex justify-center group/img relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        <img 
                          src={suit.fabricImage.url} 
                          alt={`Suit ${index + 1} Fabric`} 
                          className="max-h-[160px] object-contain hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition duration-300 flex items-center justify-center text-white text-[11px] font-bold">
                          Click to View Full Size
                        </div>
                      </a>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                          <FiBox className="text-gray-400 text-lg" />
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase">No Fabric Image</p>
                      </div>
                    )}
                  </div>

                  {/* Suit Stitching Specs Column (8 cols) */}
                  <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Details */}
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
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Stitching Status</span>
                        <span className={`inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${
                          suit.stitchingStatus === 'Stitched' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : suit.stitchingStatus === 'Assigned' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {suit.stitchingStatus || 'Pending'}
                        </span>
                      </div>

                    </div>

                    {/* Styling Tags */}
                    {suit.staticTags && suit.staticTags.length > 0 && (
                      <div className="pt-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Styling Tags</span>
                        <div className="flex flex-wrap gap-1.5">
                          {suit.staticTags.map(tag => (
                            <span key={tag} className="bg-gray-100 border border-gray-200 text-black px-2.5 py-1 rounded-full text-xs font-bold font-sans">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stitching Custom Instructions */}
                    {suit.customDesign ? (
                      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 pt-3 mt-2">
                        <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1.5">Custom Styling Instructions</span>
                        <p className="text-base font-bold text-gray-850 leading-relaxed text-right font-sans" dir="rtl">
                          {suit.customDesign}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center text-xs font-bold text-gray-400">
                        No custom design instructions provided.
                      </div>
                    )}

                    {/* Karigar (Worker) Assignment Selector */}
                    <div className="bg-gray-50 p-4 border border-gray-150 rounded-xl mt-3">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Assign Stitching Karigar (Worker)
                      </label>
                      <select
                        value={suit.assignedWorker?._id || suit.assignedWorker || ''}
                        disabled={suit.stitchingStatus === 'Stitched'}
                        onChange={(e) => assignWorker({
                          orderId: order._id,
                          suitId: suit._id,
                          workerId: e.target.value
                        })}
                        className="w-full border border-gray-300 focus:border-black rounded-lg p-2.5 outline-none text-xs font-bold bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">-- No Worker Assigned (Pending) --</option>
                        {workers.filter(w => w.isActive).map(w => (
                          <option key={w._id} value={w._id}>{w.name} - Wage: Rs {w.perSuitWage}</option>
                        ))}
                      </select>

                      {suit.assignedWorker && suit.stitchingStatus !== 'Stitched' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Kya aap waqai is suit ko stitched mark karna chahte hain? Isse karigar ke ledger mein stitching wages add ho jayengi.')) {
                              markSuitStitched({ orderId: order._id, suitId: suit._id });
                            }
                          }}
                          className="w-full mt-2 bg-black hover:bg-[#D4AF37] text-white hover:text-black font-black py-2 rounded-lg text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1"
                        >
                          <FiScissors className="text-sm" /> Mark as Stitched
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              ))
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
    </div>
  );
};

export default Allorders;