import React, { useState } from 'react';
import { useUpdateCustomer } from '../hooks/useCustomers';
import { FiSliders, FiX } from 'react-icons/fi';

// ====================================================================
// MODAL: EDIT PERMANENT STITCHING PREFERENCES
// ====================================================================
const CustomerStitchingPreferencesModal = ({ customer, closeModal }) => {
  const { mutate: updateCustomer, isPending } = useUpdateCustomer();

  const [form, setForm] = useState({
    collar: customer.stitchingPreferences?.collar || '',
    sleeves: customer.stitchingPreferences?.sleeves || '',
    daman: customer.stitchingPreferences?.daman || '',
    frontPocket: customer.stitchingPreferences?.frontPocket || '',
    sidePockets: customer.stitchingPreferences?.sidePockets || '',
    shalwarPocket: customer.stitchingPreferences?.shalwarPocket || '',
    patti: customer.stitchingPreferences?.patti || '',
    stitchingStyle: customer.stitchingPreferences?.stitchingStyle || '',
    otherPreferences: customer.stitchingPreferences?.otherPreferences || '',
    customNotes: customer.stitchingPreferences?.customNotes || '',
  });

  const PRESETS = [
    {
      key: 'collar',
      label: 'Collar / Bain',
      options: ['Half Bain', 'Full Bain', 'Cut Bain', 'Gol Gala / No Collar']
    },
    {
      key: 'sleeves',
      label: 'Sleeves ',
      options: ['Gol Bazu', 'Single Cuff', 'Double Cuff', 'Gol Kaf', 'Chor Kaf']
    },
    {
      key: 'daman',
      label: 'Daman ',
      options: ['Gol Daman', 'Choras Daman']
    },
    {
      key: 'frontPocket',
      label: 'Front Pocket ',
      options: ['1 Front Pocket', '2 Front Pockets', 'No Front Pocket']
    },
    {
      key: 'sidePockets',
      label: 'Side Pockets ',
      options: ['1 Side Pocket (Right)', '2 Side Pockets', '1 Side Pocket (Left)', 'No Side Pocket']
    },
    {
      key: 'shalwarPocket',
      label: 'Shalwar Pocket ',
      options: ['1 Shalwar Pocket',  'No Shalwar Pocket']
    }
  ];

  const handleSelectOption = (key, val) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key] === val ? '' : val
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const tags = [
      form.collar,
      form.sleeves,
      form.daman,
      form.frontPocket,
      form.sidePockets,
      form.shalwarPocket,
      form.patti,
      form.stitchingStyle,
      form.otherPreferences
    ].filter(Boolean);

    const payload = {
      ...form,
      tags
    };

    updateCustomer({
      id: customer._id,
      data: { stitchingPreferences: payload }
    }, {
      onSuccess: () => {
        closeModal();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 animate-fade-in">

        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <FiSliders className="text-[#DFAC43]" /> Permanent Stitching Preferences
            </h2>
            <p className="text-xs text-gray-500">Set default tailor options, pockets, sleeves & personal habits for {customer.name}.</p>
          </div>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black rounded">
            <FiX className="text-lg" />
          </button>
        </div>

        <form id="prefForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">

          {PRESETS.map((group) => (
            <div key={group.key} className="space-y-2 bg-gray-50/70 p-3.5 rounded border border-gray-100">
              <label className="block font-black text-gray-700 uppercase tracking-wider text-[11px]">
                {group.label}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {group.options.map((opt) => {
                  const isSelected = form[group.key] === opt;
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handleSelectOption(group.key, opt)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition border ${isSelected
                          ? 'bg-[#0F172A] text-[#DFAC43] border-[#0F172A] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Other / Custom Preference Input */}
          <div className="space-y-1.5 bg-amber-50/50 p-4 rounded border border-amber-200">
            <label className="block font-black text-amber-900 uppercase tracking-wider text-[11px]">
              Other / Custom Preferences
            </label>
            <input
              type="text"
              placeholder="e.g. Mobile pocket deep banayein, Collar button loose, Pant style shalwar"
              value={form.otherPreferences}
              onChange={(e) => setForm({ ...form, otherPreferences: e.target.value })}
              className="w-full bg-white border border-amber-300 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
            />
            <p className="text-[10px] text-amber-700">Type any additional habit or custom preference not listed above.</p>
          </div>

          {/* Special Fitting Notes */}
          <div className="space-y-1.5">
            <label className="block font-black text-gray-700 uppercase tracking-wider text-[11px]">
              Special Fitting / Tailor Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Always double check shoulder fall, customer prefers light press"
              value={form.customNotes}
              onChange={(e) => setForm({ ...form, customNotes: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-medium outline-none"
            ></textarea>
          </div>

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
            form="prefForm"
            disabled={isPending}
            className="px-6 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black rounded text-xs transition shadow"
          >
            {isPending ? 'Saving Preferences...' : 'Save Preferences'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerStitchingPreferencesModal;
