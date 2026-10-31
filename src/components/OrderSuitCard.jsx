import React from 'react';
import { 
  FiCopy, 
  FiTrash2, 
  FiLayers, 
  FiTag, 
  FiX, 
  FiImage, 
  FiCamera, 
  FiMic 
} from 'react-icons/fi';
import { formatPhone } from '../utils/formatters';

export const COMMON_TAGS = [
  'Half Bain', 
  'Full Bain', 
  'Collar', 
  'Gol Bazu', 
  'Gol Kaf', 
  'Chor Kaf', 
  'Gol Daman',
  'Choras Daman',
  'Front Pocket', 
  '2 Side Pockets', 
  'Shalwar Pocket',
  'Gum Patti',
  'Double Silai'
];

const OrderSuitCard = ({
  suit,
  index,
  suitsLength,
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
  startListening
}) => {
  const suitCustoms = suit.customizations || [];
  const customTotal = suitCustoms.reduce((sum, c) => sum + (Number(c.price) || 0), 0);
  const currentBasePrice = Number(suit.basePrice) || 0;
  const hasFabricImage = suit.fabricimage && suit.fabricimage !== 'null';

  return (
    <div className="border border-gray-200 rounded p-3 sm:p-4 bg-gray-50/70 relative">
      
      {/* Suit Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="bg-[#0F172A] text-[#DFAC43] text-xs font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded">
            Suit #{index + 1}
          </span>
          <span className="font-black text-gray-900 text-xs sm:text-sm">
            {suit.serviceType || 'Garment'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={() => handleCopySpecs(index, index - 1)}
              className="bg-amber-100 hover:bg-[#DFAC43] hover:text-[#0F172A] text-amber-900 border border-amber-300 text-[11px] font-black px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer shadow-2xs"
              title={`Copy all styles, tags, add-ons, and instructions from Suit #${index} to this suit`}
            >
              <FiCopy /> Same as Suit #{index}
            </button>
          )}

          <div className="bg-white border border-gray-200 px-2 sm:px-2.5 py-1 rounded shadow-sm flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-gray-500 hidden sm:inline">
              Base (Rs {currentBasePrice}) + Add-ons (Rs {customTotal}) =
            </span>
            <span className="font-black text-gray-900 font-sans">
              Rs {suit.price}
            </span>
          </div>

          {suitsLength > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveSuit(index)}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 sm:p-1.5 rounded transition"
              title="Remove Suit"
            >
              <FiTrash2 className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Step A & B: Category & Customization Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 bg-white p-2.5 sm:p-3 rounded border border-gray-200">
        
        {/* Garment Category Dropdown */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <FiLayers className="text-[#DFAC43]" /> Garment Category:
            </label>
          </div>

          <select
            value={suit.serviceType || ''}
            onChange={(e) => handleGarmentCategoryChange(index, e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-semibold text-gray-800 bg-white outline-none transition"
          >
            {garmentServices.length === 0 ? (
              <option value="Shalwar Qameez">Shalwar Qameez</option>
            ) : (
              garmentServices.map(service => {
                const urdu = service.serviceNameUrdu ? ` (${service.serviceNameUrdu})` : '';
                return (
                  <option key={service._id} value={service.serviceName}>
                    {service.serviceName}{urdu}
                  </option>
                );
              })
            )}
          </select>
        </div>

        {/* Add Customization Dropdown */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <FiTag className="text-[#DFAC43]" /> Add-on Customization:
            </label>
            {suitCustoms.length > 0 && (
              <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                {suitCustoms.length} Selected (+Rs {customTotal})
              </span>
            )}
          </div>

          <select
            value=""
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                const item = customizationList.find(c => c.serviceName === val);
                if (item) handleToggleSuitCustomization(index, item);
              }
            }}
            className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-semibold text-gray-700 bg-white outline-none transition"
          >
            <option value="">Select Customization</option>
            {customizationList.map(customItem => {
              const isAlready = suitCustoms.some(c => c.name === customItem.serviceName);
              const addPrice = Number(customItem.price) || 0;
              const urdu = customItem.serviceNameUrdu ? ` (${customItem.serviceNameUrdu})` : '';
              return (
                <option 
                  key={customItem._id} 
                  value={customItem.serviceName}
                  className={isAlready ? 'font-bold text-amber-600' : ''}
                >
                  {isAlready ? 'Selected: ' : '+ '}{customItem.serviceName}{urdu} (+Rs {addPrice})
                </option>
              );
            })}
          </select>

          {/* Active Customization Badges */}
          {suitCustoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {suitCustoms.map((c, cIdx) => (
                <span 
                  key={cIdx} 
                  className="inline-flex items-center gap-1 bg-[#0F172A] text-[#DFAC43] px-2 py-0.5 rounded text-[11px] font-bold shadow-sm"
                >
                  <span>{c.name} (+Rs {c.price})</span>
                  <button
                    type="button"
                    onClick={() => handleToggleSuitCustomization(index, { serviceName: c.name, price: c.price })}
                    className="text-gray-400 hover:text-red-400 font-black text-xs ml-1"
                    title="Remove"
                  >
                    <FiX />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Fabric Details, Vol # & Suit Price Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 mb-3">
        <div className="sm:col-span-6">
          <label className="block text-[11px] font-bold text-gray-600 mb-1">Fabric & Color</label>
          <input 
            type="text" 
            placeholder="e.g. Black Wash-n-Wear, White Boski" 
            value={suit.fabricDetails} 
            onChange={(e) => handleSuitChange(index, 'fabricDetails', e.target.value)} 
            className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-medium bg-white outline-none" 
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:col-span-6">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Vol #</label>
            <input 
              type="text" 
              placeholder="Vol-01" 
              value={suit.volumeNo} 
              onChange={(e) => handleSuitChange(index, 'volumeNo', e.target.value)} 
              className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-medium bg-white outline-none" 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Suit Price (Rs)</label>
            <input 
              type="number" 
              min="0" 
              placeholder="0" 
              value={suit.price} 
              onChange={(e) => handleSuitChange(index, 'price', e.target.value)} 
              onWheel={(e) => e.target.blur()} 
              className="w-full h-10 px-3 border-2 border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-black text-gray-900 bg-white outline-none" 
            />
          </div>
        </div>
      </div>

      {/* Fabric Sample Selection (Gallery / Camera Options) */}
      <div className="bg-white p-2.5 sm:p-3 rounded border border-gray-200 mb-3">
        <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
          Fabric Sample Photo (Camera / Gallery):
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {/* Option 1: File / Gallery Upload */}
          <label className="cursor-pointer flex-1 min-w-[120px] sm:flex-initial h-10 px-3 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 shadow-sm transition">
            <FiImage className="text-gray-500 text-sm" />
            <span>Gallery / Files</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleSuitChange(index, 'fabricimage', e.target.files[0]);
                }
              }}
              className="hidden" 
            />
          </label>

          {/* Option 2: Live Camera Capture */}
          <button
            type="button"
            onClick={() => startCamera(index)}
            className="flex-1 min-w-[120px] sm:flex-initial h-10 px-3 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 shadow-sm transition"
          >
            <FiCamera className="text-[#DFAC43] text-sm" />
            <span>Capture Photo</span>
          </button>

          {/* Active Image Indicator / Thumbnail */}
          {hasFabricImage && (
            <div className="w-full sm:w-auto flex items-center gap-2 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded text-xs text-green-800">
              {suit.fabricimage instanceof Blob && (
                <img 
                  src={URL.createObjectURL(suit.fabricimage)} 
                  alt="Sample preview" 
                  className="w-7 h-7 object-cover rounded border border-green-300 shrink-0"
                />
              )}
              <span className="font-bold text-[11px] truncate max-w-[150px]">
                {suit.fabricimage.name || 'Photo Attached'}
              </span>
              <button
                type="button"
                onClick={() => handleSuitChange(index, 'fabricimage', 'null')}
                className="text-red-500 hover:text-red-700 font-bold ml-auto p-0.5"
                title="Remove photo"
              >
                <FiX />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Wearer Dropdown */}
      <div className="bg-white p-2.5 sm:p-3 rounded border border-gray-200 mb-3">
        <label className="block text-[11px] font-bold text-gray-600 mb-1">
          Wearer Assignment:
        </label>
        <select
          value={suit.wearer || ''}
          onChange={(e) => handleSuitChange(index, 'wearer', e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-medium bg-gray-50 outline-none"
        >
          <option value="">-- Main Customer (Default) --</option>
          {customers.map(c => (
            <option key={c._id} value={c._id}>{c.name} - {formatPhone(c.phone)}</option>
          ))}
        </select>
      </div>

      {/* Smart Tags & Voice Note */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-gray-600">
          Design Specifications:
        </label>

        <div className="flex flex-wrap gap-1.5">
          {commonTags.map(tag => {
            const isSelected = (suit.staticTags || []).includes(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(index, tag)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded border transition-all ${
                  isSelected
                    ? 'bg-black text-[#DFAC43] border-black shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <textarea
            rows="2"
            placeholder="Special stitching instructions or voice notes..."
            value={suit.customDesign}
            onChange={(e) => handleSuitChange(index, 'customDesign', e.target.value)}
            className="w-full border border-gray-300 focus:border-[#DFAC43] rounded p-2.5 pr-11 text-xs font-medium resize-none bg-white outline-none"
          />
          <button
            type="button"
            onClick={() => startListening(index)}
            title="Voice Typing"
            className="absolute right-2.5 top-2.5 text-[#0F172A] bg-[#DFAC43] hover:bg-black hover:text-[#DFAC43] p-1.5 rounded shadow-sm transition-all"
          >
            <FiMic className="text-sm" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default OrderSuitCard;
