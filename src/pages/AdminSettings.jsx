import React, { useState } from 'react';
import { 
  useGetTemplates, 
  useAddTemplates, 
  useUpdateTemplates, 
  useDeleteTemplates 
} from '../hooks/useTemplates';
import { 
  useGetTailoringServices, 
  useAddTailoringService, 
  useUpdateTailoringService, 
  useDeleteTailoringService 
} from '../hooks/useTailoringServices';
import { 
  useGetShopSettings, 
  useUpdateShopSettings 
} from '../hooks/useShopSettings';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiX, 
  FiSettings, 
  FiSliders, 
  FiScissors, 
  FiSearch, 
  FiCheck,
  FiLayers,
  FiTag,
  FiInfo,
  FiPhone,
  FiMapPin,
  FiAward,
  FiImage,
  FiSave,
  FiPrinter,
  FiUser
} from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('rates'); // 'rates' | 'templates' | 'general'
  const [rateSection, setRateSection] = useState('services'); // 'services' (Garment Categories) | 'customizations' (Add-ons)
  
  // --- TEMPLATES DATA ---
  const { data: templates = [], isLoading: loadingTemplates } = useGetTemplates();
  const { mutate: deleteTemplate, isPending: isDeletingTemplate } = useDeleteTemplates();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // --- TAILORING SERVICES & CUSTOMIZATIONS DATA ---
  const { data: tailoringList = [], isLoading: loadingTailoring } = useGetTailoringServices();
  const { mutate: deleteTailoring, isPending: isDeletingTailoring } = useDeleteTailoringService();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [defaultModalType, setDefaultModalType] = useState('service');
  const [pricingSearch, setPricingSearch] = useState('');

  // Handlers for Templates
  const openTemplateModal = (item = null) => {
    setEditingTemplate(item);
    setIsTemplateModalOpen(true);
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };

  // Handlers for Tailoring Services
  const openPricingModal = (item = null, forceType = null) => {
    setEditingPricing(item);
    if (forceType) {
      setDefaultModalType(forceType);
    } else if (item) {
      setDefaultModalType(item.itemType || 'service');
    } else {
      setDefaultModalType(rateSection === 'customizations' ? 'customization' : 'service');
    }
    setIsPricingModalOpen(true);
  };

  const handleDeletePricing = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteTailoring(id);
    }
  };

  // Filter lists by itemType:
  const garmentServices = tailoringList.filter(item => {
    const isService = item.itemType === 'service';
    const matchesSearch = (item.serviceName || '').toLowerCase().includes(pricingSearch.toLowerCase());
    return isService && matchesSearch;
  });

  const customizations = tailoringList.filter(item => {
    const isCustom = item.itemType === 'customization';
    const matchesSearch = (item.serviceName || '').toLowerCase().includes(pricingSearch.toLowerCase());
    return isCustom && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* TOP HEADER & HORIZONTAL TABS ROW */}
      <div className="bg-white rounded shadow-sm border border-gray-200/90 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
              <FiSettings className="text-[#DFAC43]" /> System Settings
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Manage garment categories, rates, measurement templates & shop branding preferences.
            </p>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-2.5 pt-4 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('rates')}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded text-xs sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'rates' 
                ? 'bg-[#0F172A] text-[#DFAC43] shadow-md scale-[1.01]' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black border border-gray-200'
            }`}
          >
            <FaMoneyBillWave className="text-base shrink-0" />
            <span>Tailoring Rates & Add-ons</span>
            <span className={`text-[11px] px-2 py-0.5 rounded font-bold ml-1 ${
              activeTab === 'rates' ? 'bg-[#DFAC43]/20 text-[#DFAC43]' : 'bg-gray-200 text-gray-700'
            }`}>
              {tailoringList.length}
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded text-xs sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'templates' 
                ? 'bg-[#0F172A] text-[#DFAC43] shadow-md scale-[1.01]' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black border border-gray-200'
            }`}
          >
            <FiSliders className="text-base shrink-0" />
            <span>Measurement Templates</span>
            <span className={`text-[11px] px-2 py-0.5 rounded font-bold ml-1 ${
              activeTab === 'templates' ? 'bg-[#DFAC43]/20 text-[#DFAC43]' : 'bg-gray-200 text-gray-700'
            }`}>
              {templates.length}
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded text-xs sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'general' 
                ? 'bg-[#0F172A] text-[#DFAC43] shadow-md scale-[1.01]' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black border border-gray-200'
            }`}
          >
            <FiSettings className="text-base shrink-0" />
            <span>Shop Branding & Info</span>
          </button>
        </div>
      </div>

      {/* FULL-WIDTH CONTENT CARD */}
      <div className="bg-white rounded shadow-sm border border-gray-200/90 p-5 sm:p-7 md:p-8 min-w-0">
        
        {/* ============================================================== */}
        {/* TAB 1: TAILORING RATES & CUSTOMIZATIONS                       */}
        {/* ============================================================== */}
        {activeTab === 'rates' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                  <FiScissors className="text-[#DFAC43]" /> Rates & Customization Settings
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                  Garment Categories aur Customization add-on rates ko table mein manage karein.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => openPricingModal(null, rateSection === 'customizations' ? 'customization' : 'service')}
                  className="bg-[#0F172A] text-[#DFAC43] hover:bg-[#DFAC43] hover:text-[#0F172A] px-4 py-2.5 rounded text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-sm whitespace-nowrap"
                >
                  <FiPlus className="text-base shrink-0" />
                  <span>{rateSection === 'services' ? 'Add Category' : 'Add Customization'}</span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs: 1. Garment Categories vs 2. Customizations */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gray-50 p-2.5 rounded border border-gray-200">
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <button
                  onClick={() => setRateSection('services')}
                  className={`px-3.5 py-2.5 rounded text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                    rateSection === 'services'
                      ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FiLayers className="text-sm shrink-0" />
                  <span>Garment Categories</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                    rateSection === 'services' ? 'bg-[#DFAC43] text-black' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {garmentServices.length}
                  </span>
                </button>

                <button
                  onClick={() => setRateSection('customizations')}
                  className={`px-3.5 py-2.5 rounded text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                    rateSection === 'customizations'
                      ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FiTag className="text-sm shrink-0" />
                  <span>Customizations</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                    rateSection === 'customizations' ? 'bg-[#DFAC43] text-black' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {customizations.length}
                  </span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full lg:w-60 shrink-0">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search rates..."
                  value={pricingSearch}
                  onChange={(e) => setPricingSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded bg-white border border-gray-200 text-xs font-medium outline-none focus:border-[#DFAC43]"
                />
              </div>
            </div>

            {/* SECTION 1: GARMENT CATEGORIES TABLE */}
            {rateSection === 'services' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-200/80 p-3 rounded text-xs text-amber-900 font-medium">
                  <FiInfo className="text-base text-amber-700 shrink-0" />
                  <span>
                    <strong>Garment Categories:</strong> Order create karte waqt category choose karne par yeh <strong>Base Price</strong> bill me add hogi.
                  </span>
                </div>

                {loadingTailoring ? (
                  <div className="py-20 text-center text-sm font-bold text-gray-400">Loading Categories...</div>
                ) : garmentServices.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded p-6">
                    <FiLayers className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-bold mb-2">No garment categories found.</p>
                    <button 
                      onClick={() => openPricingModal(null, 'service')}
                      className="bg-[#0F172A] text-[#DFAC43] hover:bg-[#DFAC43] hover:text-[#0F172A] px-5 py-2.5 rounded-xl font-black text-xs transition"
                    >
                      + Add Your First Garment Category
                    </button>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded overflow-hidden shadow-xs bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] sm:text-xs border-b border-gray-200">
                          <tr>
                            <th className="py-3.5 px-4 w-16 text-center">#</th>
                            <th className="py-3.5 px-4">Category Name</th>
                            <th className="py-3.5 px-4 text-right w-44">Base Price (Rs)</th>
                            <th className="py-3.5 px-4 text-center w-28">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 font-medium">
                          {garmentServices.map((item, idx) => (
                            <tr key={item._id} className="hover:bg-gray-50/80 transition">
                              <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-black text-gray-900 text-sm sm:text-base">
                                  {item.serviceName}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-black font-sans text-sm sm:text-base text-gray-900">
                                Rs {Number(item.price || 0).toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button 
                                    onClick={() => openPricingModal(item, 'service')} 
                                    title="Edit Category"
                                    className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition"
                                  >
                                    <FiEdit className="text-sm" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeletePricing(item._id)} 
                                    disabled={isDeletingTailoring}
                                    title="Delete Category"
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                  >
                                    <FiTrash2 className="text-sm" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: CUSTOMIZATIONS & ADD-ONS TABLE */}
            {rateSection === 'customizations' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-200/80 p-3 rounded text-xs text-amber-900 font-medium">
                  <FiInfo className="text-base text-amber-700 shrink-0" />
                  <span>
                    <strong>Customizations & Add-ons:</strong> Yahan Jali Kanta, Double Silai, Fancy Button ke add-on rates define karein.
                  </span>
                </div>

                {loadingTailoring ? (
                  <div className="py-20 text-center text-sm font-bold text-gray-400">Loading Customizations...</div>
                ) : customizations.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded p-6">
                    <FiTag className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-bold mb-2">No customizations defined yet.</p>
                    <button 
                      onClick={() => openPricingModal(null, 'customization')}
                      className="bg-[#0F172A] text-[#DFAC43] hover:bg-[#DFAC43] hover:text-[#0F172A] px-5 py-2.5 rounded font-black text-xs transition"
                    >
                      + Add New Customization
                    </button>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded overflow-hidden shadow-xs bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] sm:text-xs border-b border-gray-200">
                          <tr>
                            <th className="py-3.5 px-4 w-16 text-center">#</th>
                            <th className="py-3.5 px-4">Customization Name</th>
                            <th className="py-3.5 px-4 text-right w-44">Add-on Price (Rs)</th>
                            <th className="py-3.5 px-4 text-center w-28">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 font-medium">
                          {customizations.map((item, idx) => (
                            <tr key={item._id} className="hover:bg-gray-50/80 transition">
                              <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-black text-gray-900 text-sm sm:text-base">
                                  {item.serviceName}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-black font-sans text-sm sm:text-base text-gray-900">
                                + Rs {Number(item.price || 0).toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button 
                                    onClick={() => openPricingModal(item, 'customization')} 
                                    title="Edit Customization"
                                    className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition"
                                  >
                                    <FiEdit className="text-sm" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeletePricing(item._id)} 
                                    disabled={isDeletingTailoring}
                                    title="Delete Customization"
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                  >
                                    <FiTrash2 className="text-sm" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MEASUREMENT TEMPLATES                                   */}
        {/* ============================================================== */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                  <FiSliders className="text-[#DFAC43]" /> Measurement Templates
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage dynamic input fields for tailoring categories.</p>
              </div>
              <button 
                onClick={() => openTemplateModal()}
                className="bg-[#0F172A] text-[#DFAC43] hover:bg-[#DFAC43] hover:text-[#0F172A] px-4 py-2.5 rounded text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-sm"
              >
                <FiPlus className="text-base" /> Add New Template
              </button>
            </div>

            {loadingTemplates ? (
              <div className="text-center py-10 text-gray-500">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 mb-4">No measurement templates found.</p>
                <button onClick={() => openTemplateModal()} className="text-black font-bold underline decoration-[#DFAC43] decoration-2 underline-offset-4">
                  Create your first template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-black text-lg text-black uppercase tracking-wide">
                        {template.categoryname}
                      </h4>
                      <div className="flex gap-2">
                        <button onClick={() => openTemplateModal(template)} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition">
                          <FiEdit />
                        </button>
                        <button onClick={() => handleDeleteTemplate(template._id)} disabled={isDeletingTemplate} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {template.fields.map((field, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-md border border-gray-200">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: GENERAL SETTINGS (SHOP BRANDING & CONTACT INFO)         */}
        {/* ============================================================== */}
        {activeTab === 'general' && (
          <ShopGeneralSettings />
        )}
      </div>

      {/* --- STREAMLINED 2-FIELD PRICING MODAL --- */}
      {isPricingModalOpen && (
        <PricingModal 
          item={editingPricing}
          initialType={defaultModalType}
          closeModal={() => setIsPricingModalOpen(false)}
        />
      )}

      {/* --- TEMPLATE ADD/EDIT MODAL --- */}
      {isTemplateModalOpen && (
        <TemplateModal 
          item={editingTemplate} 
          closeModal={() => setIsTemplateModalOpen(false)} 
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// STREAMLINED 2-FIELD MODAL (Category Name & Price Only)
// -------------------------------------------------------------
const PricingModal = ({ item, initialType = 'service', closeModal }) => {
  const { mutate: addTailoring, isPending: isAdding } = useAddTailoringService();
  const { mutate: updateTailoring, isPending: isUpdating } = useUpdateTailoringService();

  const isEditMode = Boolean(item);
  const isPending = isAdding || isUpdating;
  const isService = (item?.itemType || initialType) === 'service';

  const [serviceName, setServiceName] = useState(item?.serviceName || '');
  const [price, setPrice] = useState(item?.price !== undefined ? item.price : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      toast.error(isService ? 'Category name is required' : 'Customization name is required');
      return;
    }
    if (price === '' || isNaN(price)) {
      toast.error('Valid price is required');
      return;
    }

    const payload = {
      itemType: isService ? 'service' : 'customization',
      serviceName: serviceName.trim(),
      price: Number(price)
    };

    if (isEditMode) {
      updateTailoring(
        { id: item._id, updatedData: payload },
        { onSuccess: () => closeModal() }
      );
    } else {
      addTailoring(payload, { onSuccess: () => closeModal() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-md relative flex flex-col overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2">
            {isService ? <FiLayers className="text-xl text-[#DFAC43]" /> : <FiTag className="text-xl text-[#DFAC43]" />}
            <h2 className="text-lg font-black text-gray-900">
              {isEditMode 
                ? `Edit ${isService ? 'Garment Category' : 'Customization'}`
                : `Add New ${isService ? 'Garment Category' : 'Customization'}`
              }
            </h2>
          </div>
          <button 
            onClick={closeModal} 
            className="text-gray-400 hover:text-black p-1.5 rounded hover:bg-gray-200 transition"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Form Body - Exactly 2 Fields */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
              {isService ? 'Category Name *' : 'Customization Name *'}
            </label>
            <input 
              required
              type="text" 
              placeholder={isService ? 'e.g. Shalwar Qameez, Kurta, Waistcoat' : 'e.g. Jali Kanta, Double Silai, Fancy Button'} 
              value={serviceName} 
              onChange={(e) => setServiceName(e.target.value)} 
              className="w-full border-2 border-gray-200 focus:border-[#DFAC43] rounded p-3 outline-none text-sm font-bold text-gray-800 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
              {isService ? 'Base Price (Rs) *' : 'Add-on Price (Rs) *'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">PKR</span>
              <input 
                required
                type="number"
                min="0"
                placeholder={isService ? '1500' : '400'} 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                className="w-full border-2 border-gray-200 focus:border-[#DFAC43] rounded pl-14 pr-3 py-3 outline-none text-base font-black text-black transition"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-5 py-2.5 rounded border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending} 
              className="bg-[#0F172A] text-[#DFAC43] hover:bg-[#DFAC43] hover:text-[#0F172A] px-6 py-2.5 rounded font-black text-xs transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              <FiCheck />
              {isPending ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// TEMPLATE MODAL COMPONENT (Dynamic Fields Logic)
// -------------------------------------------------------------
const TemplateModal = ({ item, closeModal }) => {
  const { mutate: addTemplate, isPending: isAdding } = useAddTemplates();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplates();
  
  const isEditMode = Boolean(item);
  const isPending = isAdding || isUpdating;

  const [categoryname, setCategoryname] = useState(item?.categoryname || '');
  const [fields, setFields] = useState(item?.fields || ['Length', 'Chest']);

  const handleAddField = () => {
    setFields([...fields, '']);
  };

  const handleFieldChange = (index, value) => {
    const newFields = [...fields];
    newFields[index] = value;
    setFields(newFields);
  };

  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanFields = fields.filter(f => f.trim() !== '');
    
    if (!categoryname.trim() || cleanFields.length === 0) {
      toast.error("Please enter category name and at least one field.");
      return;
    }

    const payload = { categoryname, fields: cleanFields };

    if (isEditMode) {
      updateTemplate({ id: item._id, data: payload }, { onSuccess: () => closeModal() });
    } else {
      addTemplate(payload, { onSuccess: () => closeModal() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow w-full max-w-lg relative flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 bg-gray-50/70">
          <h2 className="text-lg sm:text-xl font-black text-black">
            {isEditMode ? `Edit Template: ${item.categoryname}` : 'Create New Template'}
          </h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-black p-1.5 rounded hover:bg-gray-200 transition">
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
              Category Name *
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Shalwar Kameez, Waistcoat, Safari Suit" 
              value={categoryname} 
              onChange={(e) => setCategoryname(e.target.value)} 
              className="w-full border border-gray-300 focus:border-[#DFAC43] rounded p-3 outline-none text-sm font-semibold"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                Measurement Fields *
              </label>
              <button 
                type="button" 
                onClick={handleAddField}
                className="text-xs font-black text-[#0F172A] hover:text-[#DFAC43] flex items-center gap-1 transition"
              >
                <FiPlus /> Add Field
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder={`Field #${idx + 1} (e.g. Length, Collar)`} 
                    value={field} 
                    onChange={(e) => handleFieldChange(idx, e.target.value)} 
                    className="flex-1 border border-gray-300 focus:border-[#DFAC43] rounded p-2.5 outline-none text-sm font-medium"
                  />
                  {fields.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveField(idx)}
                      className="text-gray-400 hover:text-red-600 p-2 transition"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-5 py-2.5 rounded border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending} 
              className="bg-[#0F172A] text-[#DFAC43] hover:bg-[#DFAC43] hover:text-[#0F172A] px-6 py-2.5 rounded font-black text-xs transition shadow-md disabled:opacity-50"
            >
              {isPending ? 'Saving...' : isEditMode ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// SHOP GENERAL BRANDING & CONTACT SETTINGS COMPONENT
// -------------------------------------------------------------
const ShopGeneralSettings = () => {
  const { data: shopSettings, isLoading } = useGetShopSettings();
  const { mutate: updateSettings, isPending } = useUpdateShopSettings();

  const [form, setForm] = useState({
    shopName: '',
    tagline: '',
    proprietor: '',
    primaryPhone: '',
    secondaryPhone: '',
    address: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Hydrate form when shopSettings loads
  React.useEffect(() => {
    if (shopSettings) {
      setForm({
        shopName: shopSettings.shopName || 'Balouch Tailors',
        tagline: shopSettings.tagline || 'Gents Shalwar Qameez Specialist',
        proprietor: shopSettings.proprietor || 'Zubair Balouch',
        primaryPhone: shopSettings.primaryPhone || '0313-4389192',
        secondaryPhone: shopSettings.secondaryPhone || '0306-7379919',
        address: shopSettings.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan'
      });
      setLogoPreview(shopSettings.logoUrl || '');
    }
  }, [shopSettings]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.shopName.trim()) return toast.error('Shop Name is required');

    const formData = new FormData();
    formData.append('shopName', form.shopName.trim());
    formData.append('tagline', form.tagline.trim());
    formData.append('proprietor', form.proprietor.trim());
    formData.append('primaryPhone', form.primaryPhone.trim());
    formData.append('secondaryPhone', form.secondaryPhone.trim());
    formData.append('address', form.address.trim());

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    updateSettings(formData);
  };

  if (isLoading) {
    return <div className="text-center py-16 text-gray-500 font-bold">Loading shop branding settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
          <FiSettings className="text-[#DFAC43]" /> Shop Branding & Contact Info
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
          These details dynamically appear across your Website Header, Navbar, Preloader, and all printable Invoices, Delivery Slips, and Ledger Statements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5 bg-white p-5 sm:p-6 rounded border border-gray-200/90 shadow-sm">
          
          {/* 1. SHOP NAME & SPECIALITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Shop Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Balouch Tailors"
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                className="w-full border border-gray-300 rounded px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-900 focus:border-[#DFAC43] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Tagline / Speciality
              </label>
              <input
                type="text"
                placeholder="e.g. Gents Shalwar Qameez Specialist"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full border border-gray-300 rounded px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#D4AF37] focus:border-[#DFAC43] outline-none"
              />
            </div>
          </div>

          {/* 2. PROPRIETOR & PHONES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Proprietor Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Zubair Balouch"
                value={form.proprietor}
                onChange={(e) => setForm({ ...form, proprietor: e.target.value })}
                className="w-full border border-gray-300 rounded px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-900 focus:border-[#DFAC43] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Primary Phone *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 0313-4389192"
                value={form.primaryPhone}
                onChange={(e) => setForm({ ...form, primaryPhone: e.target.value })}
                className="w-full border border-gray-300 rounded px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-[#DFAC43] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Secondary Phone
              </label>
              <input
                type="text"
                placeholder="e.g. 0306-7379919"
                value={form.secondaryPhone}
                onChange={(e) => setForm({ ...form, secondaryPhone: e.target.value })}
                className="w-full border border-gray-300 rounded px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-[#DFAC43] outline-none"
              />
            </div>
          </div>

          {/* 3. ADDRESS */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Shop Address (Appears on Bills & Slips) *
            </label>
            <textarea
              required
              rows="2"
              placeholder="e.g. Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 rounded px-3.5 py-2 text-xs sm:text-sm font-medium focus:border-[#DFAC43] outline-none resize-y"
            ></textarea>
          </div>

          {/* 4. LOGO UPLOAD */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Shop Logo (Web, Navbar, Preloader & Invoices)
            </label>
            <div className="flex flex-col sm:flex-row items-start gap-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full border border-gray-300 rounded p-2 text-xs bg-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#0F172A] file:text-white hover:file:bg-[#DFAC43] hover:file:text-black cursor-pointer"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  PNG with transparent background or high-res JPG/WEBP logo recommended.
                </p>
              </div>

              {logoPreview && (
                <div className="w-24 h-20 rounded bg-white border border-gray-200 flex items-center justify-center p-2 shrink-0 shadow-sm">
                  <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] px-6 py-2.5 rounded text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              <FiSave className="text-base" />
              {isPending ? 'Saving Shop Settings...' : 'Save Branding Settings'}
            </button>
          </div>
        </form>

        {/* REAL-TIME LIVE BILL HEADER PREVIEW */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded p-5 border border-gray-200/90 shadow-sm text-center space-y-2">
            <div className="flex items-center justify-between border-b pb-2 text-xs text-gray-500 font-bold">
              <span className="flex items-center gap-1">
                <FiPrinter className="text-sm text-[#DFAC43]" /> Live Bill / Slip Preview
              </span>
              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-black">
                Real-time
              </span>
            </div>

            {/* Simulated Bill Header */}
            <div className="pt-2 pb-3 border-b-2 border-dashed border-gray-300 space-y-1">
              <div className="flex justify-center mb-1">
                <img 
                  src={logoPreview || '/assets/BT_Logo.png'} 
                  alt="Shop Logo" 
                  className="h-11 w-auto object-contain"
                />
              </div>
              <h4 className="font-black text-base sm:text-lg uppercase tracking-wider text-black leading-tight">
                {form.shopName || 'Balouch Tailors'}
              </h4>
              <p className="text-[8px] font-bold tracking-widest text-gray-500 uppercase -mt-0.5">
                {form.tagline || 'Gents Shalwar Qameez Specialist'}
              </p>
              <div className="pt-1.5">
                <span className="inline-block bg-[#0F172A] text-white px-3 py-0.5 rounded text-[9px] font-black tracking-widest uppercase">
                  INVOICE #BT-22
                </span>
              </div>
            </div>

            {/* Simulated Bill Body Snippet */}
            <div className="py-2 border-b border-dashed border-gray-200 text-left text-[9px] space-y-1 text-gray-600">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Customer: Walk-in Customer</span>
                <span>Due: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-1 font-black text-black">
                <span>Shalwar Qameez (1 Suit)</span>
                <span>Rs 1,500</span>
              </div>
            </div>

            {/* Simulated Footer Stamp with Proprietor, Phone & Address */}
            <div className="pt-2 text-center space-y-1 border-t-2 border-black text-black">
              <p className="font-black text-[10px] uppercase tracking-wider">
                Proprietor: {form.proprietor || 'Zubair Balouch'}
              </p>
              <p className="font-black text-[9px] font-sans">
                📞 {form.primaryPhone || '0313-4389192'}{form.secondaryPhone ? ` | ${form.secondaryPhone}` : ''}
              </p>
              <p className="text-[8px] text-gray-600 leading-tight px-2">
                {form.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Multan'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded text-xs text-blue-900 space-y-1">
            <h5 className="font-bold flex items-center gap-1 text-blue-950">
              <FiInfo className="text-sm" /> Instant Sync:
            </h5>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Saving these settings will instantly update all new invoice prints, preloader, website top header, and admin bar.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;

