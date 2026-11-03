import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSettleCustomerKhata } from '../hooks/useCustomers';
import { FaMoneyBillWave } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

// ====================================================================
// MODAL: SETTLE KHATA / CASH TRANSACTION
// ====================================================================
const CustomerSettleKhataModal = ({ customer, closeModal }) => {
  const { mutate: settleKhata, isPending } = useSettleCustomerKhata();

  const [form, setForm] = useState({
    type: 'payment',
    amount: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    settleKhata({
      customerId: customer._id,
      data: {
        type: form.type,
        amount: Number(form.amount),
        description: form.description || (form.type === 'payment' ? 'Counter Cash Received' : 'Khata Settlement')
      }
    }, {
      onSuccess: () => closeModal()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-fade-in">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-900 text-white">
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-[#DFAC43] text-lg" />
            <h2 className="text-base font-black">Khata Settlement ({customer.name})</h2>
          </div>
          <button onClick={closeModal} className="text-gray-400 hover:text-white"><FiX className="text-lg" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Transaction Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
            >
              <option value="payment">Payment Received</option>
              <option value="refund">Refund Given</option>
              <option value="debit">Add Manual Debt</option>
              <option value="credit">Add Manual Credit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (Rs) *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 1500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description / Notes</label>
            <input
              type="text"
              placeholder="e.g. Cash received at shop counter"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-medium outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
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
              className="px-6 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black rounded text-xs transition shadow"
            >
              {isPending ? 'Posting...' : 'Post Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerSettleKhataModal;
