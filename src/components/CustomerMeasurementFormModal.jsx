import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useGetTemplates } from '../hooks/useTemplates';
import { useUpdateMeasurements } from '../hooks/useCustomers';
import { FiX, FiScissors, FiTrash2 } from 'react-icons/fi';

// ====================================================================
// MODAL: MEASUREMENT RECORD & UPDATE
// ====================================================================
const CustomerMeasurementFormModal = ({ customer, config, closeModal }) => {
  const { data: templates = [] } = useGetTemplates();
  const { mutate: updateMeasurements, isPending } = useUpdateMeasurements();

  const [categoriesList, setCategoriesList] = useState(() => {
    if (config?.mode === 'update' && config?.category) {
      const existing = (customer.measurements || []).find(
        m => m.category && m.category.toLowerCase() === config.category.toLowerCase()
      );
      if (existing) {
        return [{ category: existing.category, data: { ...(existing.data || {}) }, notes: existing.notes || '' }];
      }
    }
    return [];
  });

  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleAddCategory = () => {
    if (!selectedTemplate) {
      toast.warning("Please select a template first.");
      return;
    }

    if (categoriesList.some(c => c.category.toLowerCase() === selectedTemplate.toLowerCase())) {
      toast.warning("This category is already added in the form!");
      return;
    }

    const tpl = templates.find(t => t.categoryname === selectedTemplate);
    const emptyData = {};
    if (tpl?.fields) {
      tpl.fields.forEach(field => { emptyData[field] = ''; });
    }

    setCategoriesList([...categoriesList, { category: selectedTemplate, data: emptyData, notes: '' }]);
    setSelectedTemplate('');
  };

  const handleRemoveCategory = (indexToRemove) => {
    setCategoriesList(categoriesList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFieldChange = (catIndex, field, value) => {
    const copy = [...categoriesList];
    copy[catIndex].data[field] = value;
    setCategoriesList(copy);
  };

  const handleNotesChange = (catIndex, value) => {
    const copy = [...categoriesList];
    copy[catIndex].notes = value;
    setCategoriesList(copy);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (categoriesList.length === 0) {
      toast.warning("Please add at least one measurement category.");
      return;
    }

    // Prepare payload
    updateMeasurements({
      id: customer._id,
      data: { measurements: categoriesList }
    }, {
      onSuccess: () => {
        closeModal();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 animate-fade-in">

        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              {config?.mode === 'update' ? `Update Size: ${config.category}` : `Record New Size (${customer.name})`}
            </h2>
            <p className="text-xs text-gray-500">
              {config?.mode === 'update'
                ? 'Sizes updated here will automatically archive the previous size into history.'
                : 'Select garment templates to record fresh measurements for this client.'}
            </p>
          </div>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black rounded">
            <FiX className="text-lg" />
          </button>
        </div>

        <form id="measForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Garment Template Selector Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-amber-50/70 p-4 rounded border border-amber-200">
            <span className="text-xs font-black text-amber-900 uppercase">Select Garment Category:</span>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="border border-gray-300 focus:border-black rounded px-3 py-2 text-xs font-bold outline-none bg-white min-w-[200px]"
            >
              <option value="">-- Choose Template --</option>
              {templates.map(t => (
                <option key={t._id} value={t.categoryname}>{t.categoryname}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] text-xs font-black rounded transition shadow-sm"
            >
              + Add to Form
            </button>
          </div>

          {categoriesList.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded bg-gray-50/50 space-y-2">
              <FiScissors className="text-3xl text-gray-300 mx-auto" />
              <p className="text-gray-500 text-xs font-bold">No garment category added in this form yet.</p>
              <p className="text-gray-400 text-[11px]">Select a garment template from above dropdown and click "Add to Form".</p>
            </div>
          ) : (
            <div className="space-y-6">
              {categoriesList.map((meas, catIndex) => (
                <div key={catIndex} className="bg-gray-50 border border-gray-200 p-5 rounded space-y-4 relative group">

                  {/* Category Header with Prominent Remove / Close Button */}
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FiScissors className="text-[#DFAC43]" />
                      <h4 className="font-black text-sm text-gray-900 uppercase tracking-wide">{meas.category}</h4>
                    </div>

                    {/* CLOSE / REMOVE CATEGORY BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(catIndex)}
                      className="text-red-500 hover:text-white hover:bg-red-600 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 border border-red-200"
                      title="Remove this category"
                    >
                      <FiTrash2 className="text-xs" /> Remove
                    </button>
                  </div>

                  {/* Measurement Inputs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Object.keys(meas.data || {}).map((field) => (
                      <div key={field}>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{field}</label>
                        <input
                          type="text"
                          value={meas.data[field] || ''}
                          onChange={(e) => handleFieldChange(catIndex, field, e.target.value)}
                          placeholder="e.g. 40"
                          className="w-full bg-white border border-gray-300 focus:border-black rounded px-2.5 py-1.5 text-xs font-bold outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Notes / Special Instructions */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Fitting Instructions / Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 inch loose fitting, round collar"
                      value={meas.notes || ''}
                      onChange={(e) => handleNotesChange(catIndex, e.target.value)}
                      className="w-full bg-white border border-gray-300 focus:border-black rounded px-2.5 py-1.5 text-xs outline-none font-medium"
                    />
                  </div>

                </div>
              ))}
            </div>
          )}

        </form>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded text-xs transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="measForm"
            disabled={isPending || categoriesList.length === 0}
            className="px-6 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black rounded text-xs transition shadow disabled:opacity-50"
          >
            {isPending ? 'Saving Size...' : 'Save & Archive Size'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerMeasurementFormModal;
