import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useAddSupplier } from '../hooks/useExpenses';

export const SUPPLIER_CATEGORIES = [
  'Bukram & Canvas',
  'Kaj & Buttons',
  'Thread & Zips',
  'Fabric & Linings',
  'Machine & Parts',
  'General Accessories',
  'Other'
];

const AddSupplierModal = ({ closeModal }) => {
  const { mutate: addSupplier, isPending } = useAddSupplier();
  const [form, setForm] = useState({
    shopName: '',
    name: '',
    phone: '',
    category: 'Bukram & Canvas',
    address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addSupplier(form, {
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
          Register Material Vendor
        </h3>
        <p className="text-xs text-gray-500 mb-5">Add details of Bukram, Kaj, Button or Thread shop.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-gray-700 mb-1">Dukan / Shop Name *</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Madina Bukram & Button Store" 
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Contact Person / Malik Name *</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Haji Abdul Rehman" 
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1">Phone Number *</label>
              <input 
                required
                type="text" 
                placeholder="0300-1234567" 
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs bg-white"
              >
                {SUPPLIER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Market Address (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Shop # 14, Cloth Market" 
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black p-3 rounded transition shadow-md mt-6"
          >
            {isPending ? 'Saving Vendor...' : 'Save Material Vendor'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSupplierModal;
