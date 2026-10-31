import React, { useState } from 'react';
import { formatPhone } from '../utils/formatters';
import { 
  useGetSuppliers, 
  useDeleteSupplier,
  useGetExpenses, 
  useDeleteExpense 
} from '../hooks/useExpenses';
import { 
  FiShoppingBag, 
  FiPlus, 
  FiSearch, 
  FiTrash2, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiCalendar, 
  FiFileText, 
  FiX, 
  FiBook, 
  FiCreditCard,
  FiPhone,
  FiMapPin,
  FiTrendingUp,
  FiTool
} from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { useTranslation } from 'react-i18next';
import Preloader from '../components/Preloader';
import Pagination from '../components/Pagination';
import AddSupplierModal, { SUPPLIER_CATEGORIES } from '../components/AddSupplierModal';
import PurchaseMaterialModal from '../components/PurchaseMaterialModal';
import SupplierLedgerModal from '../components/SupplierLedgerModal';
import DirectExpenseModal, { EXPENSE_CATEGORIES } from '../components/DirectExpenseModal';

const PAGE_SIZE = 10;

const AdminExpenses = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' | 'direct' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals state
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isDirectExpenseOpen, setIsDirectExpenseOpen] = useState(false);

  // Selected supplier for purchase or ledger
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Data Queries
  const { data: supplierData = {}, isLoading: loadingSuppliers } = useGetSuppliers();
  const { data: expenseData = {}, isLoading: loadingExpenses } = useGetExpenses();
  const { data: shopSettings } = useGetShopSettings();
  const shopName = shopSettings?.shopName || 'Balouch Tailors';

  const suppliers = supplierData.data || [];
  const supplierSummary = supplierData.summary || {};
  const expenses = expenseData.data || [];

  const { mutate: deleteSupplier, isPending: deletingSupplier } = useDeleteSupplier();
  const { mutate: deleteExpense, isPending: deletingExpense } = useDeleteExpense();

  const isLoading = loadingSuppliers || loadingExpenses;

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Preloader />
      </div>
    );
  }

  // Filtered suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const q = searchTerm.toLowerCase();
    return (
      s.shopName?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.category?.toLowerCase().includes(q)
    );
  });

  // Filtered direct expenses
  const filteredExpenses = expenses.filter(e => {
    const q = searchTerm.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q) ||
      e.paidTo?.toLowerCase().includes(q)
    );
  });

  const openPurchaseModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsPurchaseModalOpen(true);
  };

  const openLedgerModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsLedgerModalOpen(true);
  };

  const handleDeleteSupplier = (id) => {
    deleteSupplier(id);
  };

  const handleDeleteExpense = (id) => {
    deleteExpense(id);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* 1. TOP HEADER & METRIC TILES */}
      <div className="bg-[#0F172A] text-white rounded p-4 sm:p-6 md:p-8 border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#DFAC43] animate-pulse"></span>
              <span className="text-xs text-gray-400 font-medium">{shopName} Supply & Expense Control</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              {t('expenses.title')}
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl font-medium leading-relaxed">
              {t('expenses.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 min-[450px]:grid-cols-2 lg:flex lg:flex-wrap gap-2 w-full xl:w-auto shrink-0">
            <button
              onClick={() => setIsAddSupplierOpen(true)}
              className="bg-[#DFAC43] hover:bg-white text-[#0F172A] font-black px-3.5 sm:px-4 py-2.5 rounded text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <FiPlus className="text-base shrink-0" /> 
              <span> {t('expenses.addExpense')}</span>
            </button>
            <button
              onClick={() => setIsDirectExpenseOpen(true)}
              className="bg-[#1E293B] hover:bg-gray-800 text-white font-bold px-3.5 sm:px-4 py-2.5 rounded text-xs sm:text-sm transition border border-gray-700 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <FaMoneyBillWave className="text-sm text-[#DFAC43] shrink-0" /> 
              <span>{t('expenses.todayExpenses')}</span>
            </button>
          </div>
        </div>

        {/* 4 HIGHLIGHT METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-800">
          
          <div className="bg-[#1E293B]/60 p-3 sm:p-3.5 rounded border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-black block truncate">Total Purchases</span>
            <p className="text-lg sm:text-xl font-black text-white mt-1">Rs {(supplierSummary.totalPurchasesAll || 0).toLocaleString()}</p>
            <span className="text-[10px] text-gray-400 block truncate">{suppliers.length} Registered Vendors</span>
          </div>

          <div className="bg-[#1E293B]/60 p-3 sm:p-3.5 rounded border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-black block truncate">Paid to Shops</span>
            <p className="text-lg sm:text-xl font-black text-green-400 mt-1">Rs {(supplierSummary.totalPaidAll || 0).toLocaleString()}</p>
            <span className="text-[10px] text-gray-400 block truncate">Settled Purchases</span>
          </div>

          {/* CRITICAL METRIC: Abhi Denay Hain (Material Walon Ko) */}
          <div className="bg-amber-950/40 p-3 sm:p-3.5 rounded border border-[#DFAC43]/40">
            <span className="text-[10px] text-amber-300 uppercase font-black block truncate">Remaining Dues</span>
            <p className="text-lg sm:text-xl font-black text-[#DFAC43] mt-1">
              Rs {(supplierSummary.totalBalancePayableAll || 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-amber-200/70 font-semibold block truncate">Vendor Outstanding</span>
          </div>

          <div className="bg-[#1E293B]/60 p-3 sm:p-3.5 rounded border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-black block truncate">Direct Expenses</span>
            <p className="text-lg sm:text-xl font-black text-gray-200 mt-1">Rs {(expenseData.totalExpenseAmount || 0).toLocaleString()}</p>
            <span className="text-[10px] text-gray-400 block truncate">Rent, Bills & Misc</span>
          </div>

        </div>
      </div>

      {/* 2. TAB CONTROLS & SEARCH */}
      <div className="bg-white rounded border border-gray-200 shadow-sm p-3.5 sm:p-4 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 sm:gap-4">
        
        {/* Navigation Tabs (Equal-width Grid on Mobile / Flex on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full lg:w-auto">
          <button
            onClick={() => {
              setActiveTab('suppliers');
              setCurrentPage(1);
            }}
            className={`py-2.5 px-3.5 rounded text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 text-center whitespace-nowrap cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm ring-1 ring-[#DFAC43]/40'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiShoppingBag className="text-sm shrink-0" /> 
            <span>Material Vendors ({suppliers.length})</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('direct');
              setCurrentPage(1);
            }}
            className={`py-2.5 px-3.5 rounded text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 text-center whitespace-nowrap cursor-pointer ${
              activeTab === 'direct'
                ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm ring-1 ring-[#DFAC43]/40'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiTool className="text-sm shrink-0" /> 
            <span>Shop Expenses ({expenses.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input 
            type="text" 
            placeholder="Search vendor, item or category..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:border-[#DFAC43] rounded outline-none font-medium text-xs sm:text-sm transition shadow-2xs"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      
      {/* TAB 1: MATERIAL SHOPS / SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden p-3.5 sm:p-5 space-y-4">
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs font-bold space-y-3">
              <p>No material vendors registered yet.</p>
              <button
                onClick={() => setIsAddSupplierOpen(true)}
                className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-bold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer"
              >
                Register First Vendor (Bukram, Kaj, Thread)
              </button>
            </div>
          ) : (
            <>
              {/* 1. DESKTOP VIEW (TABLE) */}
              <div className="hidden md:block overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0F172A] text-[#DFAC43] uppercase text-[10px] tracking-wider whitespace-nowrap">
                      <th className="p-4 rounded-tl min-w-[200px]">Shop / Vendor Name</th>
                      <th className="p-4 min-w-[160px]">Contact Person</th>
                      <th className="p-4 min-w-[150px]">Category</th>
                      <th className="p-4 text-right min-w-[130px]">Total Purchases</th>
                      <th className="p-4 text-right min-w-[120px]">Total Paid</th>
                      <th className="p-4 text-right min-w-[140px]">Total Dues</th>
                      <th className="p-4 rounded-tr text-right min-w-[250px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredSuppliers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((supplier) => {
                      const payable = Number(supplier.balancePayable) || 0;
                      return (
                        <tr key={supplier._id} className="hover:bg-gray-50/80 transition">
                          
                          {/* Shop Name & Address */}
                          <td className="p-4">
                            <p className="font-black text-gray-900 text-sm whitespace-nowrap">{supplier.shopName}</p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                              <FiMapPin className="text-gray-400 shrink-0" /> {supplier.address || 'Local Market'}
                            </p>
                          </td>

                          {/* Contact Person */}
                          <td className="p-4 whitespace-nowrap">
                            <p className="font-bold text-gray-800">{supplier.name}</p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                              <FiPhone className="text-gray-400 shrink-0" /> {formatPhone(supplier.phone)}
                            </p>
                          </td>

                          {/* Category */}
                          <td className="p-4 whitespace-nowrap">
                            <span className="inline-block bg-slate-100 text-gray-800 px-2.5 py-1 rounded text-[10px] font-bold uppercase border border-gray-200 whitespace-nowrap">
                              {supplier.category}
                            </span>
                          </td>

                          {/* Total Purchases */}
                          <td className="p-4 text-right font-bold text-gray-800 whitespace-nowrap font-sans">
                            Rs {(supplier.totalPurchases || 0).toLocaleString()}
                          </td>

                          {/* Total Paid */}
                          <td className="p-4 text-right font-bold text-green-700 whitespace-nowrap font-sans">
                            Rs {(supplier.totalPaid || 0).toLocaleString()}
                          </td>

                          {/* Total Dues (Payable) */}
                          <td className="p-4 text-right whitespace-nowrap">
                            {payable > 0 ? (
                              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-[#DFAC43]/40 text-amber-950 px-2.5 py-1 rounded-md text-xs font-black whitespace-nowrap font-sans">
                                <FiAlertTriangle className="text-xs text-[#DFAC43] shrink-0" />
                                Rs {payable.toLocaleString()}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">
                                <FiCheckCircle className="text-xs text-green-600 shrink-0" /> Settled (Rs 0)
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1.5 items-center whitespace-nowrap">
                              
                              {/* + Purchase Goods Button */}
                              <button
                                onClick={() => openPurchaseModal(supplier)}
                                className="bg-[#DFAC43] hover:bg-black hover:text-[#DFAC43] text-[#0F172A] font-black px-2.5 py-1.5 rounded-lg text-xs transition shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
                                title="Purchase Material Entry"
                              >
                                <FiPlus className="shrink-0" /> <span>Purchase</span>
                              </button>

                              {/* Account Book Button */}
                              <button
                                onClick={() => openLedgerModal(supplier)}
                                className="bg-[#0F172A] hover:bg-gray-800 text-[#DFAC43] font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 border border-gray-700 shrink-0 cursor-pointer shadow-2xs"
                                title="View Vendor Statement & Pay"
                              >
                                <FiBook className="shrink-0" /> <span>Khata</span>
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteSupplier(supplier._id)}
                                disabled={deletingSupplier}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm shrink-0 cursor-pointer border border-transparent hover:border-red-200"
                                title="Delete Vendor"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 2. MOBILE VIEW (TABLE-TO-CARD PATTERN) */}
              <div className="block md:hidden space-y-3">
                {filteredSuppliers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((supplier) => {
                  const payable = Number(supplier.balancePayable) || 0;
                  return (
                    <div 
                      key={supplier._id} 
                      className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3.5 space-y-3 transition hover:border-gray-300"
                    >
                      {/* Header: Shop Name & Category Badge */}
                      <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                        <div className="min-w-0">
                          <h4 className="font-black text-gray-900 text-sm truncate">{supplier.shopName}</h4>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                            <FiMapPin className="text-gray-400 shrink-0 text-xs" /> {supplier.address || 'Local Market'}
                          </p>
                        </div>
                        <span className="bg-slate-100 text-gray-800 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-gray-200 shrink-0">
                          {supplier.category}
                        </span>
                      </div>

                      {/* Contact Person & Phone */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Malik / Contact</span>
                          <span className="font-bold text-gray-800">{supplier.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phone</span>
                          <span className="font-semibold text-gray-700 font-mono">{formatPhone(supplier.phone)}</span>
                        </div>
                      </div>

                      {/* Financials Grid */}
                      <div className="grid grid-cols-3 gap-1 text-center bg-gray-50/80 p-2 rounded-lg border border-gray-150 text-xs">
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase block">Purchased</span>
                          <span className="font-bold text-gray-800 text-[11px] font-sans">Rs {(supplier.totalPurchases || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase block">Paid</span>
                          <span className="font-bold text-green-700 text-[11px] font-sans">Rs {(supplier.totalPaid || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase block">Dues</span>
                          {payable > 0 ? (
                            <span className="font-black text-amber-950 text-[11px] font-sans">Rs {payable.toLocaleString()}</span>
                          ) : (
                            <span className="font-bold text-green-700 text-[11px]">Rs 0</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => openPurchaseModal(supplier)}
                          className="flex-1 py-2 bg-[#DFAC43] hover:bg-black hover:text-[#DFAC43] text-[#0F172A] font-black rounded-lg text-xs transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FiPlus className="shrink-0" /> <span>Purchase</span>
                        </button>

                        <button
                          onClick={() => openLedgerModal(supplier)}
                          className="flex-1 py-2 bg-[#0F172A] hover:bg-gray-800 text-[#DFAC43] font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 border border-gray-700 cursor-pointer shadow-2xs"
                        >
                          <FiBook className="shrink-0" /> <span>Khata Book</span>
                        </button>

                        <button
                          onClick={() => handleDeleteSupplier(supplier._id)}
                          disabled={deletingSupplier}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition text-xs border border-red-100 cursor-pointer shrink-0"
                          title="Delete Vendor"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={filteredSuppliers.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      )}

      {/* TAB 2: DIRECT OPERATIONAL SHOP EXPENSES */}
      {activeTab === 'direct' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-3.5 sm:p-5 space-y-4">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs font-bold space-y-3">
              <p>No operational expenses recorded.</p>
              <button
                onClick={() => setIsDirectExpenseOpen(true)}
                className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-bold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer"
              >
                + Log Rent, Utility or Maintenance Expense
              </button>
            </div>
          ) : (
            <>
              {/* 1. DESKTOP VIEW (TABLE) */}
              <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0F172A] text-[#DFAC43] uppercase text-[10px] tracking-wider whitespace-nowrap">
                      <th className="p-4 rounded-tl min-w-[200px]">Expense Detail</th>
                      <th className="p-4 min-w-[140px]">Category</th>
                      <th className="p-4 min-w-[120px]">Date</th>
                      <th className="p-4 min-w-[140px]">Paid To</th>
                      <th className="p-4 min-w-[110px]">Method</th>
                      <th className="p-4 text-right min-w-[120px]">Amount</th>
                      <th className="p-4 rounded-tr text-right min-w-[80px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredExpenses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((exp) => (
                      <tr key={exp._id} className="hover:bg-gray-50/80 transition">
                        <td className="p-4">
                          <p className="font-black text-gray-900 text-sm">{exp.title}</p>
                          {exp.notes && <p className="text-[11px] text-gray-500 mt-0.5">{exp.notes}</p>}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="bg-slate-100 text-gray-800 px-2.5 py-1 rounded text-[10px] font-bold border border-gray-200 whitespace-nowrap">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 font-bold whitespace-nowrap">
                          {new Date(exp.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-gray-800 font-bold whitespace-nowrap">{exp.paidTo || '-'}</td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap">
                            {exp.paymentMethod || 'Cash'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-black text-gray-900 text-sm font-sans whitespace-nowrap">
                          Rs {(exp.amount || 0).toLocaleString()}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteExpense(exp._id)}
                            disabled={deletingExpense}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm cursor-pointer"
                            title="Delete Expense"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 2. MOBILE VIEW (TABLE-TO-CARD PATTERN) */}
              <div className="block md:hidden space-y-3">
                {filteredExpenses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((exp) => (
                  <div 
                    key={exp._id} 
                    className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3.5 space-y-2.5 transition hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2">
                      <div>
                        <h4 className="font-black text-gray-900 text-sm">{exp.title}</h4>
                        <span className="text-[11px] text-gray-500 font-bold block mt-0.5">{new Date(exp.date).toLocaleDateString()}</span>
                      </div>
                      <span className="bg-slate-100 text-gray-800 px-2 py-0.5 rounded-md text-[10px] font-bold border border-gray-200 shrink-0">
                        {exp.category}
                      </span>
                    </div>

                    {exp.notes && <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-150">{exp.notes}</p>}

                    <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Paid To / Method</span>
                        <span className="font-bold text-gray-800">{exp.paidTo || '-'} ({exp.paymentMethod || 'Cash'})</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm text-gray-900 font-sans">Rs {(exp.amount || 0).toLocaleString()}</span>
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          disabled={deletingExpense}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition text-xs border border-red-100 cursor-pointer"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={filteredExpenses.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      )}

      {/* 4. MODALS */}

      {/* MODAL A: ADD NEW MATERIAL SUPPLIER */}
      {isAddSupplierOpen && (
        <AddSupplierModal closeModal={() => setIsAddSupplierOpen(false)} />
      )}

      {/* MODAL B: PURCHASE MATERIAL (MAAL LIYA) */}
      {isPurchaseModalOpen && selectedSupplier && (
        <PurchaseMaterialModal 
          supplier={selectedSupplier} 
          closeModal={() => {
            setIsPurchaseModalOpen(false);
            setSelectedSupplier(null);
          }} 
        />
      )}

      {/* MODAL C: SUPPLIER KHATA STATEMENT & SETTLEMENT */}
      {isLedgerModalOpen && selectedSupplier && (
        <SupplierLedgerModal 
          supplier={selectedSupplier} 
          closeModal={() => {
            setIsLedgerModalOpen(false);
            setSelectedSupplier(null);
          }} 
        />
      )}

      {/* MODAL D: LOG DIRECT SHOP EXPENSE */}
      {isDirectExpenseOpen && (
        <DirectExpenseModal closeModal={() => setIsDirectExpenseOpen(false)} />
      )}

    </div>
  );
};

export default AdminExpenses;
