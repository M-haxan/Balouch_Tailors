import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const CatalogueCard = ({ item, index, onEdit, onDelete, isDeleting }) => {
  const volTitle = item.title?.includes('Vol') 
    ? item.title 
    : (item.title ? `${item.title}` : `Vol. ${String(index + 1).padStart(2, '0')}`);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col group">
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={volTitle}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
          {volTitle}
        </div>
      </div>

      <div className="p-2.5 sm:p-3 bg-white flex flex-col flex-grow justify-between gap-2 border-t border-gray-100">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">{volTitle}</h3>
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase">{item.category}</span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100">
          <button
            onClick={() => onEdit(item)}
            className="text-gray-700 hover:text-black text-[11px] sm:text-xs font-bold py-1.5 px-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <FiEdit className="text-xs shrink-0" /> 
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(item._id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 text-[11px] sm:text-xs font-bold py-1.5 px-2 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <FiTrash2 className="text-xs shrink-0" /> 
            <span>Del</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogueCard;
