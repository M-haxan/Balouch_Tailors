import React, { useState } from 'react';
import { FiCreditCard, FiCalendar, FiPercent, FiX, FiSave, FiPlusCircle, FiList } from 'react-icons/fi';
import { useAddOrderPayment, useOrderPayments } from '../hooks/useOrder';
import { newIdempotencyKey } from '../utils/idempotency';
import { toast } from 'react-toastify';

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'EasyPaisa', 'JazzCash', 'Card'];

const OrderPaymentSection = ({
  bookingDate,
  setBookingDate,
  deliveryDate,
  setDeliveryDate,
  discountPercent,
  setDiscountPercent,
  discountAmount,
  rawSubtotal,
  totalAmount,
  advancePaid,
  setAdvancePaid,
  advancePaymentMethod = 'Cash',
  setAdvancePaymentMethod,
  isEditMode,
  editOrderId,
  existingOrder,
  orderStatus,
  setOrderStatus,
  isPending
}) => {
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addMethod, setAddMethod] = useState('Cash');
  const [addNote, setAddNote] = useState('');

  const { data: payments = [], refetch: refetchPayments } = useOrderPayments(editOrderId, {
    enabled: Boolean(isEditMode && editOrderId)
  });
  const { mutate: addPayment, isPending: addingPayment } = useAddOrderPayment();

  const handleAddPaymentSubmit = (e) => {
    e.preventDefault();
    const num = Number(addAmount);
    if (!num || num <= 0) {
      return toast.error('Payment amount must be greater than zero.');
    }
    addPayment(
      {
        orderId: editOrderId,
        data: {
          amount: num,
          method: addMethod,
          note: addNote,
          idempotencyKey: newIdempotencyKey()
        }
      },
      {
        onSuccess: () => {
          toast.success('Payment recorded successfully.');
          setShowAddPaymentModal(false);
          setAddAmount('');
          setAddNote('');
          refetchPayments();
        }
      }
    );
  };

  const totalPaidSoFar = isEditMode
    ? Number(existingOrder?.paidAmount ?? advancePaid ?? 0)
    : Number(advancePaid || 0);

  return (
    <div className="bg-[#0F172A] text-white p-3.5 sm:p-5 rounded border border-gray-800 space-y-4 sm:space-y-5 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <h3 className="text-xs sm:text-sm font-bold text-[#DFAC43] uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
          <FiCreditCard /> 4. Delivery & Payment Details
        </h3>
        <span className="text-[10px] font-bold text-gray-400">Final Step</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        
        {/* Delivery Date & Discount Inputs */}
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Booking Date */}
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">
                Booking Date (بکنگ کی تاریخ) *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  required 
                  type="date" 
                  value={bookingDate} 
                  onChange={(e) => setBookingDate(e.target.value)} 
                  className="w-full h-10 pl-9 pr-3 bg-gray-900 border border-gray-700 focus:border-[#DFAC43] text-white rounded outline-none font-medium text-xs sm:text-sm cursor-pointer" 
                />
              </div>
            </div>

            {/* Delivery Due Date */}
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">
                Delivery Due Date (ڈیلیوری کی تاریخ) *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  required 
                  type="date" 
                  value={deliveryDate} 
                  onChange={(e) => setDeliveryDate(e.target.value)} 
                  className="w-full h-10 pl-9 pr-3 bg-gray-900 border border-gray-700 focus:border-[#DFAC43] text-white rounded outline-none font-medium text-xs sm:text-sm cursor-pointer" 
                />
              </div>
            </div>
          </div>

          {/* Discount Percentage Section */}
          <div className="bg-gray-900/90 p-2.5 sm:p-3 rounded border border-gray-800 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                <FiPercent className="text-[#DFAC43]" /> Special Discount (%)
              </label>
              {discountPercent && Number(discountPercent) > 0 && (
                <span className="text-[11px] font-bold text-green-400">
                  - Rs {discountAmount.toLocaleString()} Saved
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-xs">%</span>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0" 
                  value={discountPercent} 
                  onChange={(e) => setDiscountPercent(e.target.value)} 
                  className="w-full h-10 pl-3 pr-7 bg-black border border-gray-700 focus:border-[#DFAC43] text-white rounded outline-none font-bold text-xs sm:text-sm" 
                />
              </div>

              {/* Quick Discount Presets */}
              <div className="flex items-center gap-1">
                {[5, 10, 15, 20].map(pct => (
                  <button
                    type="button"
                    key={pct}
                    onClick={() => setDiscountPercent(pct.toString())}
                    className={`flex-1 sm:flex-initial text-[11px] h-10 px-2 sm:px-2.5 rounded font-bold transition-all ${
                      discountPercent === pct.toString()
                        ? 'bg-[#DFAC43] text-[#0F172A]'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
                {discountPercent && (
                  <button
                    type="button"
                    onClick={() => setDiscountPercent('')}
                    className="text-[11px] h-10 px-2.5 rounded bg-gray-800 text-red-400 hover:bg-gray-700 font-bold"
                    title="Clear Discount"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Totals Breakdown Card */}
        <div className="bg-gray-900/90 p-3 sm:p-4 rounded border border-gray-800 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-gray-400">
            <span>Gross Subtotal:</span>
            <span className="text-gray-200 font-bold font-sans">Rs {rawSubtotal.toLocaleString()}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-green-400">
              <span>Discount ({discountPercent}%):</span>
              <span className="font-bold font-sans">- Rs {discountAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-gray-800">
            <span className="text-white font-black uppercase tracking-wider text-xs sm:text-sm">Net Total Bill:</span>
            <span className="text-xl sm:text-2xl font-black text-[#DFAC43] font-sans">
              Rs {totalAmount.toLocaleString()}
            </span>
          </div>
          
          {/* Payment Section: Create vs Edit */}
          {!isEditMode ? (
            <div className="pt-2 border-t border-gray-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-gray-300 font-bold text-xs whitespace-nowrap">Advance Payment:</span>
                <div className="flex items-center gap-2">
                  <select
                    value={advancePaymentMethod}
                    onChange={(e) => setAdvancePaymentMethod && setAdvancePaymentMethod(e.target.value)}
                    className="h-9 px-2 bg-black border border-gray-700 focus:border-[#DFAC43] text-gray-200 rounded outline-none font-bold text-xs"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    min="0" 
                    placeholder="0" 
                    value={advancePaid} 
                    onChange={(e) => setAdvancePaid(e.target.value)} 
                    onWheel={(e) => e.target.blur()} 
                    className="w-28 sm:w-32 h-9 px-3 bg-black border border-gray-700 focus:border-[#DFAC43] text-white rounded outline-none font-bold text-right text-xs sm:text-sm" 
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-gray-400 text-[11px]">
                <span>Remaining Due on Delivery:</span>
                <span className="font-bold text-amber-400">
                  Rs {Math.max(0, totalAmount - (Number(advancePaid) || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-bold text-xs">Received so far:</span>
                <span className="text-sm font-bold text-emerald-400 font-sans">
                  Rs {totalPaidSoFar.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400 text-[11px]">
                <span>Balance Due:</span>
                <span className="font-bold text-amber-400">
                  Rs {Math.max(0, totalAmount - totalPaidSoFar).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(true)}
                  className="flex-1 h-8 px-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <FiPlusCircle /> Add Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentsModal(true)}
                  className="h-8 px-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <FiList /> View Payments ({payments.length})
                </button>
              </div>
            </div>
          )}

          {/* Order Status Selector (When in Edit Mode) */}
          {isEditMode && (
            <div className="flex justify-between items-center gap-2 pt-2 border-t border-gray-800">
              <span className="text-white font-bold text-xs">Order Status:</span>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="h-9 px-2 bg-black border border-gray-700 focus:border-[#DFAC43] text-[#DFAC43] rounded outline-none font-bold text-xs cursor-pointer"
              >
                <option value="Booked">Booked</option>
                <option value="Cutting">Cutting</option>
                <option value="Stitching">Stitching</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Save & Generate Invoice Submit Button */}
      <div className="pt-1 sm:pt-2">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full h-11 bg-[#DFAC43] hover:bg-white text-[#0F172A] rounded font-black transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 text-xs sm:text-base cursor-pointer"
        >
          <FiSave /> {isPending ? (isEditMode ? 'Updating Order...' : 'Saving Order...') : (isEditMode ? 'Update Order Details' : 'Save & Generate Invoice')}
        </button>
      </div>

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-gray-700 rounded-lg p-5 max-w-sm w-full space-y-4 text-white">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-[#DFAC43]">Add Payment to Order</h4>
              <button
                type="button"
                onClick={() => setShowAddPaymentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleAddPaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Amount (Rs) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full h-9 px-3 bg-black border border-gray-700 focus:border-[#DFAC43] rounded text-white font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-bold mb-1">Payment Method</label>
                <select
                  value={addMethod}
                  onChange={(e) => setAddMethod(e.target.value)}
                  className="w-full h-9 px-3 bg-black border border-gray-700 focus:border-[#DFAC43] rounded text-white outline-none"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 font-bold mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={addNote}
                  onChange={(e) => setAddNote(e.target.value)}
                  placeholder="e.g. Received via JazzCash"
                  className="w-full h-9 px-3 bg-black border border-gray-700 focus:border-[#DFAC43] rounded text-white outline-none"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="flex-1 h-9 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingPayment}
                  className="flex-1 h-9 bg-[#DFAC43] text-black hover:bg-white rounded font-bold disabled:opacity-50"
                >
                  {addingPayment ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Payments Modal */}
      {showPaymentsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-gray-700 rounded-lg p-5 max-w-md w-full space-y-4 text-white">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-[#DFAC43]">Order Payment History</h4>
              <button
                type="button"
                onClick={() => setShowPaymentsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
              {payments.length === 0 ? (
                <p className="text-gray-400 py-4 text-center">No payments recorded for this order.</p>
              ) : (
                payments.map(p => (
                  <div key={p._id} className="p-2.5 rounded bg-black/50 border border-gray-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{p.receiptNumber || 'Receipt'}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.status === 'void' ? 'bg-red-900/50 text-red-300 line-through' : 'bg-emerald-900/50 text-emerald-300'}`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {p.kind} • {p.method} • {new Date(p.date).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="font-black text-sm text-[#DFAC43]">
                      Rs {p.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowPaymentsModal(false)}
              className="w-full h-8 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPaymentSection;
