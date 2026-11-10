import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSettleCustomerKhata, useCustomerDues } from '../hooks/useCustomers';
import { newIdempotencyKey } from '../utils/idempotency';
import { FaMoneyBillWave } from 'react-icons/fa';
import { FiX, FiCheckCircle } from 'react-icons/fi';

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'EasyPaisa', 'JazzCash', 'Card'];

const CustomerSettleKhataModal = ({ customer, initialOrderId = null, closeModal }) => {
  const { mutate: settleKhata, isPending } = useSettleCustomerKhata();
  const { data: duesData } = useCustomerDues(customer._id);

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId || '');
  const [note, setNote] = useState('');
  const [settledResult, setSettledResult] = useState(null);

  const openOrders = duesData?.openOrders || [];
  const totalDues = Number(duesData?.totalDues || customer.duesBalance || customer.khataBalance || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }

    settleKhata({
      customerId: customer._id,
      data: {
        amount: num,
        method,
        orderId: selectedOrderId || null,
        note: note || 'Counter Khata Settlement',
        idempotencyKey: newIdempotencyKey()
      }
    }, {
      onSuccess: (response) => {
        toast.success('Payment recorded successfully.');
        setSettledResult(response);
      }
    });
  };

  if (settledResult) {
    const { allocated, khataBalance, dues, credit } = settledResult;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
        <div className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-fade-in p-6 space-y-4">
          <div className="text-center space-y-1">
            <FiCheckCircle className="text-4xl text-emerald-600 mx-auto" />
            <h3 className="text-lg font-black text-gray-900">Payment Allocated Successfully!</h3>
            <p className="text-xs text-gray-500">Customer: {customer.name}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-gray-700">
              <span>Amount Received:</span>
              <span className="font-black text-black">Rs {Number(amount).toLocaleString()} ({method})</span>
            </div>

            {allocated?.orders?.length > 0 && (
              <div className="pt-2 border-t border-gray-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-gray-500">Allocated to Orders:</span>
                {allocated.orders.map((alloc, idx) => (
                  <div key={idx} className="flex justify-between text-gray-800 text-[11px]">
                    <span>Order #{alloc.orderNumber || alloc.orderId}</span>
                    <span className="font-bold text-emerald-700">Rs {alloc.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {allocated?.creditCreated > 0 && (
              <div className="pt-1 border-t border-gray-200 flex justify-between text-emerald-700 font-bold">
                <span>Excess to Customer Credit:</span>
                <span className="font-black">Rs {allocated.creditCreated.toLocaleString()}</span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-300 flex justify-between font-black text-xs text-gray-900">
              <span>Updated Khata Balance:</span>
              <span className={khataBalance > 0 ? 'text-red-600' : 'text-emerald-700'}>
                Rs {khataBalance?.toLocaleString()} {khataBalance > 0 ? '(Dues)' : '(Credit)'}
              </span>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-full h-10 bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-black font-black text-xs rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-fade-in">
        <div className="flex justify-between items-center p-4 bg-gray-900 text-white">
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-[#DFAC43] text-base" />
            <div>
              <h2 className="text-sm font-black">Receive Khata Payment</h2>
              <p className="text-[10px] text-gray-400">{customer.name} • Total Dues: Rs {totalDues.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={closeModal} className="text-gray-400 hover:text-white"><FiX className="text-lg" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Apply to Specific Order (Optional)
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-xs font-semibold outline-none bg-white"
            >
              <option value="">Auto-allocate across oldest open dues</option>
              {openOrders.map(o => (
                <option key={o._id} value={o._id}>
                  Order #BT-{o.orderNumber} — Due: Rs {o.due?.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Amount (Rs) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 focus:border-[#DFAC43] rounded p-2 text-sm font-black outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-xs font-bold outline-none bg-white"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Description / Notes</label>
            <input
              type="text"
              placeholder="e.g. Received at shop counter"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-xs font-medium outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black rounded text-xs transition shadow disabled:opacity-50"
            >
              {isPending ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerSettleKhataModal;
