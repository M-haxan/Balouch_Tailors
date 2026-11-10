import React, { useState, useMemo, useEffect } from 'react';
import { useDeliverOrder } from '../hooks/useOrder';
import { useCustomerDues } from '../hooks/useCustomers';
import { newIdempotencyKey } from '../utils/idempotency';
import { FiCheckCircle, FiX, FiAlertTriangle, FiCheck, FiInfo, FiCreditCard } from 'react-icons/fi';
import DeliveryReceiptModal from './DeliveryReceiptModal';

const PAYMENT_METHODS = ['Cash', 'JazzCash', 'EasyPaisa', 'Bank Transfer', 'Card'];

const OrderDeliveryModal = ({ order, closeModal }) => {
  const { mutate: deliverOrder, isPending } = useDeliverOrder();
  
  const customerId = order.customer?._id || order.customer;
  const { data: duesData } = useCustomerDues(customerId, {
    enabled: Boolean(customerId)
  });

  const availableCredit = Number(duesData?.creditBalance || 0);
  const otherOpenOrders = useMemo(() => {
    return (duesData?.openOrders || []).filter(o => String(o._id) !== String(order._id));
  }, [duesData?.openOrders, order._id]);

  const billTotal = Number(order.netAmount ?? order.totalAmount ?? 0);
  const advancePaid = Number(order.paidAmount ?? order.advancePaid ?? 0);
  const currentOrderDue = Math.max(0, billTotal - advancePaid);

  // States
  const [creditToUse, setCreditToUse] = useState(() => {
    return availableCredit > 0 ? Math.min(availableCredit, currentOrderDue).toString() : '0';
  });
  const [billReceived, setBillReceived] = useState(() => {
    const defaultCredit = availableCredit > 0 ? Math.min(availableCredit, currentOrderDue) : 0;
    return Math.max(0, currentOrderDue - defaultCredit).toString();
  });
  const [duesReceived, setDuesReceived] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [settlementData, setSettlementData] = useState(null);

  // Auto-update credit/bill received if duesData finishes loading later
  useEffect(() => {
    if (availableCredit > 0 && Number(creditToUse) === 0) {
      const initCredit = Math.min(availableCredit, currentOrderDue);
      setCreditToUse(initCredit.toString());
      setBillReceived(Math.max(0, currentOrderDue - initCredit).toString());
    }
  }, [availableCredit, currentOrderDue]);

  const numCreditToUse = Math.min(availableCredit, Math.max(0, Number(creditToUse) || 0));
  const numBillReceived = Math.max(0, Number(billReceived) || 0);
  const numDuesReceived = Math.max(0, Number(duesReceived) || 0);

  // Live calculations
  const totalCoveredForBill = numCreditToUse + numBillReceived;
  const orderUdhaar = Math.max(0, currentOrderDue - totalCoveredForBill);
  const extraCredit = Math.max(0, totalCoveredForBill - currentOrderDue);

  const previousDuesTotal = otherOpenOrders.reduce((acc, o) => acc + (Number(o.due) || 0), 0);
  const previousDuesRemaining = Math.max(0, previousDuesTotal - numDuesReceived);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      billReceived: numBillReceived,
      duesReceived: numDuesReceived,
      creditToUse: numCreditToUse,
      paymentMethod,
      note: deliveryNote,
      idempotencyKey: newIdempotencyKey(),
      deliveredBy: {
        userType: 'admin',
        name: 'Admin'
      }
    };

    deliverOrder({
      id: order._id,
      data: payload
    }, {
      onSuccess: (response) => {
        const breakdown = response?.deliveryBreakdown || {
          billDue: currentOrderDue,
          creditUsed: numCreditToUse,
          billPaidNow: numBillReceived,
          orderUdhaarRemaining: orderUdhaar,
          duesReceived: numDuesReceived,
          creditCreated: extraCredit,
          newKhataBalance: orderUdhaar + previousDuesRemaining - extraCredit
        };

        setSettlementData({
          receivedAmount: numBillReceived + numDuesReceived,
          billReceived: numBillReceived,
          duesReceived: numDuesReceived,
          creditUsed: numCreditToUse,
          orderUdhaar,
          extraCredit,
          paymentMethod,
          breakdown
        });
        setShowSlipModal(true);
      }
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 font-sans overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-scale-up my-4">
          
          {/* Modal Header */}
          <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#DFAC43] rounded-sm"></span>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FiCheckCircle className="text-[#DFAC43]" /> Deliver Order & Payment Settlement
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
            
            {/* Section 1: Current Order Bill */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
              <span className="text-[11px] font-black uppercase text-slate-800 tracking-wider block">
                1. Current Order Bill Breakdown
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 block">Total Bill</span>
                  <span className="font-bold text-gray-900 text-sm">Rs {billTotal.toLocaleString()}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 block">Advance Paid</span>
                  <span className="font-bold text-emerald-600 text-sm">Rs {advancePaid.toLocaleString()}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-gray-500 block">Balance Due</span>
                  <span className="font-black text-amber-600 text-sm">Rs {currentOrderDue.toLocaleString()}</span>
                </div>
              </div>

              {/* Customer credit utilization option */}
              {availableCredit > 0 && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Available Credit Balance</span>
                    <span className="text-xs font-black text-emerald-900">Rs {availableCredit.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-700">Use:</span>
                    <input
                      type="number"
                      min="0"
                      max={Math.min(availableCredit, currentOrderDue)}
                      value={creditToUse}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCreditToUse(val);
                        const c = Math.min(availableCredit, Math.max(0, Number(val) || 0));
                        setBillReceived(Math.max(0, currentOrderDue - c).toString());
                      }}
                      className="w-24 h-8 px-2 bg-white border border-emerald-300 rounded text-right font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Bill Cash Received */}
              <div className="pt-2">
                <label className="block text-[11px] font-black text-gray-800 uppercase tracking-wider mb-1">
                  Received for this order bill (Rs) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-gray-500 text-xs">PKR</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={billReceived}
                    onChange={(e) => setBillReceived(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-3 py-2 border-2 border-gray-300 focus:border-[#DFAC43] rounded text-base font-black outline-none font-sans text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Previous Dues Collection (Optional) */}
            {otherOpenOrders.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200 rounded p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
                    2. Previous Open Dues ({otherOpenOrders.length} Order{otherOpenOrders.length > 1 ? 's' : ''})
                  </span>
                  <span className="font-black text-amber-900">Total: Rs {previousDuesTotal.toLocaleString()}</span>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 bg-white p-2 rounded border border-amber-200">
                  {otherOpenOrders.map(o => (
                    <div key={o._id} className="flex justify-between items-center text-[11px] py-0.5 border-b border-gray-100 last:border-0">
                      <span className="font-bold text-gray-700">Order #BT-{o.orderNumber} ({new Date(o.bookingDate).toLocaleDateString()})</span>
                      <span className="font-black text-red-600">Rs {o.due?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Received towards previous dues (Auto-allocated oldest first):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={duesReceived}
                    onChange={(e) => setDuesReceived(e.target.value)}
                    placeholder="0"
                    className="w-full h-8 px-2 border border-amber-300 rounded text-right font-bold text-xs"
                  />
                </div>
              </div>
            )}

            {/* Section 3: Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded h-9 px-2 text-xs font-bold outline-none bg-white cursor-pointer"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Settlement Note (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Cleared at shop counter"
                  className="w-full border border-gray-300 rounded h-9 px-2 text-xs outline-none bg-white"
                />
              </div>
            </div>

            {/* Live Settlement Summary Alert */}
            <div className={`p-3 rounded border text-xs font-bold space-y-1 ${
              orderUdhaar > 0
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : extraCredit > 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-green-50 border-green-300 text-green-900'
            }`}>
              <div className="flex justify-between">
                <span>Total Cash Receiving Now:</span>
                <span className="font-black text-sm">Rs {(numBillReceived + numDuesReceived).toLocaleString()}</span>
              </div>
              {orderUdhaar > 0 && (
                <div className="flex items-center gap-1.5 text-amber-800 text-[11px]">
                  <FiAlertTriangle className="shrink-0" />
                  <span>Rs {orderUdhaar.toLocaleString()} remaining udhaar will be recorded on this order.</span>
                </div>
              )}
              {extraCredit > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-800 text-[11px]">
                  <FiCheck className="shrink-0" />
                  <span>Rs {extraCredit.toLocaleString()} excess payment will be credited to customer account.</span>
                </div>
              )}
              {orderUdhaar === 0 && extraCredit === 0 && (
                <div className="flex items-center gap-1.5 text-green-800 text-[11px]">
                  <FiCheckCircle className="shrink-0" />
                  <span>This order is fully paid! Zero remaining udhaar.</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black rounded transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] text-xs font-black px-5 py-2.5 rounded transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FiCheckCircle /> {isPending ? 'Processing...' : 'Confirm Delivery & Record Payment'}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* DELIVERY & PAID RECEIPT SLIP MODAL */}
      {showSlipModal && (
        <DeliveryReceiptModal
          order={order}
          settlementData={settlementData}
          closeModal={() => {
            setShowSlipModal(false);
            closeModal();
          }}
        />
      )}
    </>
  );
};

export default OrderDeliveryModal;
