import React from 'react';
import Pagination from './Pagination';
import { formatPhone } from '../utils/formatters';
import { FiTruck, FiPlus, FiSearch, FiX, FiCheckCircle, FiPhone, FiPrinter } from 'react-icons/fi';

const WorkerDeliveryCounterTab = ({
  canCreateOrder,
  navigate,
  deliverySearchTerm = '',
  setDeliverySearchTerm,
  deliveryPage = 1,
  setDeliveryPage,
  loadingOrders,
  undeliveredOrders = [],
  paginatedDeliveryOrders = [],
  PAGE_SIZE = 10,
  setOrderToDeliver
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search Bar specifically for Delivery */}
      <div className="bg-white p-3 sm:p-4 rounded border border-gray-200 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <FiTruck className="text-[#DFAC43]" /> Ready Suits Delivery & Cash Counter
            </h3>
            <p className="text-xs text-gray-500">Search customer orders to settle remaining payment and generate official Delivery Slip.</p>
          </div>
          {canCreateOrder && (
            <button
              onClick={() => navigate('/worker/orders/create')}
              className="bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] px-3 py-1.5 rounded font-black text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer self-stretch sm:self-auto justify-center"
            >
              <FiPlus /> + Book New Order
            </button>
          )}
        </div>

        <div className="relative pt-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search order by #BT number, customer name or phone..."
            value={deliverySearchTerm}
            onChange={(e) => {
              setDeliverySearchTerm(e.target.value);
              setDeliveryPage(1);
            }}
            className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded text-xs font-bold outline-none"
          />
          {deliverySearchTerm && (
            <button
              onClick={() => {
                setDeliverySearchTerm('');
                setDeliveryPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5 cursor-pointer"
              title="Clear Search"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {loadingOrders ? (
        <div className="p-10 text-center text-gray-400 font-bold">Loading delivery counter orders...</div>
      ) : undeliveredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
          <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
          <p className="text-gray-700 font-bold text-sm">
            {deliverySearchTerm ? 'No undelivered orders matched your search.' : 'No pending delivery orders.'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">All orders have been delivered or no pending orders exist.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
          <table className="w-full min-w-[850px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0F172A] text-[#DFAC43] font-black uppercase text-[10px] border-b border-gray-800 whitespace-nowrap">
                <th className="p-3">Order #</th>
                <th className="p-3">Customer Details</th>
                <th className="p-3">Suits / Items</th>
                <th className="p-3 text-right">Total Bill</th>
                <th className="p-3 text-right">Advance Paid</th>
                <th className="p-3 text-right">Balance Due</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Counter Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {paginatedDeliveryOrders.map((order) => {
                const balanceDue = Number(order.balanceAmount) || 0;
                return (
                  <tr key={order._id} className="hover:bg-gray-50/80 transition">
                    
                    {/* Order Number & Booking Date */}
                    <td className="p-3 whitespace-nowrap">
                      <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-xs font-black px-2 py-0.5 rounded shadow-2xs block w-fit">
                        #BT-{order.orderNumber}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono block mt-1">
                        {order.bookingDate ? new Date(order.bookingDate).toLocaleDateString() : (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-')}
                      </span>
                    </td>

                    {/* Customer Details */}
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-bold text-gray-900 block">{order.customer?.name || 'Walk-in Customer'}</span>
                      <span className="text-[11px] text-gray-500 font-mono font-semibold flex items-center gap-1 mt-0.5">
                        <FiPhone className="text-gray-400 text-[10px]" /> {formatPhone(order.customer?.phone)}
                      </span>
                    </td>

                    {/* Suits list summary */}
                    <td className="p-3 max-w-[220px]">
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-800 text-[11px] block">
                          {order.suits?.length || 1} Suit(s)
                        </span>
                        <p className="text-[10px] text-gray-500 truncate">
                          {order.suits && order.suits.map(s => s.serviceType || 'Shalwar Qameez').join(', ')}
                        </p>
                      </div>
                    </td>

                    {/* Total Bill */}
                    <td className="p-3 text-right font-black text-gray-900 font-sans whitespace-nowrap">
                      Rs {Number(order.totalAmount || 0).toLocaleString()}
                    </td>

                    {/* Advance Paid */}
                    <td className="p-3 text-right font-bold text-green-700 font-sans whitespace-nowrap">
                      Rs {Number(order.advancePaid || 0).toLocaleString()}
                    </td>

                    {/* Balance Due */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <span className={`font-black font-sans text-xs px-2 py-0.5 rounded ${
                        balanceDue > 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        Rs {balanceDue.toLocaleString()}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block ${
                        order.orderStatus === 'Completed' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/print/${order._id}`)}
                          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition border border-gray-200 cursor-pointer"
                          title="View & Print Customer Booking Slip"
                        >
                          <FiPrinter className="text-xs" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setOrderToDeliver(order)}
                          className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] text-xs font-black px-3 py-1.5 rounded transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <FiCheckCircle className="text-xs" /> Deliver & Cash
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination 
            currentPage={deliveryPage}
            totalItems={undeliveredOrders.length}
            pageSize={PAGE_SIZE}
            onPageChange={setDeliveryPage}
          />
        </div>
      )}
    </div>
  );
};

export default WorkerDeliveryCounterTab;
