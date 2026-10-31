import React, { useState } from 'react';
import { 
  useAddCustomer, 
  useUpdateCustomer, 
  useUpdateMeasurements 
} from '../hooks/useCustomers';
import { useGetTemplates } from '../hooks/useTemplates';
import { 
  FiX, 
  FiUser, 
  FiPhone, 
  FiMapPin 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { formatPhone } from '../utils/formatters';

const CustomerFormModal = ({ customer, closeModal }) => {
  const { data: templates = [] } = useGetTemplates();
  const { mutate: addCustomer, isPending: isAdding } = useAddCustomer();
  const { mutate: updateCustomer, isPending: isUpdatingInfo } = useUpdateCustomer();
  const { mutate: updateMeasurements, isPending: isUpdatingMeas } = useUpdateMeasurements();
  
  const isEditMode = Boolean(customer);
  const isPending = isAdding || isUpdatingInfo || isUpdatingMeas;

  const [basicInfo, setBasicInfo] = useState({
    name: customer?.name || '',
    phone: customer?.phone ? formatPhone(customer.phone) : '',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative flex flex-col max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-base sm:text-xl font-black text-black">
            {isEditMode ? `Edit Profile: ${customer.name}` : 'New Customer Profile'}
          </h2>
          <button onClick={closeModal} className="p-1.5 sm:p-2 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-200 cursor-pointer">
            <FiX className="text-lg sm:text-xl" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          <form id="customerForm" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-xs sm:text-sm font-bold tracking-widest text-[#D4AF37] uppercase mb-3 sm:mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Full Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required type="text" name="name" className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none text-xs sm:text-sm" value={basicInfo.name} onChange={handleBasicInfoChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required type="text" name="phone" className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none text-xs sm:text-sm" value={basicInfo.phone} onChange={handleBasicInfoChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">WhatsApp Number (Optional)</label>
                  <input type="text" name="whatsapp" placeholder="e.g. 03001234567" className="w-full px-3.5 sm:px-4 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none text-xs sm:text-sm" value={basicInfo.whatsapp} onChange={handleBasicInfoChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">City / Town</label>
                  <input type="text" name="city" placeholder="e.g. Quetta, Karachi" className="w-full px-3.5 sm:px-4 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none text-xs sm:text-sm" value={basicInfo.city} onChange={handleBasicInfoChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">CNIC (Optional)</label>
                  <input type="text" name="cnic" placeholder="xxxxx-xxxxxxx-x" className="w-full px-3.5 sm:px-4 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none text-xs sm:text-sm" value={basicInfo.cnic} onChange={handleBasicInfoChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Profile Photo (Optional)</label>
                  <input type="file" accept="image/*" className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg outline-none text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:bg-gray-100 hover:file:bg-gray-200" onChange={handleFileChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Address (Optional)</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                    <textarea name="address" rows="2" className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none text-xs sm:text-sm" value={basicInfo.address} onChange={handleBasicInfoChange}></textarea>
                  </div>
                </div>
              </div>
            </div>
            <hr className="border-gray-100" />
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
                <h3 className="text-xs sm:text-sm font-bold tracking-widest text-[#D4AF37] uppercase">Measurements</h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select 
                    value={selectedTemplateForNew} 
                    onChange={(e) => setSelectedTemplateForNew(e.target.value)} 
                    className="flex-1 sm:flex-initial min-w-0 border-2 border-gray-200 focus:border-black rounded-lg px-2.5 py-1.5 text-xs sm:text-sm outline-none bg-white font-medium"
                  >
                    <option value="">Select Template...</option>
                    {templates.map(t => <option key={t._id} value={t.categoryname}>{t.categoryname}</option>)}
                  </select>
                  <button 
                    type="button" 
                    onClick={handleAddMeasurementCategory} 
                    className="bg-[#0F172A] text-[#DFAC43] hover:text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-gray-800 transition shrink-0 cursor-pointer shadow-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
              {measurements.length === 0 ? (
                <div className="text-center p-5 sm:p-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-xs sm:text-sm font-medium">No measurements added yet.</div>
              ) : (
                <div className="space-y-4">
                  {measurements.map((meas, catIndex) => (
                    <div key={catIndex} className="bg-gray-50 border border-gray-200 p-3.5 sm:p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-3 sm:mb-4 border-b border-gray-200 pb-2">
                        <h4 className="font-black text-black text-xs sm:text-sm uppercase">{meas.category}</h4>
                        <button
                          type="button"
                          onClick={() => setMeasurements(measurements.filter((_, idx) => idx !== catIndex))}
                          className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-0.5 rounded text-[11px] sm:text-xs font-bold transition flex items-center gap-1 border border-red-200 cursor-pointer"
                        >
                          <FiX /> Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                        {Object.keys(meas.data).map((field, fieldIndex) => (
                          <div key={fieldIndex}>
                            <label className="block text-[11px] sm:text-xs font-bold text-gray-500 mb-1">{field}</label>
                            <input type="text" className="w-full border border-gray-300 focus:border-[#D4AF37] px-2 py-1.5 rounded outline-none text-xs sm:text-sm font-bold bg-white" value={meas.data[field]} onChange={(e) => handleMeasurementDataChange(catIndex, field, e.target.value)} />
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
        <div className="p-3.5 sm:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex justify-end gap-2.5 sm:gap-3">
          <button type="button" onClick={closeModal} className="px-4 sm:px-6 py-2 text-xs sm:text-sm text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition cursor-pointer">Cancel</button>
          <button type="submit" form="customerForm" disabled={isPending} className="bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] px-5 sm:px-8 py-2 text-xs sm:text-sm font-black rounded-lg transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50">
            {isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerFormModal;
