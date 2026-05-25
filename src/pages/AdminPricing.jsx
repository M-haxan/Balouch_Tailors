import React, { useState } from 'react';
import { useGetPricing, useAddPricing, useUpdatePricing, useDeletePricing } from '../hooks/usePricing';
import Preloader from '../components/Preloader'; // Agar aapke paas hai toh theek warna hata dein
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const AdminPricing = () => {
  const { data: pricingList = [], isLoading, isError } = useGetPricing();
  const { mutate: deletePricing, isPending: isDeleting } = useDeletePricing();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Agar null hai toh Add hoga, warna Edit

  // Modal kholne ka function
  const openModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this pricing card?')) {
      deletePricing(id);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20">Loading Pricing...</div>;
  if (isError) return <div className="text-red-500 text-center py-10">Failed to load pricing data.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Pricing</h2>
          <p className="text-sm text-gray-500 mt-1">Set dynamic tailoring ranges for your services.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition"
        >
          + Add New Pricing
        </button>
      </div>

      {/* Grid of Pricing Cards */}
      {pricingList.length === 0 ? (
        <div className="text-center py-10 text-gray-400">No pricing data found. Add your first service!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingList.map((item) => (
            <div key={item._id} className="border border-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900">{item.serviceName}</h3>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                  {item.deliveryTime}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4 h-10 overflow-hidden line-clamp-2">
                {item.description}
              </p>

              <div className="bg-gray-50 p-3 rounded mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Estimated Range</p>
                <p className="text-xl font-black text-[#D4AF37]">
                  Rs. {item.minPrice} - {item.maxPrice}
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  onClick={() => openModal(item)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 bg-blue-50 rounded"
                >
                  <FiEdit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={isDeleting}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1.5 bg-red-50 rounded"
                >
                  <FiTrash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pricing Modal (Used for both Add and Edit) */}
      {isModalOpen && (
        <PricingModal
          item={editingItem}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// PRICING MODAL (Add & Edit Form combined)
// -------------------------------------------------------------
const PricingModal = ({ item, closeModal }) => {
  const { mutate: addPricing, isPending: isAdding } = useAddPricing();
  const { mutate: updatePricing, isPending: isUpdating } = useUpdatePricing();

  const isEditMode = Boolean(item);
  const isPending = isAdding || isUpdating;

  // Agar item hai (Edit Mode) toh purana data dalo, warna khali rakho
  const [form, setForm] = useState({
    serviceName: item?.serviceName || '',
    description: item?.description || '',
    minPrice: item?.minPrice || '',
    maxPrice: item?.maxPrice || '',
    deliveryTime: item?.deliveryTime || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // JSON paylod (Numbers ko safely number mein convert karna)
    const payload = {
      ...form,
      minPrice: Number(form.minPrice),
      maxPrice: Number(form.maxPrice)
    };

    if (isEditMode) {
      updatePricing({ id: item._id, updatedData: payload }, { onSuccess: () => closeModal() });
    } else {
      addPricing(payload, { onSuccess: () => closeModal() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-black">✖</button>
        <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Edit Pricing' : 'Add New Pricing'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Name</label>
            <input required type="text" placeholder="e.g., Kurta Stitching" className="w-full border p-2 rounded mt-1"
              value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea required placeholder="e.g., Simple double stitch layout" className="w-full border p-2 rounded mt-1" rows="2"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Price (Rs)</label>
              <input required type="number" placeholder="1000" className="w-full border p-2 rounded mt-1"
                value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Price (Rs)</label>
              <input required type="number" placeholder="1300" className="w-full border p-2 rounded mt-1"
                value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Delivery Time</label>
            <input required type="text" placeholder="e.g., 3-4 Days" className="w-full border p-2 rounded mt-1"
              value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} />
          </div>

          <button disabled={isPending} type="submit" className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 transition mt-6">
            {isPending ? 'Saving...' : (isEditMode ? 'Update Pricing' : 'Save Pricing')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPricing;