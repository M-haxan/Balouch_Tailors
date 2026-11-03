import React, { useState } from 'react';
import { useDeliverOrder } from '../hooks/useOrder';
import { FiCheckCircle, FiX, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import DeliveryReceiptModal from './DeliveryReceiptModal';

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
      paymentMethod,
      deliveredBy: {
        userType: 'admin',
        name: 'Admin'
      }
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

export default OrderDeliveryModal;
