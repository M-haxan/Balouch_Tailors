import React from 'react';
import { formatPhone } from '../utils/formatters';
import { 
  FiUser, 
  FiCheck, 
  FiClock, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiEye, 
  FiPrinter, 
  FiTrash2 
} from 'react-icons/fi';

const OrderDesktopTable = ({
  orders,
  statusOptions,
  getStatusColor,
  handleStatusChange,
  handleOpenViewOrder,
  setDeliveryModalOrder,
  handleDelete,
  isDeleting,
  navigate,
  t
}) => {
  return (
    <div className="hidden md:block overflow-x-auto border border-gray-200 rounded shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#0F172A] text-[#DFAC43] uppercase text-[10px] tracking-wider border-b border-gray-200">
            <th className="py-3 px-3 rounded-tl min-w-[150px] lg:min-w-[165px]">{t('orders.orderNo')}</th>
            <th className="py-3 px-3 min-w-[120px] lg:min-w-[135px]">{t('orders.customer')}</th>
            <th className="py-3 px-3 text-center min-w-[80px] lg:min-w-[95px]">{t('orders.garments')}</th>
            <th className="py-3 px-3 min-w-[95px] lg:min-w-[110px]">{t('orders.totalBill')}</th>
            <th className="py-3 px-3 text-center min-w-[95px] lg:min-w-[110px]">{t('orders.status')}</th>
            <th className="py-3 px-3 rounded-tr text-right min-w-[125px] lg:min-w-[145px]">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium">
          {orders.map((order) => {
            const hasPendingQC = order.suits?.some(s => s.stitchingStatus === 'Submitted for Inspection');
            const hasRework = order.suits?.some(s => s.stitchingStatus === 'Rework Required');

            return (
              <tr key={order._id} className={`hover:bg-gray-50/80 transition-colors group ${hasPendingQC ? 'bg-amber-50/30' : ''}`}>
                
                {/* Order ID & Dates & Handlers */}
                <td className="py-3 px-3">
                  <span className="font-black text-black text-xs sm:text-sm uppercase">#BT-{order.orderNumber}</span>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5">
                    <span>{new Date(order.bookingDate).toLocaleDateString()}</span>
                    <span className="text-gray-300">•</span>
                    <span className="font-bold text-amber-950">Due: {new Date(order.deliveryDate).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Compact Handler Badges */}
                  <div className="flex flex-wrap items-center gap-1 mt-1 text-[9px] sm:text-[10px]">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded border border-slate-200" title="Booked by">
                      <FiUser className="text-[8px] text-slate-400" /> {order.createdBy?.name || 'Admin'}
                    </span>
                    {order.orderStatus === 'Delivered' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-black px-1.5 py-0.5 rounded border border-emerald-200" title="Delivered by">
                        <FiCheck className="text-[8px] text-emerald-600" /> {order.deliveredBy?.name || order.receivedAtDelivery?.receivedBy || 'Admin'}
                      </span>
                    )}
                  </div>
                </td>

                {/* Customer Info */}
                <td className="py-3 px-3">
                  <p className="font-bold text-gray-900 text-xs sm:text-sm whitespace-nowrap">{order.customer?.name || 'Unknown'}</p>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">{formatPhone(order.customer?.phone)}</p>
                </td>

                {/* Suit Count & QC Badges */}
                <td className="py-3 px-3 text-center">
                  <div className="inline-flex flex-col items-center gap-0.5">
                    <span className="bg-gray-100 text-black font-bold px-2 py-0.5 rounded-md text-[11px] sm:text-xs">
                      {order.suits?.length || 0} Suits
                    </span>
                    {hasPendingQC && (
                      <span className="bg-[#DFAC43] text-[#0F172A] text-[8px] sm:text-[9px] font-black px-1 py-0.5 rounded uppercase inline-flex items-center gap-0.5 animate-pulse whitespace-nowrap">
                        <FiClock /> Needs QC
                      </span>
                    )}
                    {hasRework && (
                      <span className="bg-red-100 text-red-800 text-[8px] sm:text-[9px] font-black px-1 py-0.5 rounded uppercase inline-flex items-center gap-0.5 whitespace-nowrap">
                        <FiAlertTriangle /> Rework
                      </span>
                    )}
                  </div>
                </td>

                {/* Cash Flow */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <p className="text-xs sm:text-sm font-black text-black font-sans">Rs {Number(order.totalAmount || 0).toLocaleString()}</p>
                  {order.balanceAmount > 0 ? (
                    <p className="text-[10px] sm:text-[11px] font-black text-amber-950 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-block mt-0.5 font-sans">
                      Bal: Rs {Number(order.balanceAmount).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-[10px] sm:text-[11px] font-bold text-green-700 mt-0.5">Fully Paid</p>
                  )}
                </td>

                {/* Live Status Updater Dropdown */}
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    className={`text-[11px] sm:text-xs font-bold px-2 py-1 sm:py-1.5 rounded-lg border outline-none cursor-pointer text-center ${getStatusColor(order.orderStatus)}`}
                  >
                    {statusOptions.map(opt => <option key={opt} value={opt} className="bg-white text-black">{opt}</option>)}
                  </select>
                </td>

                {/* Actions */}
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <div className="flex justify-end items-center gap-1 sm:gap-1.5">
                    {/* Quick Deliver Button */}
                    {order.orderStatus !== 'Delivered' && (
                      <button
                        onClick={() => setDeliveryModalOrder(order)}
                        className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] text-[11px] sm:text-xs font-black px-2 py-1 sm:py-1.5 rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                        title="Deliver Suit & Receive Payment"
                      >
                        <FiCheckCircle className="text-xs" /> <span>Deliver</span>
                      </button>
                    )}

                    <button 
                      onClick={() => handleOpenViewOrder(order)}
                      className={`p-1 sm:p-1.5 rounded-lg transition shadow-2xs cursor-pointer ${
                        hasPendingQC 
                          ? 'bg-[#DFAC43] text-[#0F172A] font-bold hover:bg-white ring-1 ring-[#DFAC43]' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      title="View Details / QC Inspect / Assign Worker"
                    >
                      <FiEye className="text-xs sm:text-sm" />
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/print/${order._id}`)}
                      className="bg-[#0F172A] hover:bg-gray-800 text-[#DFAC43] p-1 sm:p-1.5 rounded-lg transition shadow-2xs cursor-pointer"
                      title="Print Invoice"
                    >
                      <FiPrinter className="text-xs sm:text-sm" />
                    </button>
                    <button 
                      onClick={() => handleDelete(order._id)}
                      disabled={isDeleting}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-1 sm:p-1.5 rounded-lg transition shadow-2xs cursor-pointer"
                      title="Delete Order"
                    >
                      <FiTrash2 className="text-xs sm:text-sm" />
                    </button>
                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDesktopTable;
