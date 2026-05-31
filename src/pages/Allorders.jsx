import React, { useState } from 'react';
import { useGetOrders, useUpdateOrder, useDeleteOrder } from '../hooks/useOrder';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPrinter, FiTrash2, FiBox, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Allorders = () => {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetOrders();
  const { mutate: updateOrder } = useUpdateOrder();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Order Status Options
  const statusOptions = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  // Filter Logic
   const filteredOrders = orders.filter(order => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      order.customer?.name.toLowerCase().includes(searchStr) || 
      order.customer?.phone.includes(searchStr) ||
      (order.orderNumber && order.orderNumber.toString().includes(searchStr)); // Number search
    
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
    </div>
  );
};

export default Allorders;