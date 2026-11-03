import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiShoppingBag, FiCalendar, FiPrinter } from 'react-icons/fi';

// ====================================================================
// SUB-COMPONENT: ORDERS TAB
// ====================================================================
const CustomerOrdersTab = ({ orders = [], customer, newOrderUrl }) => {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'all') return true;
    return (o.orderStatus || '').toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="bg-white border border-gray-200 rounded p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">

      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-gray-900">Orders & Stitching History</h3>
          <p className="text-xs text-gray-500 mt-0.5">Complete record of suits, invoices, and delivery statuses.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 sm:flex-none border border-gray-200 focus:border-black rounded px-3 py-2 text-xs font-bold outline-none bg-white"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="pending">Pending</option>
            <option value="cutting">In Cutting</option>
            <option value="stitching">In Stitching</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>

          <Link
            to={newOrderUrl}
            className="flex-1 sm:flex-none justify-center px-4 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black text-xs rounded transition flex items-center gap-1.5 shadow whitespace-nowrap"
          >
            <FiPlus />  New Order
          </Link>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4">
          <FiShoppingBag className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-bold text-sm">No orders matching selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* 1. DESKTOP VIEW (TABLE) */}
          <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0F172A] text-[#DFAC43] font-black uppercase text-[10px]">
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Booking Date</th>
                  <th className="p-3.5">Delivery Date</th>
                  <th className="p-3.5">Suits & Fabric</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Total Bill</th>
                  <th className="p-3.5 text-right">Advance</th>
                  <th className="p-3.5 text-right">Balance</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredOrders.map((order) => {
                  const bal = Number(order.balanceAmount) || 0;
                  return (
                    <tr key={order._id} className="hover:bg-gray-50/80 transition">
                      <td className="p-3.5 font-black text-gray-900">
                        <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md font-sans whitespace-nowrap">
                          #BT-{order.orderNumber}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-500 whitespace-nowrap">
                        {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-gray-800 font-bold whitespace-nowrap">
                        {order.deliveryDate ? (
                          <span className="flex items-center gap-1 text-gray-900">
                            <FiCalendar className="text-[#DFAC43]" /> {new Date(order.deliveryDate).toLocaleDateString()}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3.5 text-gray-600 max-w-xs truncate">
                        {order.suits?.length || 0} suits
                        {order.suits?.[0]?.fabricDetails && ` (${order.suits[0].fabricDetails})`}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'Ready' ? 'bg-amber-100 text-amber-900' :
                          'bg-blue-50 text-blue-800'
                        }`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-black text-gray-900 font-sans whitespace-nowrap">
                        Rs {order.totalAmount?.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-bold text-green-600 font-sans whitespace-nowrap">
                        Rs {(order.advancePaid || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-black font-sans whitespace-nowrap">
                        <span className={bal > 0 ? 'text-red-600' : 'text-gray-600'}>
                          Rs {bal.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/print/${order._id}`}
                          className="inline-flex items-center gap-1 bg-gray-100 hover:bg-[#0F172A] hover:text-[#DFAC43] text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-gray-200"
                          title="Print / View Invoice"
                        >
                          <FiPrinter /> Print
                        </Link>
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
              const bal = Number(order.balanceAmount) || 0;
              return (
                <div 
                  key={order._id} 
                  className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3.5 space-y-3 transition hover:border-gray-300"
                >
                  {/* Order # & Status */}
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <span className="font-black text-gray-900 text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md font-sans">
                      #BT-{order.orderNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.orderStatus === 'Ready' ? 'bg-amber-100 text-amber-900' :
                      'bg-blue-50 text-blue-800'
                    }`}>
                      {order.orderStatus || 'Pending'}
                    </span>
                  </div>

                  {/* Booking & Delivery Dates */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Booked</span>
                      <span className="font-semibold text-gray-700 mt-0.5 block">
                        {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Delivery</span>
                      <span className="font-bold text-gray-900 mt-0.5 flex items-center gap-1">
                        <FiCalendar className="text-[#DFAC43] text-xs shrink-0" />
                        {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Suits & Fabric */}
                  <div className="text-xs bg-gray-50 p-2 rounded-lg border border-gray-150">
                    <span className="font-bold text-gray-800">{order.suits?.length || 0} Suits</span>
                    {order.suits?.[0]?.fabricDetails && (
                      <span className="text-gray-500 ml-1">({order.suits[0].fabricDetails})</span>
                    )}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-3 gap-1 text-center bg-gray-50/70 p-2 rounded-lg border border-gray-150 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Total</span>
                      <span className="font-black text-gray-900 text-xs font-sans">Rs {order.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Advance</span>
                      <span className="font-bold text-green-600 text-xs font-sans">Rs {(order.advancePaid || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Balance</span>
                      <span className={`font-black text-xs font-sans ${bal > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                        Rs {bal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/admin/print/${order._id}`}
                    className="w-full py-2 bg-gray-100 hover:bg-[#0F172A] hover:text-[#DFAC43] text-gray-800 font-bold rounded-lg transition text-xs flex items-center justify-center gap-1.5 border border-gray-200 shadow-2xs"
                  >
                    <FiPrinter className="text-xs" />
                    <span>Print / View Invoice</span>
                  </Link>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};

export default CustomerOrdersTab;
