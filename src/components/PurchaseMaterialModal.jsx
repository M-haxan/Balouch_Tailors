import React, { useState } from 'react';
import { FiX, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { useAddSupplierPurchase } from '../hooks/useExpenses';

const PurchaseMaterialModal = ({ supplier, closeModal }) => {
  const { mutate: addPurchase, isPending } = useAddSupplierPurchase();
  const [form, setForm] = useState({
    itemDetails: '',
    amount: '',
    paymentStatus: 'Unpaid', // 'Paid' | 'Unpaid'
    paymentMethod: 'Cash',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addPurchase({
      id: supplier._id,
      data: form
    }, {
      onSuccess: () => closeModal()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded border border-gray-200 shadow-2xl w-full max-w-md p-6 relative">
        <button 
          onClick={closeModal} 
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-lg"
        >
          <FiX />
        </button>

        <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wider mb-1 flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-[#DFAC43] rounded-sm"></span>
          Goods Purchase Entry
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Vendor: <span className="font-bold text-black">{supplier.shopName}</span> ({supplier.category})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-gray-700 mb-1">Item Details</label>
            <input 
              required
              type="text" 
              placeholder="e.g. 5 Roll Hard Bukram + 20 pkt Black Buttons" 
              value={form.itemDetails}
              onChange={(e) => setForm({ ...form, itemDetails: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1">Total Bill / Amount (Rs) *</label>
              <input 
                required
                type="number" 
                min="1"
                placeholder="3500" 
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-black text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Purchase Date *</label>
              <input 
                required
                type="date" 
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs bg-white"
              />
            </div>
          </div>

          {/* Payment Status (Cash Paid now vs Added to Udhar) */}
          <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2">
            <span className="block text-gray-700 font-bold">Payment Condition:</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, paymentStatus: 'Unpaid' })}
                className={`py-2.5 px-2 rounded font-bold text-xs transition border flex items-center justify-center gap-2 text-center cursor-pointer ${
                  form.paymentStatus === 'Unpaid'
                    ? 'bg-amber-500 text-black border-amber-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <FiAlertTriangle className="text-sm shrink-0" />
                <span className="leading-tight">
                  Outstanding Due
                  <span className="block text-[10px] font-medium opacity-90">(Add to Ledger)</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, paymentStatus: 'Paid' })}
                className={`py-2.5 px-2 rounded font-bold text-xs transition border flex items-center justify-center gap-2 text-center cursor-pointer ${
                  form.paymentStatus === 'Paid'
                    ? 'bg-green-600 text-white border-green-700 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <FiCheck className="text-base shrink-0" />
                <span className="leading-tight">
                  Paid Cash Directly
                  <span className="block text-[10px] font-medium opacity-90">(Full Paid)</span>
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Notes / Extra Detail</label>
            <input 
              type="text" 
              placeholder="e.g. Bill # 402 - Brought by Worker" 
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black p-3 rounded transition shadow-md mt-4"
          >
            {isPending ? 'Logging Purchase...' : 'Save Purchase Entry'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PurchaseMaterialModal;
