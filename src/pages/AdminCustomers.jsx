import React, { useState, useMemo } from 'react';
import { 
  useGetCustomers, 
  useAddCustomer, 
  useUpdateCustomer, 
  useUpdateMeasurements, 
  useDeleteCustomer 
} from '../hooks/useCustomers';
import { useGetTemplates } from '../hooks/useTemplates';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminCustomers = () => {
  const { data: customers = [], isLoading } = useGetCustomers();
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

 const filteredCustomers = customers.filter(c => {
    // Phone aur Name ko safely string mein convert kiya
    const phoneStr = c.phone ? c.phone.toString() : '';
    const nameStr = c.name ? c.name.toLowerCase() : '';
    const search = searchTerm.toLowerCase();

    return phoneStr.includes(search) || nameStr.includes(search);
  });
  const openModal = (customer = null) => {
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
          <p className="text-sm text-gray-500 mt-1">Directory of all clients and their measurements.</p>
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
            onClick={() => openModal()}
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
                <th className="p-4 text-center">Measurements</th>
                <th className="p-4 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-900">{customer.name}</td>
                  <td className="p-4 text-gray-600">{customer.phone}</td>
                  <td className="p-4 text-gray-600 text-sm max-w-xs truncate">{customer.address || '-'}</td>
                  <td className="p-4 text-center">
                    <span className="bg-gray-200 text-gray-800 text-xs font-bold px-2 py-1 rounded-full">
                      {customer.measurements?.length || 0} Categories
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => openModal(customer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <FiEdit />
                    </button>
                    <button onClick={() => handleDelete(customer._id)} disabled={isDeleting} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CUSTOMER MODAL */}
      {isModalOpen && (
        <CustomerModal 
          customer={editingCustomer} 
          closeModal={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// CUSTOMER MODAL (Dynamic Form & Overwrite Logic)
// -------------------------------------------------------------
const CustomerModal = ({ customer, closeModal }) => {
  const { data: templates = [] } = useGetTemplates();
  const { mutate: addCustomer, isPending: isAdding } = useAddCustomer();
  const { mutate: updateCustomer, isPending: isUpdatingInfo } = useUpdateCustomer();
  const { mutate: updateMeasurements, isPending: isUpdatingMeas } = useUpdateMeasurements();
  
  const isEditMode = Boolean(customer);
  const isPending = isAdding || isUpdatingInfo || isUpdatingMeas;

  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || ''
  });

  // Measurements Array State (Poori array replace hogi backend par)
  const [measurements, setMeasurements] = useState(customer?.measurements || []);
  const [selectedTemplateForNew, setSelectedTemplateForNew] = useState('');

  // Handle Basic Info changes
  const handleBasicInfoChange = (e) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  // Add a new empty measurement category block to the array
  const handleAddMeasurementCategory = () => {
    if (!selectedTemplateForNew) return;
    
    // Check if category already exists in current state
    if (measurements.some(m => m.category === selectedTemplateForNew)) {
      toast.warning("This measurement category is already added!");
      return;
    }

    const template = templates.find(t => t.categoryname === selectedTemplateForNew);
    const emptyData = {};
    template.fields.forEach(field => { emptyData[field] = ''; }); // Sab fields khali bana do

    setMeasurements([...measurements, { category: selectedTemplateForNew, data: emptyData }]);
    setSelectedTemplateForNew(''); // reset dropdown
  };

  // Update specific measurement field (e.g., Length -> 40)
  const handleMeasurementDataChange = (catIndex, field, value) => {
    const updatedMeasurements = [...measurements];
    updatedMeasurements[catIndex].data[field] = value;
    setMeasurements(updatedMeasurements);
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      // Edit Mode: Do calls if needed (1 for Basic, 1 for Measurements)
      updateCustomer({ id: customer._id, data: basicInfo });
      // Hum poora measurements array bhej rahe hain taake API usay theek se Overwrite kare
      updateMeasurements({ id: customer._id, data: { measurements } }, {
        onSuccess: () => closeModal()
      });
    } else {
      // Add Mode: Ek hi payload mein sab bhej do
      const payload = { ...basicInfo, measurements };
      addCustomer(payload, { onSuccess: () => closeModal() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-black text-black">
            {isEditMode ? `Edit Profile: ${customer.name}` : 'New Customer Profile'}
          </h2>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-200">
            <FiX className="text-xl" />
          </button>
        </div>
        
        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto p-6 flex-1">
          <form id="customerForm" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. BASIC INFO SECTION */}
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

            {/* 2. MEASUREMENTS SECTION */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase">Measurements</h3>
                
                {/* Dropdown to add a new category block */}
                <div className="flex gap-2">
                  <select 
                    value={selectedTemplateForNew} 
                    onChange={(e) => setSelectedTemplateForNew(e.target.value)}
                    className="border-2 border-gray-200 rounded-lg px-2 py-1 text-sm outline-none"
                  >
                    <option value="">Select Template...</option>
                    {templates.map(t => <option key={t._id} value={t.categoryname}>{t.categoryname}</option>)}
                  </select>
                  <button 
                    type="button" 
                    onClick={handleAddMeasurementCategory}
                    className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-800 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Render dynamic measurement blocks */}
              {measurements.length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
                  No measurements added yet. Select a template above to add one.
                </div>
              ) : (
                <div className="space-y-4">
                  {measurements.map((meas, catIndex) => (
                    <div key={catIndex} className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                        <h4 className="font-black text-black uppercase">{meas.category}</h4>
                        {meas.lastUpdated && <span className="text-xs text-gray-400">Last updated: {new Date(meas.lastUpdated).toLocaleDateString()}</span>}
                      </div>
                      
                      {/* MAGIC HAPPENS HERE: Dynamic inputs mapped from object keys */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.keys(meas.data).map((field, fieldIndex) => (
                          <div key={fieldIndex}>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{field}</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 focus:border-[#D4AF37] px-2 py-1.5 rounded outline-none text-sm font-bold"
                              value={meas.data[field]} 
                              onChange={(e) => handleMeasurementDataChange(catIndex, field, e.target.value)}
                            />
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

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex justify-end gap-3">
          <button type="button" onClick={closeModal} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition">
            Cancel
          </button>
          <button 
            type="submit" 
            form="customerForm"
            disabled={isPending} 
            className="bg-[#D4AF37] hover:bg-black text-black hover:text-[#D4AF37] px-8 py-2 font-black rounded-lg transition shadow-md disabled:opacity-70 flex items-center gap-2"
          >
            {isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminCustomers;