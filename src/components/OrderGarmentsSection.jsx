import React from 'react';
import { FiScissors, FiX, FiPlus, FiCopy } from 'react-icons/fi';
import OrderSuitCard, { COMMON_TAGS } from './OrderSuitCard';

const OrderGarmentsSection = ({
  suits,
  alterations,
  garmentServices,
  customizationList,
  customers,
  commonTags = COMMON_TAGS,
  handleCopySpecs,
  handleRemoveSuit,
  handleGarmentCategoryChange,
  handleToggleSuitCustomization,
  handleSuitChange,
  toggleTag,
  startCamera,
  startListening,
  handleAddSuit,
  handleAddSuitCopy,
  handleAddAlteration,
  handleRemoveAlteration,
  handleAlterationChange
}) => {
  return (
    <div className="bg-white p-3.5 sm:p-5 rounded border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3.5 sm:mb-4 pb-2 border-b border-gray-100">
        <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
          <span className="w-5 h-5 rounded bg-amber-100 text-[#DFAC43] flex items-center justify-center text-xs">
            <FiScissors />
          </span>
          2. Garments & Customizations
        </h3>
        <span className="text-[10px] sm:text-[11px] font-bold text-gray-500">
          {suits.length} {suits.length === 1 ? 'Garment' : 'Garments'}
        </span>
      </div>

      {/* List of Suits */}
      <div className="space-y-4">
        {suits.map((suit, index) => (
          <OrderSuitCard
            key={index}
            suit={suit}
            index={index}
            suitsLength={suits.length}
            garmentServices={garmentServices}
            customizationList={customizationList}
            customers={customers}
            commonTags={commonTags}
            handleCopySpecs={handleCopySpecs}
            handleRemoveSuit={handleRemoveSuit}
            handleGarmentCategoryChange={handleGarmentCategoryChange}
            handleToggleSuitCustomization={handleToggleSuitCustomization}
            handleSuitChange={handleSuitChange}
            toggleTag={toggleTag}
            startCamera={startCamera}
            startListening={startListening}
          />
        ))}
      </div>

      {/* Alterations Sub-Section */}
      {alterations.length > 0 && (
        <div className="space-y-3 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-200">
          <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-purple-600"></span>
            Alterations ({alterations.length})
          </h4>
          {alterations.map((alt, index) => (
            <div key={index} className="border border-gray-200 rounded p-2.5 sm:p-3 bg-gray-50 relative">
              <button
                type="button"
                onClick={() => handleRemoveAlteration(index)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"
                title="Remove alteration"
              >
                <FiX className="text-sm" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 pr-5 sm:pr-6">
                <div className="sm:col-span-8">
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Shalwar Length Alteration"
                    value={alt.description}
                    onChange={(e) => handleAlterationChange(index, 'description', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs font-medium bg-white outline-none"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Price (Rs)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={alt.price}
                    onChange={(e) => handleAlterationChange(index, 'price', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs font-bold bg-white outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-2.5 mt-4 sm:mt-5 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleAddSuit}
          className="w-full sm:w-auto min-h-[42px] py-2 px-3.5 sm:px-4 bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black rounded transition text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <FiPlus className="text-sm shrink-0" />
          <span>Add Blank Suit</span>
        </button>

        {suits.length > 0 && (
          <button
            type="button"
            onClick={() => handleAddSuitCopy(suits.length - 1)}
            className="w-full sm:w-auto min-h-[42px] py-2 px-3.5 sm:px-4 bg-[#DFAC43] hover:bg-amber-500 text-[#0F172A] font-black rounded transition text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer text-center"
            title="Add new suit pre-filled with the same specifications and styling"
          >
            <FiCopy className="text-sm shrink-0" />
            <span>Add Suit (Same Specs as Above)</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleAddAlteration}
          className="w-full sm:w-auto min-h-[42px] py-2 px-3.5 sm:px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FiPlus className="text-sm shrink-0" />
          <span>Add Alteration</span>
        </button>
      </div>

    </div>
  );
};

export default OrderGarmentsSection;
