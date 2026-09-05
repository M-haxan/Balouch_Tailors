import React, { useState } from 'react';
import { 
  useGetCustomers, 
  useAddCustomer, 
  useUpdateCustomer, 
  useUpdateMeasurements, 
  useDeleteCustomer,
  useGetCustomerLedger,
  useSettleCustomerKhata
} from '../hooks/useCustomers';
import { useGetTemplates } from '../hooks/useTemplates';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiX, 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiEye, 
  FiClock, 
  FiScissors,
  FiBook,
  FiDollarSign,
  FiSend,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminCustomers = () => {
  const { data: customers = [], isLoading } = useGetCustomers();
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // View profile modal
  const [viewingCustomer, setViewingCustomer] = useState(null);

  // NEW: Khata / Ledger modal state
  const [khataCustomer, setKhataCustomer] = useState(null);

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
    <div className="bg-white shadow-sm p-6 relative min-h-[80vh]">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Manage Customers</h2>
          <p className="text-sm text-gray-500 mt-1">Directory of all clients, measurements, and khata balances.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by phone or name..." 
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 focus:border-black outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openFormModal()}
            className="bg-[#DFAC43] text-[#0F172A] hover:bg-[#0F172A] hover:text-[#DFAC43] px-4 py-2 text-sm font-black rounded transition shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <FiPlus className="text-lg" /> Add Customer
          </button>
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Loading customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded">
          <p className="text-gray-500 mb-2">No customers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-[#DFAC43] text-sm uppercase tracking-wider">
                <th className="p-4 rounded-tl">Client Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Khata Balance</th>
                <th className="p-4">Address</th>
                <th className="p-4 rounded-tr text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => {
                const bal = Number(customer.khataBalance) || 0;
                return (
                  <tr key={customer._id} className="hover:bg-gray-50 transition text-sm">
                    <td className="p-4 font-bold text-gray-900">
                      <div className="flex items-center gap-3">
                        {customer.profileImage?.url ? (
                          <img
                            src={customer.profileImage.url} 
                            alt={customer.name} 
                            className="w-8 h-8 rounded-full object-cover border border-gray-200" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-black uppercase">
                            {customer.name[0]}
                          </div>
                        )}
                        <span>{customer.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{customer.phone}</td>
                    
                    {/* KHATA BALANCE BADGE */}
                    <td className="p-4">
                      {bal > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded text-xs font-black">
                          <FiAlertTriangle className="text-xs text-[#DFAC43]" /> Udhar: Rs {bal.toLocaleString()}
                        </span>
                      ) : bal < 0 ? (
                        <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-800 px-2.5 py-1 rounded text-xs font-black">
                          <FiCheckCircle className="text-xs text-gray-700" /> Credit: Rs {Math.abs(bal).toLocaleString()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-xs font-bold">
                          Settled (Rs 0)
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-gray-600 text-sm max-w-xs truncate">{customer.address || '-'}</td>
                    
                    {/* ACTION BUTTONS */}
                    <td className="p-4 flex justify-end gap-1">
                      {/* Khata Ledger Button */}
                      <button 
                        onClick={() => setKhataCustomer(customer)} 
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-[#DFAC43] text-amber-950 hover:text-[#0F172A] font-black rounded transition text-xs flex items-center gap-1 border border-amber-200"
                        title="Khata & Statement"
                      >
                        <FiBook className="text-sm" /> Khata
                      </button>
                      
                      {/* View Measurements */}
                      <button 
                        onClick={() => setViewingCustomer(customer)} 
                        className="p-2 text-[#0F172A] hover:text-[#DFAC43] hover:bg-amber-50 rounded transition text-lg"
                        title="View Measurements"
                      >
                        <FiEye />
                      </button>
                      
                      {/* Edit */}
                      <button onClick={() => openFormModal(customer)} className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded transition text-lg" title="Edit Info">
                        <FiEdit />
                      </button>
                      
                      {/* Delete */}
                      <button onClick={() => handleDelete(customer._id)} disabled={isDeleting} className="p-2 text-red-600 hover:bg-red-50 rounded transition text-lg" title="Delete">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                );
              })}
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

      {/* DETAILED PROFILE VIEW MODAL */}
      {viewingCustomer && (
        <CustomerViewModal 
          customer={viewingCustomer} 
          closeModal={() => setViewingCustomer(null)} 
        />
      )}

      {/* NEW: CUSTOMER KHATA STATEMENT & SETTLEMENT MODAL */}
      {khataCustomer && (
        <CustomerKhataModal
          customer={khataCustomer}
          closeModal={() => setKhataCustomer(null)}
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
            {customer.profileImage?.url ? (
              <img 
                src={customer.profileImage.url} 
                alt={customer.name} 
                className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-[#D4AF37] font-black text-xl shadow-sm">
                {customer.name[0].toUpperCase()}
              </div>
            )}
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
                {customer.cnic && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-[#D4AF37] text-xs font-bold shrink-0">CNIC</span>
                    <span className="font-semibold">{customer.cnic}</span>
                  </div>
                )}
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
    address: customer?.address || '',
    cnic: customer?.cnic || ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [measurements, setMeasurements] = useState(customer?.measurements || []);
  const [selectedTemplateForNew, setSelectedTemplateForNew] = useState('');

  const handleBasicInfoChange = (e) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
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

    const formData = new FormData();
    formData.append('name', basicInfo.name);
    formData.append('phone', basicInfo.phone);
    formData.append('address', basicInfo.address);
    formData.append('cnic', basicInfo.cnic);
    formData.append('measurements', JSON.stringify(measurements));
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    if (isEditMode) {
      updateCustomer({ id: customer._id, data: formData });
      updateMeasurements({ id: customer._id, data: { measurements } }, {
        onSuccess: () => closeModal()
      });
    } else {
      addCustomer(formData, { onSuccess: () => closeModal() });
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
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">CNIC (Optional)</label>
                  <input type="text" name="cnic" placeholder="xxxxx-xxxxxxx-x" className="w-full px-4 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none" value={basicInfo.cnic} onChange={handleBasicInfoChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Profile Photo (Optional)</label>
                  <input type="file" accept="image/*" className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg outline-none text-xs file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-gray-100 hover:file:bg-gray-200" onChange={handleFileChange} />
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

// -------------------------------------------------------------
// COMPONENT: CUSTOMER KHATA STATEMENT & SETTLEMENT MODAL
// -------------------------------------------------------------
const CustomerKhataModal = ({ customer, closeModal }) => {
  const { data: ledgerData, isLoading } = useGetCustomerLedger(customer._id);
  const { mutate: settleKhata, isPending: isSettling } = useSettleCustomerKhata();

  const [settleForm, setSettleForm] = useState({
    type: 'payment',
    amount: '',
    description: ''
  });

  const khataBalance = ledgerData ? ledgerData.khataBalance : (customer.khataBalance || 0);
  const entries = ledgerData?.entries || [];

  const handleSettleSubmit = (e) => {
    e.preventDefault();
    if (!settleForm.amount || Number(settleForm.amount) <= 0) {
      toast.error('Baraye meherbani durust raqam darj karein.');
      return;
    }

    settleKhata({
      customerId: customer._id,
      data: {
        type: settleForm.type,
        amount: Number(settleForm.amount),
        description: settleForm.description || (settleForm.type === 'payment' ? 'Counter Cash Received' : 'Khata Settlement')
      }
    }, {
      onSuccess: () => {
        setSettleForm({ type: 'payment', amount: '', description: '' });
      }
    });
  };

  const handleShareWhatsApp = () => {
    const phone = customer.phone ? customer.phone.toString() : '';
    const cleanPhone = phone.startsWith('0') ? '92' + phone.slice(1) : phone;
    
    let balanceText = '';
    if (khataBalance > 0) {
      balanceText = `Aapki taraf Baqiya Udhar: Rs ${khataBalance.toLocaleString()} (Payable to shop).`;
    } else if (khataBalance < 0) {
      balanceText = `Aapka Jama Advance Credit: Rs ${Math.abs(khataBalance).toLocaleString()} (Shop owes you).`;
    } else {
      balanceText = `Aapka hisaab kitab bilkul clear hai (Rs 0).`;
    }

    const message = `*BALOUCH TAILORS - KHATA STATEMENT*\nMohtaram *${customer.name}* Sahab,\n\n${balanceText}\n\nDate: ${new Date().toLocaleDateString()}\nShukriya!\n*Balouch Tailors*`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-black text-lg">
              <FiBook />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{customer.name} - Khata Statement (کھاتہ)</h2>
              <p className="text-xs text-gray-400 font-medium">Phone: {customer.phone} | Address: {customer.address || '-'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-black px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <FiSend className="text-sm" /> WhatsApp Statement
            </button>
            <button onClick={closeModal} className="text-gray-400 hover:text-white p-2 text-xl font-bold">✕</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Running Balance Banner */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
            khataBalance > 0 
              ? 'bg-red-50/70 border-red-200 text-red-900' 
              : khataBalance < 0 
              ? 'bg-green-50/70 border-green-200 text-green-900' 
              : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">Current Khata Status (موجودہ بقایا)</span>
              <p className="text-2xl font-black font-sans mt-0.5">
                {khataBalance > 0 ? (
                  <span className="text-red-700">🔴 Customer Owes: Rs {khataBalance.toLocaleString()} (Udhar)</span>
                ) : khataBalance < 0 ? (
                  <span className="text-green-700">🟢 Customer Credit: Rs {Math.abs(khataBalance).toLocaleString()} (Jama Advance)</span>
                ) : (
                  <span className="text-gray-600">⚪ Fully Settled (Rs 0)</span>
                )}
              </p>
            </div>

            <div className="text-xs font-medium text-gray-600 max-w-xs">
              {khataBalance > 0 && "⚠️ Grahak ne pichla udhar ada karna hai. Naye bill me khud adjust ho sakta hai."}
              {khataBalance < 0 && "✅ Grahak ki taraf se ziada raqam jama hai. Naye bill se minus ho sakti hai."}
              {khataBalance === 0 && "Dukan aur grahak ka hisaab bilkul barabar hai."}
            </div>
          </div>

          {/* Direct Settlement Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <FiDollarSign className="text-[#D4AF37]" /> Record Payment / Settlement on Counter (کھاتہ ادائیگی یا واپسی)
            </h3>

            <form onSubmit={handleSettleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Transaction Type</label>
                <select
                  value={settleForm.type}
                  onChange={(e) => setSettleForm({ ...settleForm, type: e.target.value })}
                  className="w-full bg-white border-2 border-gray-200 focus:border-black rounded-xl p-2.5 text-xs font-bold outline-none"
                >
                  <option value="payment">Payment Received (کیش وصولی)</option>
                  <option value="refund">Refund Given (رقم واپسی)</option>
                  <option value="debit">Add Manual Debt (ادھار شامل کریں)</option>
                  <option value="credit">Add Manual Credit (رعایت / جمع)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Amount (Rs)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 500"
                  value={settleForm.amount}
                  onChange={(e) => setSettleForm({ ...settleForm, amount: e.target.value })}
                  className="w-full bg-white border-2 border-gray-200 focus:border-black rounded-xl p-2.5 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Notes / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Cash received on counter"
                  value={settleForm.description}
                  onChange={(e) => setSettleForm({ ...settleForm, description: e.target.value })}
                  className="w-full bg-white border-2 border-gray-200 focus:border-black rounded-xl p-2.5 text-xs font-medium outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSettling}
                  className="w-full bg-black hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black font-black p-2.5 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
                >
                  {isSettling ? 'Saving...' : 'Post Entry'}
                </button>
              </div>
            </form>
          </div>

          {/* Statement Timeline Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
              Transaction History Statement ({entries.length})
            </h3>

            {isLoading ? (
              <div className="text-center py-8 text-xs text-gray-400">Loading ledger statement...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                No past transactions recorded yet for this customer.
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Description & Ref</th>
                      <th className="p-3 text-right">Debit (+)</th>
                      <th className="p-3 text-right">Credit (-)</th>
                      <th className="p-3 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {entries.map((entry) => (
                      <tr key={entry._id} className="hover:bg-gray-50/80 transition font-medium">
                        <td className="p-3 text-gray-500 whitespace-nowrap">
                          {new Date(entry.date || entry.createdAt).toLocaleDateString()} {new Date(entry.date || entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3 font-semibold text-gray-800">
                          {entry.description}
                          {entry.orderNumber && (
                            <span className="ml-2 bg-black text-[#D4AF37] px-2 py-0.5 rounded text-[10px] font-black">
                              #BT-{entry.orderNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-black text-red-600 font-sans">
                          {entry.type === 'debit' ? `+ Rs ${entry.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3 text-right font-black text-green-600 font-sans">
                          {entry.type === 'credit' || entry.type === 'payment' ? `- Rs ${entry.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3 text-right font-black font-sans">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            entry.runningBalance > 0 ? 'text-red-700 bg-red-50' :
                            entry.runningBalance < 0 ? 'text-green-700 bg-green-50' :
                            'text-gray-700 bg-gray-100'
                          }`}>
                            Rs {entry.runningBalance.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={closeModal}
            className="bg-black hover:bg-gray-900 text-white font-bold px-6 py-2 rounded-xl text-xs transition"
          >
            Close Statement
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminCustomers;