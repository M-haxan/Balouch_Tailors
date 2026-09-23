import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({
  currentPage = 1,
  totalItems,
  totalPages: propTotalPages,
  pageSize = 10,
  onPageChange,
  className = ""
}) => {
  const totalPages = propTotalPages !== undefined 
    ? propTotalPages 
    : Math.ceil((totalItems || 0) / pageSize);

  const calculatedTotalItems = totalItems !== undefined 
    ? totalItems 
    : (totalPages * pageSize);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, calculatedTotalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 border-t border-gray-200 text-xs ${className}`}>
      <span className="text-gray-600 font-medium text-[11px]">
        Showing <strong className="font-bold text-gray-900">{startItem}</strong> to <strong className="font-bold text-gray-900">{endItem}</strong> of <strong className="font-bold text-gray-900">{totalItems}</strong> entries
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 px-2.5 rounded bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold flex items-center gap-1 cursor-pointer"
          title="Previous Page"
        >
          <FiChevronLeft /> <span className="hidden sm:inline text-[11px]">Prev</span>
        </button>

        {getPageNumbers().map((page, idx) => (
          page === '...' ? (
            <span key={`dots-${idx}`} className="px-1 text-gray-400 font-bold">...</span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`w-7 h-7 rounded text-xs font-black transition flex items-center justify-center cursor-pointer ${
                currentPage === page
                  ? 'bg-[#0F172A] text-[#DFAC43] shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 px-2.5 rounded bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold flex items-center gap-1 cursor-pointer"
          title="Next Page"
        >
          <span className="hidden sm:inline text-[11px]">Next</span> <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
