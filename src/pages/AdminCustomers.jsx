import React, { useState } from 'react';
import { useGetCustomers } from '../hooks/useCustomers';
import { useIsMobile } from '../hooks/useIsMobile';
import { FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Pagination from '../components/Pagination';
import CustomerDesktopTable from '../components/CustomerDesktopTable';
import CustomerMobileCards from '../components/CustomerMobileCards';
import CustomerFormModal from '../components/CustomerFormModal';

const AdminCustomers = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const isMobile = useIsMobile(768);

  // Server-side paginated customer fetch
  const { data: customersResponse, isLoading } = useGetCustomers({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchTerm
  });

  const customers = Array.isArray(customersResponse) 
    ? customersResponse 
    : (customersResponse?.data || []);

  const pagination = customersResponse?.pagination || {
    totalRecords: customers.length,
    currentPage: 1,
    totalPages: 1,
    pageSize: PAGE_SIZE
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredCustomers = customers;

  const openFormModal = (customer = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white shadow-sm p-3.5 sm:p-6 relative min-h-[80vh] rounded-xl">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b pb-4 mb-6 gap-4">
        <div className="w-full xl:w-auto">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">{t('customers.title')}</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{t('customers.subtitle')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-2.5">
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('customers.searchCustomer')} 
              className="w-full pl-10 pr-8 py-2 border-2 border-gray-100 focus:border-black rounded outline-none text-xs sm:text-sm transition"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5 rounded-full cursor-pointer"
                title={t('common.clear')}
              >
                <FiX className="text-xs" />
              </button>
            )}
          </div>
          <button 
            onClick={() => openFormModal()}
            className="bg-[#DFAC43] text-[#0F172A] hover:bg-[#0F172A] hover:text-[#DFAC43] px-4 py-2 text-xs sm:text-sm font-black rounded transition shadow-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <FiPlus className="text-lg" /> {t('customers.addNewCustomer')}
          </button>
        </div>
      </div>

      {/* CUSTOMERS DISPLAY (TABLE ON MD+, CARDS ON MOBILE) */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-medium">{t('common.loading')}</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-2 font-bold text-sm">{t('customers.noCustomersFound')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Render single responsive view so .map executes only once */}
          {isMobile ? (
            <CustomerMobileCards customers={filteredCustomers} />
          ) : (
            <CustomerDesktopTable customers={filteredCustomers} />
          )}
        </div>
      )}

      {/* SERVER-SIDE PAGINATION */}
      {pagination.totalRecords > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            Showing <span className="font-bold text-gray-800">{Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalRecords)}</span> to <span className="font-bold text-gray-800">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)}</span> of <span className="font-bold text-gray-800">{pagination.totalRecords}</span> clients
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* ADD/EDIT FORM MODAL */}
      {isModalOpen && (
        <CustomerFormModal 
          customer={editingCustomer} 
          closeModal={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};
export default AdminCustomers;