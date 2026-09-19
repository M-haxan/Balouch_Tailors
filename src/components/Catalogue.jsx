import React, { useState, useEffect, useCallback } from 'react';
import { 
  AiOutlineWhatsApp, 
  AiOutlineClose, 
  AiOutlineLeft, 
  AiOutlineRight 
} from 'react-icons/ai';
import { FiEye, FiMaximize2, FiGrid, FiLayers } from 'react-icons/fi';
import { useGetCatalogue } from '../hooks/useCatalogue';

const Catalogue = () => {
  const [activeTab, setActiveTab] = useState('Shalwar Qameez');
  const [sliderIndex, setSliderIndex] = useState(null); // null means slider is closed, number means open at that index

  const { data: catalogueItems = [], isLoading, isError } = useGetCatalogue();
  const categories = ['Shalwar Qameez', 'Kurta', 'Shirts'];

  // Filter items for active tab strictly from database
  const activeData = catalogueItems.filter(item => item.category === activeTab);

  // Keyboard navigation for slider
  const handleKeyDown = useCallback((e) => {
    if (sliderIndex === null) return;
    if (e.key === 'ArrowRight') {
      setSliderIndex((prev) => (prev + 1) % activeData.length);
    } else if (e.key === 'ArrowLeft') {
      setSliderIndex((prev) => (prev - 1 + activeData.length) % activeData.length);
    } else if (e.key === 'Escape') {
      setSliderIndex(null);
    }
  }, [sliderIndex, activeData.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    if (sliderIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [sliderIndex, handleKeyDown]);

  const handleWhatsAppInquiry = (item, index) => {
    const volTitle = item.title || `Vol. ${String(index + 1).padStart(2, '0')}`;
    const message = `Assalam-o-Alaikum Balouch Tailors! I am interested in ${item.category} (${volTitle}). Please share fabric and stitching details.`;
    window.open(`https://wa.me/923067379919?text=${encodeURIComponent(message)}`, '_blank');
  };

  const currentSliderItem = sliderIndex !== null ? activeData[sliderIndex] : null;

  return (
    <section className="py-24 bg-[#F8FAFC] relative overflow-hidden" id="catalogue">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* SECTION HEADER */}
        <div className="text-center mb-14">
          <span className="text-[#D4AF37] text-xs sm:text-sm font-black tracking-[0.25em] uppercase mb-3 block">
            Exclusive Stitched Collections
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 font-serif">
            Design Catalogue
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#DFAC43] to-[#F5D77F] mx-auto mb-8 rounded-full"></div>

          {/* 3 CATEGORY SWITCHER TABS (EQUAL SIZE & SINGLE LINE) */}
          <div className="flex justify-center items-center gap-2 sm:gap-3 p-1.5 bg-gray-200/80 backdrop-blur-sm rounded-xl max-w-2xl mx-auto border border-gray-300 shadow-inner overflow-x-auto no-scrollbar">
            {categories.map((category) => {
              const count = catalogueItems.filter(item => item.category === category).length;
              const isActive = activeTab === category;
              return (
                <button
                  key={category}
                  onClick={() => {
                    setActiveTab(category);
                    setSliderIndex(null);
                  }}
                  className={`flex-1 h-12 px-3 sm:px-6 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-[#0F172A] text-[#DFAC43] shadow-md'
                      : 'text-gray-700 hover:text-black hover:bg-white/70'
                  }`}
                >
                  <span className="whitespace-nowrap">{category}</span>
                  {count > 0 && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive ? 'bg-[#DFAC43] text-black' : 'bg-gray-300 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* QUICK ACTION BAR */}
        {activeData.length > 0 && (
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200 text-xs text-gray-500 font-bold">
            <span className="uppercase tracking-wider">
              {activeTab} • <strong className="text-black">{activeData.length} Designs</strong> Available
            </span>
            <button
              onClick={() => setSliderIndex(0)}
              className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-black px-3.5 py-1.5 rounded transition font-black flex items-center gap-1.5 shadow-sm text-xs"
            >
              <FiMaximize2 className="text-sm" />
              Open Slider View
            </button>
          </div>
        )}

        {/* LOADING & ERROR STATES */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded overflow-hidden shadow-sm animate-pulse h-80">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-16 text-red-500 font-bold">
            Failed to load catalogue. Please refresh or try again later.
          </div>
        )}

        {/* CLEAN GRID DISPLAY */}
        {!isLoading && !isError && (
          <>
            {activeData.length === 0 ? (
              <div className="text-center py-16 bg-white rounded border border-dashed border-gray-300">
                <FiLayers className="mx-auto text-4xl text-gray-400 mb-2" />
                <p className="text-gray-600 font-bold text-sm">No designs added in {activeTab} yet.</p>
                <p className="text-gray-400 text-xs mt-1">Admin can add designs from the admin catalogue panel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {activeData.map((item, index) => {
                  const volTitle = item.title?.includes('Vol') 
                    ? item.title 
                    : (item.title ? `${item.title}` : `Vol. ${String(index + 1).padStart(2, '0')}`);

                  return (
                    <div
                      key={item._id || index}
                      onClick={() => setSliderIndex(index)}
                      className="group cursor-pointer bg-white rounded border border-gray-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                    >
                      {/* IMAGE CONTAINER */}
                      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden flex items-center justify-center">
                        <img
                          src={item.imageUrl}
                          alt={volTitle}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        
                        {/* HOVER OVERLAY */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="bg-white/95 text-gray-900 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded shadow flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <FiEye className="text-sm text-[#DFAC43]" /> View Design
                          </span>
                        </div>

                        {/* VOL NUMBER BADGE */}
                        {/* <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">
                          {volTitle}
                        </div> */}
                      </div>

                      {/* MINIMAL FOOTER */}
                      <div className="p-3 bg-white flex items-center justify-between border-t border-gray-100">
                        <div>
                          <p className="text-xs font-black text-gray-900 tracking-tight truncate">
                            {volTitle}
                          </p>
                          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                            {activeTab}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsAppInquiry(item, index);
                          }}
                          className="text-green-600 hover:text-green-700 p-1.5 rounded-full hover:bg-green-50 transition"
                          title="Inquire on WhatsApp"
                        >
                          <AiOutlineWhatsApp className="text-lg" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>

      {/* FULLSCREEN LIGHTBOX SLIDER MODAL */}
      {sliderIndex !== null && currentSliderItem && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/95 backdrop-blur-md p-2 sm:p-4 select-none animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSliderIndex(null)}
        >
          {/* SLIDER TOP HEADER */}
          <div 
            className="w-full max-w-5xl mx-auto flex items-center justify-between text-white z-20 pt-1 pb-2 px-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="bg-[#DFAC43] text-black text-xs font-black px-2.5 py-0.5 rounded uppercase">
                {activeTab}
              </span>
              <span className="text-sm sm:text-base font-black tracking-wide text-white">
                {currentSliderItem.title || `Vol. ${String(sliderIndex + 1).padStart(2, '0')}`}
              </span>
              <span className="text-xs text-gray-400 font-bold hidden sm:inline">
                ({sliderIndex + 1} of {activeData.length})
              </span>
            </div>

            <button
              onClick={() => setSliderIndex(null)}
              className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition shadow"
              aria-label="Close slider"
            >
              <AiOutlineClose className="text-xl" />
            </button>
          </div>

          {/* MAIN SLIDER STAGE (FULL HEIGHT ADAPTIVE CONTAINER) */}
          <div 
            className="relative w-full max-w-5xl mx-auto flex-1 min-h-0 flex items-center justify-center my-auto px-2 sm:px-14 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* PREVIOUS BUTTON */}
            {activeData.length > 1 && (
              <button
                onClick={() => setSliderIndex((prev) => (prev - 1 + activeData.length) % activeData.length)}
                className="absolute left-1 sm:left-2 z-30 bg-black/70 hover:bg-[#DFAC43] text-white hover:text-black p-2.5 sm:p-3.5 rounded-full backdrop-blur-sm transition-all shadow-xl"
                aria-label="Previous Design"
              >
                <AiOutlineLeft className="text-lg sm:text-2xl" />
              </button>
            )}

            {/* CURRENT IMAGE (100% VISIBLE WITH ZERO CROPPING) */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                key={currentSliderItem._id || sliderIndex}
                src={currentSliderItem.imageUrl}
                alt={currentSliderItem.title || 'Design Volume'}
                className="max-h-full max-w-full w-auto h-auto object-contain rounded drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 mx-auto"
              />
            </div>

            {/* NEXT BUTTON */}
            {activeData.length > 1 && (
              <button
                onClick={() => setSliderIndex((prev) => (prev + 1) % activeData.length)}
                className="absolute right-1 sm:right-2 z-30 bg-black/70 hover:bg-[#DFAC43] text-white hover:text-black p-2.5 sm:p-3.5 rounded-full backdrop-blur-sm transition-all shadow-xl"
                aria-label="Next Design"
              >
                <AiOutlineRight className="text-lg sm:text-2xl" />
              </button>
            )}
          </div>

          {/* SLIDER BOTTOM BAR (WHATSAPP INQUIRY & THUMBNAILS) */}
          <div 
            className="w-full max-w-4xl mx-auto flex flex-col items-center gap-2.5 z-20 pt-2 pb-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ACTION BUTTON */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleWhatsAppInquiry(currentSliderItem, sliderIndex)}
                className="bg-green-600 hover:bg-green-500 text-white font-black text-xs sm:text-sm px-6 py-2 rounded shadow-lg flex items-center gap-2 transition hover:scale-105"
              >
                <AiOutlineWhatsApp className="text-lg" />
                Inquire on WhatsApp
              </button>
            </div>

            {/* THUMBNAIL STRIP */}
            {activeData.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-1 no-scrollbar">
                {activeData.map((thumb, idx) => (
                  <button
                    key={thumb._id || idx}
                    onClick={() => setSliderIndex(idx)}
                    className={`relative w-10 h-12 sm:w-12 sm:h-14 rounded overflow-hidden shrink-0 border-2 transition-all ${
                      sliderIndex === idx 
                        ? 'border-[#DFAC43] scale-110 shadow-md' 
                        : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    <img src={thumb.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </section>
  );
};

export default Catalogue;