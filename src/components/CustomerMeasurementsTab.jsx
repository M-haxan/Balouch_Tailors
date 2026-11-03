import React from 'react';
import { useDeleteMeasurementCategory } from '../hooks/useCustomers';
import { FiScissors, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';

// ====================================================================
// SUB-COMPONENT: MEASUREMENTS TAB (TABLE FORMAT)
// ====================================================================
const CustomerMeasurementsTab = ({
  customer,
  selectedCategory,
  setSelectedCategory,
  openRecordModal,
  openUpdateModal
}) => {
  const { mutate: deleteMeasurementCategory, isPending: isDeletingMeasurement } = useDeleteMeasurementCategory();
  const measurements = customer.measurements || [];

  // Set default category if not selected
  const activeCategory = selectedCategory || (measurements.length > 0 ? measurements[0].category : '');
  const currentMeas = measurements.find(m => m.category && m.category.toLowerCase() === activeCategory.toLowerCase());

  const handleDeleteCategory = (catName) => {
    deleteMeasurementCategory({ id: customer._id, category: catName }, {
      onSuccess: () => {
        setSelectedCategory('');
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">

      {/* Category Selection Bar & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-gray-900">Custom Size Profiles</h3>
          <p className="text-xs text-gray-500 mt-0.5">Customer tailored measurement parameters and fitting details.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {measurements.map(m => (
            <button
              key={m.category}
              onClick={() => setSelectedCategory(m.category)}
              className={`px-3 sm:px-4 py-2 rounded text-xs font-black transition ${activeCategory.toLowerCase() === m.category.toLowerCase()
                  ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
            >
              {m.category}
            </button>
          ))}
          <button
            onClick={openRecordModal}
            className="px-3.5 sm:px-4 py-2 bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] font-black text-xs rounded transition flex items-center gap-1.5 shadow-sm ml-auto sm:ml-2 whitespace-nowrap"
          >
            <FiPlus /> Record New Size
          </button>
        </div>
      </div>

      {!currentMeas ? (
        <div className="text-center py-12 sm:py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded p-4">
          <FiScissors className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-bold text-sm">No measurements recorded for this customer yet.</p>
          <button
            onClick={openRecordModal}
            className="mt-4 px-6 py-2.5 bg-[#0F172A] text-[#DFAC43] rounded font-black text-xs hover:bg-[#DFAC43] hover:text-[#0F172A] transition"
          >
            + Add First Measurement
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">

          {/* Active Category Header, Delete & Update Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 p-3.5 sm:p-4 rounded border border-gray-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Garment Category</span>
              <h4 className="text-base sm:text-lg font-black text-gray-900">{currentMeas.category}</h4>
              {currentMeas.lastUpdated && (
                <p className="text-[11px] text-gray-500 font-medium">
                  Last updated: {new Date(currentMeas.lastUpdated).toLocaleDateString()} at {new Date(currentMeas.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleDeleteCategory(currentMeas.category)}
                disabled={isDeletingMeasurement}
                className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold rounded border border-red-200 transition flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                title="Delete this measurement category"
              >
                <FiTrash2 /> {isDeletingMeasurement ? 'Deleting...' : 'Delete Size'}
              </button>
              <button
                onClick={() => openUpdateModal(currentMeas.category)}
                className="flex-1 sm:flex-none justify-center px-4 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] text-xs font-black rounded border border-gray-200 transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <FiEdit /> Update Size
              </button>
            </div>
          </div>

          {/* Measurements Display (Table on MD+, Cards Grid on Mobile) */}
          {/* 1. DESKTOP VIEW (TABLE) */}
          <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0F172A] text-[#DFAC43] font-black uppercase text-[10px]">
                  <th className="p-3.5 w-16 text-center">#</th>
                  <th className="p-3.5">Measurement Parameter</th>
                  <th className="p-3.5 text-right pr-6">Size Value (Inches)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.keys(currentMeas.data || {}).map((field, idx) => (
                  <tr key={field} className="hover:bg-gray-50 transition">
                    <td className="p-3.5 text-center text-gray-400 font-bold">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-gray-800 uppercase tracking-wide">
                      {field}
                    </td>
                    <td className="p-3.5 text-right pr-6 font-black text-gray-900 text-sm font-sans">
                      {currentMeas.data[field] || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. MOBILE VIEW (GRID CARDS) */}
          <div className="block md:hidden">
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(currentMeas.data || {}).map((field) => (
                <div key={field} className="bg-gray-50/80 border border-gray-200 rounded-xl p-3 text-center space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block truncate">{field}</span>
                  <span className="text-base font-black text-gray-900 font-sans block">{currentMeas.data[field] || '-'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Notes / Fitting Instructions */}
          {currentMeas.notes && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded">
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block mb-1">Special Fitting Notes / Instructions</span>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">{currentMeas.notes}</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default CustomerMeasurementsTab;
