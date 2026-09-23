import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetCustomers, 
  useAddCustomer, 
  useUpdateCustomer, 
  useUpdateMeasurements, 
  useDeleteCustomer,
} from '../hooks/useCustomers';
import { useGetTemplates } from '../hooks/useTemplates';
import { 
  FiPlus, 
  FiSearch, 
  FiX, 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiArrowRight,
  FiExternalLink
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';

const AdminCustomers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Server-side paginated customer fetch
  const { data: customersResponse, isLoading } = useGetCustomers({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchTerm
  });

  const customers = Array.isArray(customersResponse) 
    ? customersResponse 
    : (customersResponse?.data || []);

  const pagination = customersResponse?.pagination || {
    totalRecords: customers.length,
    currentPage: 1,
    totalPages: 1,
    pageSize: PAGE_SIZE
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredCustomers = customers;

  const openFormModal = (customer = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white shadow-sm p-6 relative min-h-[80vh]">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Manage Customers</h2>
          <p className="text-sm text-gray-500 mt-1">Directory of all clients, measurements, orders, and khata balances.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID, name, phone, city..." 
              className="w-full pl-10 pr-8 py-2 border-2 border-gray-100 focus:border-black rounded outline-none text-sm transition"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5 rounded-full"
                title="Clear search"
              >
                <FiX className="text-xs" />
              </button>
            )}
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
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-2">No customers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-[#DFAC43] text-xs uppercase tracking-wider">
                <th className="p-4 rounded-l-xl">ID</th>
                <th className="p-4">Client Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Khata Balance</th>
                <th className="p-4">City / Address</th>
                <th className="p-4 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => {
                const bal = Number(customer.khataBalance) || 0;
                const formattedId = customer.customerNumber ? `#C-${customer.customerNumber}` : `#C-${customer._id.slice(-4).toUpperCase()}`;

                return (
                  <tr key={customer._id} className="hover:bg-gray-50 transition text-sm">
                    {/* CUSTOMER ID */}
                    <td className="p-4 font-black text-gray-900 whitespace-nowrap">
                      <span className="bg-gray-100 border border-gray-200 text-gray-800 text-xs px-2 py-1 rounded-md font-sans">
                        {formattedId}
                      </span>
                    </td>

                    {/* CLIENT NAME & AVATAR */}
                    <td className="p-4 font-bold text-gray-900">
                      <div className="flex items-center gap-3">
                        {customer.profileImage?.url ? (
                          <img
                            src={customer.profileImage.url} 
                            alt={customer.name} 
                            className="w-9 h-9 rounded-full object-cover border border-gray-200" 
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-[#DFAC43] flex items-center justify-center text-xs font-black uppercase">
                            {customer.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-black text-gray-900">{customer.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT & WHATSAPP */}
                    <td className="p-4 text-gray-600 font-medium whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-gray-900">{customer.phone}</p>
                      </div>
                    </td>
                    
                    {/* KHATA BALANCE BADGE */}
                    <td className="p-4 whitespace-nowrap">
                      {bal > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-900 px-2.5 py-1 rounded-md text-xs font-black">
                          <FiAlertTriangle className="text-xs text-red-600" /> Udhar: Rs {bal.toLocaleString()}
                        </span>
                      ) : bal < 0 ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-900 px-2.5 py-1 rounded-md text-xs font-black">
                          <FiCheckCircle className="text-xs text-green-700" /> Credit: Rs {Math.abs(bal).toLocaleString()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold">
                          Settled (Rs 0)
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-gray-600 text-xs max-w-xs truncate">{customer.address || '-'}</td>
                    
                    {/* 2 CLEAN ACTION BUTTONS ONLY: VIEW PROFILE & + NEW ORDER */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* 1. View Profile Button */}
                        <button 
                          onClick={() => navigate(`/admin/customers/${customer._id}`)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-[#0F172A] text-gray-800 hover:text-[#DFAC43] font-bold rounded transition text-xs flex items-center gap-1 border border-gray-200 shadow-sm"
                        >
                          View Profile <FiArrowRight className="text-xs" />
                        </button>

                        {/* 2. New Order Button */}
                        <button 
                          onClick={() => navigate(`/admin/orders/create?customerId=${customer._id}`)}
                          className="px-3 py-1.5 bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] font-black rounded transition text-xs flex items-center gap-1 shadow-sm whitespace-nowrap"
                        >
                          <FiPlus className="text-sm" />  New Order
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SERVER-SIDE PAGINATION */}
      {pagination.totalRecords > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            Showing <span className="font-bold text-gray-800">{Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalRecords)}</span> to <span className="font-bold text-gray-800">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)}</span> of <span className="font-bold text-gray-800">{pagination.totalRecords}</span> clients
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* ADD/EDIT FORM MODAL */}
      {isModalOpen && (
        <CustomerFormModal 
          customer={editingCustomer} 
          closeModal={() => setIsModalOpen(false)} 
        />
      )}
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
    whatsapp: customer?.whatsapp || '',
    city: customer?.city || '',
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
    formData.append('whatsapp', basicInfo.whatsapp);
    formData.append('city', basicInfo.city);
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
                  <label className="block text-xs font-bold text-gray-500 mb-1">Full Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required type="text" name="name" className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none" value={basicInfo.name} onChange={handleBasicInfoChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required type="text" name="phone" className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none" value={basicInfo.phone} onChange={handleBasicInfoChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">WhatsApp Number (Optional)</label>
                  <input type="text" name="whatsapp" placeholder="e.g. 03001234567" className="w-full px-4 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none" value={basicInfo.whatsapp} onChange={handleBasicInfoChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">City / Town</label>
                  <input type="text" name="city" placeholder="e.g. Quetta, Karachi" className="w-full px-4 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none" value={basicInfo.city} onChange={handleBasicInfoChange} />
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
                        <button
                          type="button"
                          onClick={() => setMeasurements(measurements.filter((_, idx) => idx !== catIndex))}
                          className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-0.5 rounded text-xs font-bold transition flex items-center gap-1 border border-red-200"
                        >
                          <FiX /> Remove
                        </button>
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