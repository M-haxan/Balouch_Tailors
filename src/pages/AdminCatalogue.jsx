import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetCatalogue, useDeleteCatalogue } from '../hooks/useCatalogue';
import Preloader from '../components/Preloader';
import CatalogueCard from '../components/CatalogueCard';
import CatalogueModal from '../components/CatalogueModal';
import { FiPlus, FiLayers } from 'react-icons/fi';

const AdminCatalogue = () => {
  const { t } = useTranslation();
  // Tabs aur Form ki state
  const [activeTab, setActiveTab] = useState('Shalwar Qameez');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // API Hooks
  const { data: catalogueItems = [], isLoading, isError } = useGetCatalogue();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteCatalogue();

  // Categories list (3 Core Categories)
  const categories = ['Shalwar Qameez', 'Kurta', 'Shirts'];

  // Filtered Data: Sirf us category ka data dikhao jo tab open hai
  const filteredData = catalogueItems.filter((item) => item.category === activeTab);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Preloader /></div>;
  if (isError) return <div className="text-red-500 text-center py-10 font-bold">Failed to load catalogue.</div>;

  return (
    <div className="bg-white rounded shadow-sm p-4 sm:p-6 relative space-y-6">
      {/* HEADER: Title aur Add Button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-[#0F172A] text-[#DFAC43] flex items-center justify-center font-bold shrink-0 shadow-xs">
              <FiLayers className="text-lg" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{t('catalogue.title')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium max-w-2xl leading-relaxed">
            {t('catalogue.subtitle')}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] px-4 py-2.5 rounded text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 whitespace-nowrap cursor-pointer"
        >
          <FiPlus className="text-base shrink-0" />
          <span>{t('catalogue.addDesign')}</span>
        </button>
      </div>

      {/* CATEGORY TABS */}
      <div className="w-full max-w-lg bg-gray-100 p-1 sm:p-1.5 rounded border border-gray-200">
        <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-1 sm:gap-1.5">
          {categories.map((cat) => {
            const count = catalogueItems.filter(item => item.category === cat).length;
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`w-full py-2 px-3 rounded text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between min-[480px]:justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm ring-1 ring-[#DFAC43]/40'
                    : 'text-gray-600 hover:text-black hover:bg-white/70'
                }`}
              >
                <span className="truncate">{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                  isActive ? 'bg-[#DFAC43] text-[#0F172A]' : 'bg-gray-200 text-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID: Data Dikhane Ke Liye */}
      {filteredData.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded border border-dashed border-gray-300">
          <FiLayers className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-600 font-bold text-sm">No designs found in {activeTab}.</p>
          <p className="text-gray-400 text-xs mt-1">Click the " Add New Design / Vol" button above to upload pictures.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
          {filteredData.map((item, index) => (
            <CatalogueCard
              key={item._id}
              item={item}
              index={index}
              onEdit={handleOpenEdit}
              onDelete={deleteItem}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      {/* UNIFIED ADD / EDIT MODAL */}
      {isModalOpen && (
        <CatalogueModal
          item={editingItem}
          closeModal={handleCloseModal}
          categories={categories}
          defaultCategory={activeTab}
        />
      )}
    </div>
  );
};

export default AdminCatalogue;