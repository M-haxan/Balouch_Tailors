import React, { useState } from 'react';
import { useUpdateCustomer } from '../hooks/useCustomers';
import { formatPhone } from '../utils/formatters';
import { FiX } from 'react-icons/fi';

// ====================================================================
// MODAL: EDIT CUSTOMER PROFILE
// ====================================================================
const CustomerEditProfileModal = ({ customer, closeModal }) => {
  const { mutate: updateCustomer, isPending } = useUpdateCustomer();

  const [formData, setFormData] = useState({
    name: customer.name || '',
    phone: customer.phone ? formatPhone(customer.phone) : '',
    whatsapp: customer.whatsapp || '',
    city: customer.city || '',
    cnic: customer.cnic || '',
    address: customer.address || '',
  });

  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('whatsapp', formData.whatsapp);
    data.append('city', formData.city);
    data.append('cnic', formData.cnic);
    data.append('address', formData.address);
    if (imageFile) {
      data.append('profileImage', imageFile);
    }

    updateCustomer({ id: customer._id, data }, {
      onSuccess: () => closeModal()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 animate-fade-in">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-black text-gray-900">Edit Customer Information</h2>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black rounded">
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">WhatsApp Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 03001234567"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">City / Town</label>
              <input
                type="text"
                placeholder="e.g. Quetta, Karachi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">CNIC (Optional)</label>
              <input
                type="text"
                placeholder="xxxxx-xxxxxxx-x"
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Update Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full border-2 border-gray-200 rounded p-1 text-xs outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Street Address</label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-medium outline-none"
              ></textarea>
            </div>
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
              {isPending ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerEditProfileModal;
