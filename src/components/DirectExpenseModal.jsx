import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useAddDirectExpense } from '../hooks/useExpenses';

export const EXPENSE_CATEGORIES = [
  'Material & Supplies',
  'Shop Rent',
  'Electricity & Utilities',
  'Machine Maintenance & Oil',
  'Tea & Refreshment',
  'Worker Food / Daily Allowance',
  'Staff Salary / Other Labor',
  'Packaging & Bags',
  'Misc & General'
];

// -------------------------------------------------------------
// MODAL: LOG DIRECT OPERATIONAL SHOP EXPENSE
const DirectExpenseModal = ({ closeModal }) => {
  const { mutate: addExpense, isPending } = useAddDirectExpense();
  const [form, setForm] = useState({
    title: '',
    category: 'Electricity & Utilities',
    amount: '',
    paidTo: '',
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense(form, {
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
          Log Shop Expense
        </h3>
        <p className="text-xs text-gray-500 mb-4">Record rent, utility bills, machine oil, tea or general expenses.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-gray-700 mb-1">Expense Title / Description *</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Shop Electricity Bill - September" 
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs bg-white"
              >
                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Amount (Rs) *</label>
              <input 
                required
                type="number" 
                min="1"
                placeholder="4500" 
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-black text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1">Date *</label>
              <input 
                required
                type="date" 
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Paid To / Recipient</label>
              <input 
                type="text" 
                placeholder="e.g. WAPDA / Landlord" 
                value={form.paidTo}
                onChange={(e) => setForm({ ...form, paidTo: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs bg-white"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="JazzCash/EasyPaisa">JazzCash / EasyPaisa</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Notes (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Receipt # 104" 
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
            {isPending ? 'Logging Expense...' : 'Save Expense Record'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DirectExpenseModal;
