import React, { useState } from 'react';
import { 
  useGetCustomers, 
  useAddCustomer, 
  useUpdateCustomer, 
  useUpdateMeasurements, 
  useDeleteCustomer 
} from '../hooks/useCustomers';
import { useGetTemplates } from '../hooks/useTemplates';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX, FiUser, FiPhone, FiMapPin, FiEye, FiClock, FiScissors } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminCustomers = () => {
  const { data: customers = [], isLoading } = useGetCustomers();
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // NEW STATE: View profile ke liye
  const [viewingCustomer, setViewingCustomer] = useState(null);

  // Search Logic
  const filteredCustomers = customers.filter(c => {
    const phoneStr = c.phone ? c.phone.toString() : '';
    const nameStr = c.name ? c.name.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    return phoneStr.includes(search) || nameStr.includes(search);
  });

  const openFormModal = (customer = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative min-h-[80vh]">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Manage Customers</h2>
          <p className="text-sm text-gray-500 mt-1">Directory of all clients and their records.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by phone or name..." 
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 focus:border-black rounded-lg outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openFormModal()}
            className="bg-[#D4AF37] text-black hover:bg-black hover:text-[#D4AF37] px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <FiPlus className="text-lg" /> Add Customer
          </button>
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Loading customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-2">No customers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-[#D4AF37] text-sm uppercase tracking-wider">
                <th className="p-4 rounded-tl-lg">Client Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Address</th>
                <th className="p-4 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-900">{customer.name}</td>
                  <td className="p-4 text-gray-600">{customer.phone}</td>
                  <td className="p-4 text-gray-600 text-sm max-w-xs truncate">{customer.address || '-'}</td>
                  <td className="p-4 flex justify-end gap-1">
                    {/* 1. Naya View Button Lagaya */}
                    <button 
                      onClick={() => setViewingCustomer(customer)} 
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition text-lg"
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    <button onClick={() => openFormModal(customer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-lg" title="Edit Info">
                      <FiEdit />
                    </button>
                    <button onClick={() => handleDelete(customer._id)} disabled={isDeleting} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition text-lg" title="Delete">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD/EDIT FORM MODAL */}
      {isModalOpen && (
        <CustomerFormModal 
          customer={editingCustomer} 
          closeModal={() => setIsModalOpen(false)} 
        />
      )}

      {/* 2. NAYA DETAILED PROFILE VIEW MODAL */}
      {viewingCustomer && (
        <CustomerViewModal 
          customer={viewingCustomer} 
          closeModal={() => setViewingCustomer(null)} 
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// NAYA COMPONENT: CUSTOMER VIEW MODAL (Details & History & Dropdown)
// -------------------------------------------------------------
const CustomerViewModal = ({ customer, closeModal }) => {
  const { data: templates = [] } = useGetTemplates();
  const [selectedCategory, setSelectedCategory] = useState('Shalwar Kameez');

  // Find selected measurement from customer data
  const currentMeasurement = customer.measurements?.find(
    m => m.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-[#D4AF37] font-black text-xl shadow-sm">
              {customer.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-black">{customer.name}</h2>
              <p className="text-xs text-gray-500 font-medium">Customer Profile Insights</p>
            </div>
          </div>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-200">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content Body (Scrollable Split View) */}
        <div className="overflow-y-auto p-6 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 bg-gray-50/30">
          
          {/* Left Column: Basic Info & Suit History (4 Columns wide) */}
          <div className="md:col-span-5 space-y-6">
            {/* Contact Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <FiPhone className="text-[#D4AF37] text-base shrink-0" />
                  <span className="font-semibold">{customer.phone}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <FiMapPin className="text-[#D4AF37] text-base shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{customer.address || 'No address provided'}</span>
                </div>
              </div>
            </div>

            {/* Suit Order History Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-3">
                <FiClock className="text-black text-lg" />
                <h3 className="text-sm font-bold text-black uppercase tracking-wider">Stitching History</h3>
              </div>
              {/* Abhi orders backend banna hai toh placeholder summary count show karega */}
              <div className="py-4 text-center">
                <p className="text-4xl font-black text-black mb-1">0</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Total Suits Stitched</p>
              </div>
              <div className="text-center text-xs text-gray-400 bg-gray-50 py-2 rounded-lg">
                No previous order data recorded yet.
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Measurement Viewer (7 Columns wide) */}
          <div className="md:col-span-7 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FiScissors className="text-[#D4AF37]" />
                <h3 className="font-black text-base text-black uppercase tracking-wide">Measurement Specs</h3>
              </div>
              
              {/* DROPDOWN TO SELECT CATEGORY */}
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border-2 w-50 border-gray-200 rounded-lg p-2 text-sm outline-none font-bold bg-white focus:border-black transition"
              >
                {/* Agar templates db se aa rahay hain toh wahan se map karega warna default fallback list */}
                {templates.length > 0 ? (
                  templates.map(t => <option key={t._id} value={t.categoryname}>{t.categoryname}</option>)
                ) : (
                  <>
                    <option value="Shalwar Kameez">Shalwar Kameez</option>
                    <option value="Shirt">Shirt</option>
                    <option value="Kurta">Kurta</option>
                  </>
                )}
              </select>
            </div>

            {/* MEASUREMENT CONTENT CARD */}
            <div className="flex-1 flex flex-col justify-center">
              {currentMeasurement ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.keys(currentMeasurement.data).map((field, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-center hover:border-black transition">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight mb-1">{field}</p>
                        <p className="text-lg font-black text-black">{currentMeasurement.data[field] || '-'}</p>
                      </div>
                    ))}
                  </div>
                  {currentMeasurement.lastUpdated && (
                    <p className="text-[11px] text-gray-400 text-right italic pt-2">
                      Last modified: {new Date(currentMeasurement.lastUpdated).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                /* DROPDOWN CATEGORY NOT FOUND MESSAGE */
                <div className="text-center py-12 px-4 bg-red-50/50 border-2 border-dashed border-red-100 rounded-xl text-red-600 animate-fade-in">
                  <p className="font-bold text-sm">Yeh measurement available nahi hai.</p>
                  <p className="text-xs text-red-400 mt-1">Is customer ke liye abhi tak {selectedCategory} ka size add nahi kiya gaya.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button onClick={closeModal} className="bg-black hover:bg-gray-900 text-[#D4AF37] px-6 py-2 rounded-lg text-sm font-bold transition shadow-md">
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};


// -------------------------------------------------------------
// ORIGINAL CUSTOMER FORM MODAL (Kept Exactly Same for Layout/Logic)
// -------------------------------------------------------------
const CustomerFormModal = ({ customer, closeModal }) => {
  const { data: templates = [] } = useGetTemplates();
  const { mutate: addCustomer, isPending: isAdding } = useAddCustomer();
  const { mutate: updateCustomer, isPending: isUpdatingInfo } = useUpdateCustomer();
  const { mutate: updateMeasurements, isPending: isUpdatingMeas } = useUpdateMeasurements();
  
  const isEditMode = Boolean(customer);
  const isPending = isAdding || isUpdatingInfo || isUpdatingMeas;

  const [basicInfo, setBasicInfo] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || ''
  });

  const [measurements, setMeasurements] = useState(customer?.measurements || []);
  const [selectedTemplateForNew, setSelectedTemplateForNew] = useState('');

  const handleBasicInfoChange = (e) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  const handleAddMeasurementCategory = () => {
    if (!selectedTemplateForNew) return;
    if (measurements.some(m => m.category === selectedTemplateForNew)) {
      toast.warning("This measurement category is already added!");
      return;
    }
    const template = templates.find(t => t.categoryname === selectedTemplateForNew);
    const emptyData = {};
    template.fields.forEach(field => { emptyData[field] = ''; });
    setMeasurements([...measurements, { category: selectedTemplateForNew, data: emptyData }]);
    setSelectedTemplateForNew('');
  };

  const handleMeasurementDataChange = (catIndex, field, value) => {
    const updatedMeasurements = [...measurements];
    updatedMeasurements[catIndex].data[field] = value;
    setMeasurements(updatedMeasurements);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      updateCustomer({ id: customer._id, data: basicInfo });
      updateMeasurements({ id: customer._id, data: { measurements } }, {
        onSuccess: () => closeModal()
      });
    } else {
      const payload = { ...basicInfo, measurements };
      addCustomer(payload, { onSuccess: () => closeModal() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative flex flex-col max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-black text-black">
            {isEditMode ? `Edit Profile: ${customer.name}` : 'New Customer Profile'}
          </h2>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-200">
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">
          <form id="customerForm" onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required type="text" name="name" className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none" value={basicInfo.name} onChange={handleBasicInfoChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required type="text" name="phone" className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none" value={basicInfo.phone} onChange={handleBasicInfoChange} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Address (Optional)</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                    <textarea name="address" rows="2" className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none" value={basicInfo.address} onChange={handleBasicInfoChange}></textarea>
                  </div>
                </div>
              </div>
            </div>
            <hr className="border-gray-100" />
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase">Measurements</h3>
                <div className="flex gap-2">
                  <select value={selectedTemplateForNew} onChange={(e) => setSelectedTemplateForNew(e.target.value)} className="border-2 border-gray-200 rounded-lg px-2 py-1 text-sm outline-none">
                    <option value="">Select Template...</option>
                    {templates.map(t => <option key={t._id} value={t.categoryname}>{t.categoryname}</option>)}
                  </select>
                  <button type="button" onClick={handleAddMeasurementCategory} className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-800 transition">Add</button>
                </div>
              </div>
              {measurements.length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">No measurements added yet.</div>
              ) : (
                <div className="space-y-4">
                  {measurements.map((meas, catIndex) => (
                    <div key={catIndex} className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                        <h4 className="font-black text-black uppercase">{meas.category}</h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.keys(meas.data).map((field, fieldIndex) => (
                          <div key={fieldIndex}>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{field}</label>
                            <input type="text" className="w-full border border-gray-300 focus:border-[#D4AF37] px-2 py-1.5 rounded outline-none text-sm font-bold" value={meas.data[field]} onChange={(e) => handleMeasurementDataChange(catIndex, field, e.target.value)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex justify-end gap-3">
          <button type="button" onClick={closeModal} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition">Cancel</button>
          <button type="submit" form="customerForm" disabled={isPending} className="bg-[#D4AF37] hover:bg-black text-black hover:text-[#D4AF37] px-8 py-2 font-black rounded-lg transition shadow-md flex items-center gap-2">
            {isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;