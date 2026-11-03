import React from 'react';
import { formatPhone } from '../utils/formatters';
import { 
  FiUser, 
  FiCheck, 
  FiCheckCircle, 
  FiEye, 
  FiPrinter, 
  FiTrash2 
} from 'react-icons/fi';

const OrderMobileCards = ({
  orders,
  statusOptions,
  getStatusColor,
  handleStatusChange,
  handleOpenViewOrder,
  setDeliveryModalOrder,
  handleDelete,
  isDeleting,
  navigate
}) => {
  return (
    <div className="block md:hidden space-y-3">
      {orders.map((order) => {
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
  );
};

export default OrderMobileCards;
