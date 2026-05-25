import React, { useState } from 'react';
import { 
  useGetTemplates, 
  useAddTemplates, 
  useUpdateTemplates, 
  useDeleteTemplates 
} from '../hooks/useTemplates';
import { FiEdit, FiTrash2, FiPlus, FiX, FiSettings, FiSliders } from 'react-icons/fi';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const { data: templates = [], isLoading } = useGetTemplates();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplates();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const openModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm min-h-[80vh] flex flex-col md:flex-row border border-gray-100">
      
      {/* LEFT SIDEBAR: Settings Tabs */}
      <div className="w-full md:w-64 border-r border-gray-100 bg-gray-50/50 p-6">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Settings</h2>
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('templates')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'templates' 
                ? 'bg-black text-[#D4AF37] shadow-md' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FiSliders className="text-lg" />
            Measurement Templates
          </button>
          
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'general' 
                ? 'bg-black text-[#D4AF37] shadow-md' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FiSettings className="text-lg" />
            General Settings
          </button>
        </nav>
      </div>

      {/* RIGHT SIDE: Content Area */}
      <div className="flex-1 p-6 md:p-8">
        
        {/* TAB 1: Measurement Templates */}
        {activeTab === 'templates' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Measurement Templates</h3>
                <p className="text-sm text-gray-500 mt-1">Manage dynamic input fields for tailoring categories.</p>
              </div>
              <button 
                onClick={() => openModal()}
                className="bg-[#D4AF37] text-black hover:bg-black hover:text-[#D4AF37] px-4 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
              >
                <FiPlus className="text-lg" /> Add New Template
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-10 text-gray-500">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 mb-4">No measurement templates found.</p>
                <button onClick={() => openModal()} className="text-black font-bold underline decoration-[#D4AF37] decoration-2 underline-offset-4">
                  Create your first template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div key={template._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-black text-lg text-black uppercase tracking-wide">
                        {template.categoryname}
                      </h4>
                      <div className="flex gap-2">
                        <button onClick={() => openModal(template)} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition">
                          <FiEdit />
                        </button>
                        <button onClick={() => handleDelete(template._id)} disabled={isDeleting} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition">
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

        {/* TAB 2: General Settings (For Future) */}
        {activeTab === 'general' && (
          <div className="animate-fade-in text-center py-20">
            <FiSettings className="text-4xl text-gray-300 mx-auto mb-4 animate-spin-slow" />
            <h3 className="text-xl font-bold text-gray-800">General Settings</h3>
            <p className="text-gray-500 mt-2">More shop configurations will be added here soon.</p>
          </div>
        )}
      </div>

      {/* MODAL: Add/Edit Template */}
      {isModalOpen && (
        <TemplateModal 
          item={editingItem} 
          closeModal={() => setIsModalOpen(false)} 
        />
      )}
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

  // React State for dynamic form
  const [categoryname, setCategoryname] = useState(item?.categoryname || '');
  const [fields, setFields] = useState(item?.fields || ['Length', 'Chest']); // Default 2 fields for visual ease

  // Add a new empty input box
  const handleAddField = () => {
    setFields([...fields, '']);
  };

  // Update specific input box text
  const handleFieldChange = (index, value) => {
    const newFields = [...fields];
    newFields[index] = value;
    setFields(newFields);
  };

  // Remove an input box
  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Khali fields ko hata dena
    const cleanFields = fields.filter(f => f.trim() !== '');
    
    if (!categoryname.trim() || cleanFields.length === 0) {
      alert("Please enter category name and at least one field.");
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
          <h2 className="text-xl font-black text-black">
            {isEditMode ? 'Edit Template' : 'New Template'}
          </h2>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black transition">
            <FiX className="text-xl" />
          </button>
        </div>
        
        {/* Modal Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category Name</label>
            <input 
              required 
              type="text" 
              placeholder="e.g., Shalwar Kameez" 
              className="w-full border-2 border-gray-200 focus:border-[#D4AF37] focus:ring-0 p-3 rounded-lg transition-colors outline-none font-medium"
              value={categoryname} 
              onChange={(e) => setCategoryname(e.target.value)} 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Measurement Fields</label>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={index} className="flex gap-2 items-center group">
                  <span className="text-gray-400 font-bold text-sm w-4">{index + 1}.</span>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g., Length, Chest, Waist..." 
                    className="flex-1 border-2 border-gray-200 focus:border-black p-2 rounded-lg outline-none transition-colors"
                    value={field} 
                    onChange={(e) => handleFieldChange(index, e.target.value)} 
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveField(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={handleAddField}
              className="mt-4 text-sm font-bold text-[#D4AF37] hover:text-black flex items-center gap-1 transition-colors"
            >
              <FiPlus /> Add Another Field
            </button>
          </div>

          {/* Modal Footer */}
          <div className="pt-6 mt-2 border-t border-gray-100">
            <button 
              disabled={isPending} 
              type="submit" 
              className="w-full bg-black hover:bg-gray-900 text-[#D4AF37] font-bold p-4 rounded-lg transition shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isPending ? 'Saving...' : (isEditMode ? 'Update Template' : 'Save Template')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;