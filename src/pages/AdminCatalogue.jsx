import React, { useState } from 'react';
import { useGetCatalogue, useDeleteCatalogue, useAddCatalogue, useUpdateCatalogue } from '../hooks/useCatalogue';
import Preloader from '../components/Preloader';

const AdminCatalogue = () => {
  // Tabs aur Form ki state
  const [activeTab, setActiveTab] = useState('Shalwar Qameez');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  // API Hooks
  const { data: catalogueItems, isLoading, isError } = useGetCatalogue();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteCatalogue();

  // Categories list
  const categories = ['Shalwar Qameez', 'Shirts', 'Kurta'];

  // Filtered Data: Sirf us category ka data dikhao jo tab open hai
  const filteredData = catalogueItems?.filter((item) => item.category === activeTab) || [];

  if (isLoading) return <div className="flex justify-center items-center h-full"><Preloader /></div>;
  if (isError) return <div className="text-red-500 text-center py-10">Failed to load catalogue.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {/* HEADER: Title aur Add Button */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Catalogue</h2>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition"
        >
          + Add New Design
        </button>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex space-x-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === cat 
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID: Data Dikhane Ke Liye */}
      {filteredData.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No items found in {activeTab}.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div key={item._id} className="border rounded-lg overflow-hidden shadow-sm group">
              <div className="h-48 overflow-hidden bg-gray-100">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.detail}</p>
                
                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  {/* Update abhi placeholder hai, isey aage chal kar banayenge */}
                 <button 
  onClick={() => setEditingItem(item)} // <-- Yahan click par data state mein bhej diya
  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 bg-blue-50 rounded"
>
  Edit
</button>
                  <button 
                    onClick={() => {
                      if(window.confirm('Are you sure you want to delete this design?')) deleteItem(item._id)
                    }}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM (Agar button click ho toh khule) */}
      {isFormOpen && (
        <AddDesignModal 
          closeModal={() => setIsFormOpen(false)} 
          categories={categories}
        />
      )}
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
const AddDesignModal = ({ closeModal, categories }) => {
  const { mutate: addDesign, isPending } = useAddCatalogue();
  const [form, setForm] = useState({ title: '', detail: '', category: categories[0] });
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!image) return alert("Please select an image!");

    // Image bhejne ke liye FormData LAZMI hai (JSON kaam nahi karega)
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('detail', form.detail);
    formData.append('category', form.category);
    formData.append('image', image); // Yahan asal file ja rahi hai

    // Mutation call karna
    addDesign(formData, {
      onSuccess: () => {
        closeModal(); // Kamyabi par form khud band ho jaye
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-black">✖</button>
        <h2 className="text-xl font-bold mb-4">Add New Design</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input required type="text" className="w-full border p-2 rounded mt-1" 
              value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Detail</label>
            <textarea required className="w-full border p-2 rounded mt-1" rows="3"
              value={form.detail} onChange={(e) => setForm({...form, detail: e.target.value})}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select className="w-full border p-2 rounded mt-1"
              value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Design Image</label>
            {/* type="file" aur onChange mein e.target.files[0] pakarna zaroori hai */}
            <input required type="file" accept="image/*" className="w-full border p-2 rounded mt-1 text-sm"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <button disabled={isPending} type="submit" className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 transition">
            {isPending ? 'Uploading...' : 'Save Design'}
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
  const { mutate: updateDesign, isPending } = useUpdateCatalogue(); // Jo naya hook banaya tha
  
  // Purana data default state mein rakh diya
  const [form, setForm] = useState({ 
    title: item.title, 
    detail: item.detail, 
    category: item.category 
  });
  const [image, setImage] = useState(null); // Nayi image optional hogi

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('detail', form.detail);
    formData.append('category', form.category);
    
    // Agar admin ne nayi image select ki hai, toh wo bhi bhej do, warna backend purani hi rakhega
    if (image) {
      formData.append('image', image);
    }

    updateDesign({ id: item._id, formData }, {
      onSuccess: () => closeModal()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-black">✖</button>
        <h2 className="text-xl font-bold mb-4">Edit Design</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input required type="text" className="w-full border p-2 rounded mt-1" 
              value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Detail</label>
            <textarea required className="w-full border p-2 rounded mt-1" rows="3"
              value={form.detail} onChange={(e) => setForm({...form, detail: e.target.value})}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select className="w-full border p-2 rounded mt-1"
              value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 text-red-500">
              Update Image (Optional)
            </label>
            {/* required nahi lagaya kyunke ho sakta hai admin sirf title change karna chahe */}
            <input type="file" accept="image/*" className="w-full border p-2 rounded mt-1 text-sm"
              onChange={(e) => setImage(e.target.files[0])}
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty to keep the current image.</p>
          </div>

          <button disabled={isPending} type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
            {isPending ? 'Updating...' : 'Update Design'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCatalogue;