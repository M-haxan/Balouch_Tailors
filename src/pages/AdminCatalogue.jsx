import React, { useState } from 'react';
import { useGetCatalogue, useDeleteCatalogue, useAddCatalogue, useUpdateCatalogue } from '../hooks/useCatalogue';
import Preloader from '../components/Preloader';
import { FiX, FiPlus, FiEdit, FiTrash2, FiMaximize2, FiLayers } from 'react-icons/fi';

const AdminCatalogue = () => {
  // Tabs aur Form ki state
  const [activeTab, setActiveTab] = useState('Shalwar Qameez');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // API Hooks
  const { data: catalogueItems = [], isLoading, isError } = useGetCatalogue();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteCatalogue();

  // Categories list (3 Core Categories)
  const categories = ['Shalwar Qameez', 'Kurta', 'Shirts'];

  // Filtered Data: Sirf us category ka data dikhao jo tab open hai
  const filteredData = catalogueItems.filter((item) => item.category === activeTab);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Preloader /></div>;
  if (isError) return <div className="text-red-500 text-center py-10 font-bold">Failed to load catalogue.</div>;

  return (
    <div className="bg-white rounded shadow-sm p-4 sm:p-6 relative space-y-6">
      {/* HEADER: Title aur Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#0F172A] text-[#DFAC43] flex items-center justify-center font-bold">
              <FiLayers className="text-lg" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Manage Design Catalogue</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Upload and organize suit/kurta/shirt design photos across the 3 categories for the slider and gallery.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] px-4 py-2.5 rounded text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-sm"
        >
          <FiPlus className="text-base" />
          Add New Design / Vol
        </button>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex items-center gap-2 sm:gap-3 p-1.5 bg-gray-100 rounded-lg max-w-md border border-gray-200">
        {categories.map((cat) => {
          const count = catalogueItems.filter(item => item.category === cat).length;
          const isActive = activeTab === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex-1 py-2 px-3 rounded text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm'
                  : 'text-gray-600 hover:text-black hover:bg-white/70'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                isActive ? 'bg-[#DFAC43] text-black' : 'bg-gray-200 text-gray-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* GRID: Data Dikhane Ke Liye */}
      {filteredData.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded border border-dashed border-gray-300">
          <FiLayers className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-600 font-bold text-sm">No designs found in {activeTab}.</p>
          <p className="text-gray-400 text-xs mt-1">Click the "+ Add New Design / Vol" button above to upload pictures.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {filteredData.map((item, index) => {
            const volTitle = item.title?.includes('Vol') 
              ? item.title 
              : (item.title ? `${item.title}` : `Vol. ${String(index + 1).padStart(2, '0')}`);

            return (
              <div key={item._id} className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={volTitle}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
                    {volTitle}
                  </div>
                </div>

                <div className="p-3 bg-white flex flex-col flex-grow justify-between gap-2 border-t border-gray-100">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">{volTitle}</h3>
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase">{item.category}</span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex justify-end gap-1.5 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-gray-700 hover:text-black text-xs font-bold px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center gap-1"
                    >
                      <FiEdit className="text-xs" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${volTitle}?`)) {
                          deleteItem(item._id);
                        }
                      }}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-800 text-xs font-bold px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition flex items-center gap-1"
                    >
                      <FiTrash2 className="text-xs" /> Del
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD MODAL */}
      {isFormOpen && (
        <AddDesignModal
          closeModal={() => setIsFormOpen(false)}
          categories={categories}
          defaultCategory={activeTab}
        />
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <EditDesignModal
          item={editingItem}
          closeModal={() => setEditingItem(null)}
          categories={categories}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// ADD DESIGN MODAL (Pop-up Form)
// -------------------------------------------------------------
const AddDesignModal = ({ closeModal, categories, defaultCategory }) => {
  const { mutate: addDesign, isPending } = useAddCatalogue();
  const [form, setForm] = useState({ 
    title: '', 
    detail: 'Custom Tailored Design', 
    category: defaultCategory || categories[0] 
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!image) return alert("Please select a design image!");

    const finalTitle = form.title.trim() || `Vol. Design`;

    const formData = new FormData();
    formData.append('title', finalTitle);
    formData.append('detail', form.detail || 'Custom Tailored Design');
    formData.append('category', form.category);
    formData.append('image', image);

    addDesign(formData, {
      onSuccess: () => {
        closeModal();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded shadow-xl w-full max-w-md relative">
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-black p-1 transition">
          <FiX className="text-lg" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Design Image</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Volume Title (e.g. Vol. 01, Vol. 02) *
            </label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Vol. 01" 
              className="w-full border border-gray-300 p-2 rounded text-sm focus:border-[#DFAC43] outline-none font-medium"
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Category *
            </label>
            <select 
              className="w-full border border-gray-300 p-2 rounded text-sm focus:border-[#DFAC43] outline-none font-medium"
              value={form.category} 
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Design Image *
            </label>
            <input 
              required 
              type="file" 
              accept="image/*" 
              className="w-full border border-gray-300 p-2 rounded text-xs bg-gray-50 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#0F172A] file:text-white hover:file:bg-[#DFAC43] hover:file:text-black cursor-pointer"
              onChange={handleImageChange}
            />
            <p className="text-[11px] text-gray-500 mt-1 font-medium">
              Recommended: <strong className="text-gray-800">3:4 Portrait Ratio</strong> (e.g. <span className="text-[#DFAC43] font-bold">750 × 1000 px</span> or <span className="text-[#DFAC43] font-bold">600 × 800 px</span>).
            </p>
            {imagePreview && (
              <div className="mt-2 w-20 h-24 rounded border overflow-hidden bg-gray-100">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <button 
            disabled={isPending} 
            type="submit" 
            className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] p-2.5 rounded font-bold text-sm transition mt-6"
          >
            {isPending ? 'Uploading to Slider...' : 'Upload & Save Design'}
          </button>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// EDIT DESIGN MODAL (Pop-up Form)
// -------------------------------------------------------------
const EditDesignModal = ({ item, closeModal, categories }) => {
  const { mutate: updateDesign, isPending } = useUpdateCatalogue();

  const [form, setForm] = useState({
    title: item.title,
    detail: item.detail || 'Custom Tailored Design',
    category: item.category
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(item.imageUrl || '');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', form.title.trim() || 'Vol. Design');
    formData.append('detail', form.detail || 'Custom Tailored Design');
    formData.append('category', form.category);

    if (image) {
      formData.append('image', image);
    }

    updateDesign({ id: item._id, formData }, {
      onSuccess: () => closeModal()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded shadow-xl w-full max-w-md relative">
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-black p-1 transition">
          <FiX className="text-lg" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Design</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Volume Title *
            </label>
            <input 
              required 
              type="text" 
              className="w-full border border-gray-300 p-2 rounded text-sm focus:border-[#DFAC43] outline-none font-medium"
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Category *
            </label>
            <select 
              className="w-full border border-gray-300 p-2 rounded text-sm focus:border-[#DFAC43] outline-none font-medium"
              value={form.category} 
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Replace Image (Optional)
            </label>
            <input 
              type="file" 
              accept="image/*" 
              className="w-full border border-gray-300 p-2 rounded text-xs bg-gray-50 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#0F172A] file:text-white hover:file:bg-[#DFAC43] hover:file:text-black cursor-pointer"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="mt-2 w-20 h-24 rounded border overflow-hidden bg-gray-100">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <button 
            disabled={isPending} 
            type="submit" 
            className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] p-2.5 rounded font-bold text-sm transition mt-6"
          >
            {isPending ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCatalogue;