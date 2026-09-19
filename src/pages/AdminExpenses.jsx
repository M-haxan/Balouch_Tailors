import React, { useState } from 'react';
import { 
  useGetSuppliers, 
  useAddSupplier, 
  useAddSupplierPurchase, 
  useSettleSupplier, 
  useDeleteSupplier,
  useGetSupplierLedger,
  useGetExpenses, 
  useAddDirectExpense, 
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
  FiTool,
  FiCheck,
  FiPrinter,
  FiSliders,
  FiArrowLeft
} from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import logo from '../assets/BT_Logo.png';
import Preloader from '../components/Preloader';

const SUPPLIER_CATEGORIES = [
  'Bukram & Canvas',
  'Kaj & Buttons',
  'Thread & Zips',
  'Fabric & Linings',
  'Machine & Parts',
  'General Accessories',
  'Other'
];

const EXPENSE_CATEGORIES = [
  'Material & Supplies',
  'Shop Rent',
  'Electricity & Utilities',
  'Machine Maintenance & Oil',
  'Tea & Refreshment',
  'Worker Food / Daily Allowance',
  'Staff Salary / Other Labor',
  'Packaging & Bags',
  'Misc & General'
];

const AdminExpenses = () => {
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' | 'direct' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  
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
    if (window.confirm('Are you sure you want to delete this supplier and all their ledger history?')) {
      deleteSupplier(id);
    }
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense entry?')) {
      deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* 1. TOP HEADER & METRIC TILES */}
      <div className="bg-[#0F172A] text-white rounded p-6 md:p-8 border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#DFAC43]"></span>
              <span className="text-xs text-gray-400 font-medium">Balouch Tailors Supply & Expense Control</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Shop Expenses & Material Vendors
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl font-medium">
              Track Bukram, Kaj, Button & Thread shops, maintain itemized vendor ledgers, and manage operational utility expenses.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsAddSupplierOpen(true)}
              className="bg-[#DFAC43] hover:bg-white text-[#0F172A] font-black px-4 py-2.5 rounded text-xs transition shadow-lg flex items-center gap-1.5"
            >
              <FiPlus className="text-base" /> Add Material Vendor
            </button>
            <button
              onClick={() => setIsDirectExpenseOpen(true)}
              className="bg-[#1E293B] hover:bg-gray-800 text-white font-bold px-4 py-2.5 rounded text-xs transition border border-gray-700 flex items-center gap-1.5 cursor-pointer"
            >
              <FaMoneyBillWave className="text-sm text-[#DFAC43]" /> Log Shop Expense
            </button>
          </div>
        </div>

        {/* 4 HIGHLIGHT METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-gray-800">
          
          <div className="bg-[#1E293B]/60 p-3.5 rounded border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-black block">Total Material Purchases</span>
            <p className="text-xl font-black text-white mt-1">Rs {(supplierSummary.totalPurchasesAll || 0).toLocaleString()}</p>
            <span className="text-[10px] text-gray-400">{suppliers.length} Registered Vendors</span>
          </div>

          <div className="bg-[#1E293B]/60 p-3.5 rounded border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-black block">Paid to Material Shops</span>
            <p className="text-xl font-black text-green-400 mt-1">Rs {(supplierSummary.totalPaidAll || 0).toLocaleString()}</p>
            <span className="text-[10px] text-gray-400">Settled Purchases</span>
          </div>

          {/* CRITICAL METRIC: Abhi Denay Hain (Material Walon Ko) */}
          <div className="bg-amber-950/40 p-3.5 rounded border border-[#DFAC43]/40">
            <span className="text-[10px] text-amber-300 uppercase font-black block">Remaining Payment </span>
            <p className="text-xl font-black text-[#DFAC43] mt-1">
              Rs {(supplierSummary.totalBalancePayableAll || 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-amber-200/70 font-semibold">Vendor Outstanding Dues</span>
          </div>

          <div className="bg-[#1E293B]/60 p-3.5 rounded border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-black block">Direct Shop Expenses</span>
            <p className="text-xl font-black text-gray-200 mt-1">Rs {(expenseData.totalExpenseAmount || 0).toLocaleString()}</p>
            <span className="text-[10px] text-gray-400">Rent, Bills, Tea & Misc</span>
          </div>

        </div>
      </div>

      {/* 2. TAB CONTROLS & SEARCH */}
      <div className="bg-white rounded border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'suppliers'
                ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiShoppingBag /> Material Vendors & Shops ({suppliers.length})
          </button>
          
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2 rounded text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'direct'
                ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiTool /> Operational Expenses ({expenses.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search vendor, item or category..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:border-black rounded outline-none font-medium text-xs transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      
      {/* TAB 1: MATERIAL SHOPS / SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs font-bold space-y-3">
              <p>No material vendors registered yet.</p>
              <button
                onClick={() => setIsAddSupplierOpen(true)}
                className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-bold px-4 py-2 rounded text-xs transition"
              >
                Register First Vendor (Bukram, Kaj, Thread)
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left border-collapse text-xs">
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
                <tbody className="divide-y divide-gray-100">
                  {filteredSuppliers.map((supplier) => {
                    const payable = Number(supplier.balancePayable) || 0;
                    return (
                      <tr key={supplier._id} className="hover:bg-gray-50/80 transition font-medium">
                        
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
                            <FiPhone className="text-gray-400 shrink-0" /> {supplier.phone}
                          </p>
                        </td>

                        {/* Category */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="inline-block bg-slate-100 text-gray-800 px-2.5 py-1 rounded text-[10px] font-bold uppercase border border-gray-200 whitespace-nowrap">
                            {supplier.category}
                          </span>
                        </td>

                        {/* Total Purchases */}
                        <td className="p-4 text-right font-bold text-gray-800 whitespace-nowrap">
                          Rs {(supplier.totalPurchases || 0).toLocaleString()}
                        </td>

                        {/* Total Paid */}
                        <td className="p-4 text-right font-bold text-green-700 whitespace-nowrap">
                          Rs {(supplier.totalPaid || 0).toLocaleString()}
                        </td>

                        {/* Total Dues (Payable) */}
                        <td className="p-4 text-right whitespace-nowrap">
                          {payable > 0 ? (
                            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-[#DFAC43]/40 text-amber-950 px-2.5 py-1 rounded text-xs font-black whitespace-nowrap">
                              <FiAlertTriangle className="text-xs text-[#DFAC43] shrink-0" />
                              Rs {payable.toLocaleString()}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap">
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
                              className="bg-[#DFAC43] hover:bg-black hover:text-[#DFAC43] text-[#0F172A] font-black px-2.5 py-1.5 rounded text-xs transition shadow-sm flex items-center gap-1 shrink-0 cursor-pointer"
                              title="Purchase Material Entry"
                            >
                              <FiPlus className="shrink-0" /> Purchase Goods
                            </button>

                            {/* Account Book Button */}
                            <button
                              onClick={() => openLedgerModal(supplier)}
                              className="bg-[#0F172A] hover:bg-gray-800 text-[#DFAC43] font-bold px-2.5 py-1.5 rounded text-xs transition flex items-center gap-1 border border-gray-700 shrink-0 cursor-pointer"
                              title="View Vendor Statement & Pay"
                            >
                              <FiBook className="shrink-0" /> Account Book
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteSupplier(supplier._id)}
                              disabled={deletingSupplier}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition text-sm shrink-0 cursor-pointer"
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
          )}
        </div>
      )}

      {/* TAB 2: DIRECT OPERATIONAL SHOP EXPENSES */}
      {activeTab === 'direct' && (
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs font-bold space-y-3">
              <p>No operational expenses recorded.</p>
              <button
                onClick={() => setIsDirectExpenseOpen(true)}
                className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-bold px-4 py-2 rounded text-xs transition"
              >
                + Log Rent, Utility or Maintenance Expense
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse text-xs">
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
                <tbody className="divide-y divide-gray-100">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-gray-50/80 transition font-medium">
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
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition text-sm cursor-pointer"
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

// -------------------------------------------------------------
// MODAL 1: ADD NEW SUPPLIER
const AddSupplierModal = ({ closeModal }) => {
  const { mutate: addSupplier, isPending } = useAddSupplier();
  const [form, setForm] = useState({
    shopName: '',
    name: '',
    phone: '',
    category: 'Bukram & Canvas',
    address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addSupplier(form, {
      onSuccess: () => closeModal()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded border border-gray-200 shadow-2xl w-full max-w-md p-6 relative">
        <button 
          onClick={closeModal} 
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-lg"
        >
          <FiX />
        </button>

        <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wider mb-1 flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-[#DFAC43] rounded-sm"></span>
          Register Material Vendor
        </h3>
        <p className="text-xs text-gray-500 mb-5">Add details of Bukram, Kaj, Button or Thread shop.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-gray-700 mb-1">Dukan / Shop Name *</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Madina Bukram & Button Store" 
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Contact Person / Malik Name *</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Haji Abdul Rehman" 
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1">Phone Number *</label>
              <input 
                required
                type="text" 
                placeholder="0300-1234567" 
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs bg-white"
              >
                {SUPPLIER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Market Address (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Shop # 14, Cloth Market" 
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black p-3 rounded transition shadow-md mt-6"
          >
            {isPending ? 'Saving Vendor...' : 'Save Material Vendor'}
          </button>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// MODAL 2: PURCHASE MATERIAL ENTRY (MAAL LIYA)
const PurchaseMaterialModal = ({ supplier, closeModal }) => {
  const { mutate: addPurchase, isPending } = useAddSupplierPurchase();
  const [form, setForm] = useState({
    itemDetails: '',
    amount: '',
    paymentStatus: 'Unpaid', // 'Paid' | 'Unpaid'
    paymentMethod: 'Cash',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addPurchase({
      id: supplier._id,
      data: form
    }, {
      onSuccess: () => closeModal()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded border border-gray-200 shadow-2xl w-full max-w-md p-6 relative">
        <button 
          onClick={closeModal} 
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-lg"
        >
          <FiX />
        </button>

        <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wider mb-1 flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-[#DFAC43] rounded-sm"></span>
          Goods Purchase Entry
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Vendor: <span className="font-bold text-black">{supplier.shopName}</span> ({supplier.category})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-gray-700 mb-1">Item Details</label>
            <input 
              required
              type="text" 
              placeholder="e.g. 5 Roll Hard Bukram + 20 pkt Black Buttons" 
              value={form.itemDetails}
              onChange={(e) => setForm({ ...form, itemDetails: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1">Total Bill / Amount (Rs) *</label>
              <input 
                required
                type="number" 
                min="1"
                placeholder="3500" 
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-black text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Purchase Date *</label>
              <input 
                required
                type="date" 
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs bg-white"
              />
            </div>
          </div>

          {/* Payment Status (Cash Paid now vs Added to Udhar) */}
          <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2">
            <span className="block text-gray-700 font-bold">Payment Condition:</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, paymentStatus: 'Unpaid' })}
                className={`py-2.5 px-2 rounded font-bold text-xs transition border flex items-center justify-center gap-2 text-center cursor-pointer ${
                  form.paymentStatus === 'Unpaid'
                    ? 'bg-amber-500 text-black border-amber-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <FiAlertTriangle className="text-sm shrink-0" />
                <span className="leading-tight">
                  Outstanding Due
                  <span className="block text-[10px] font-medium opacity-90">(Add to Ledger)</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, paymentStatus: 'Paid' })}
                className={`py-2.5 px-2 rounded font-bold text-xs transition border flex items-center justify-center gap-2 text-center cursor-pointer ${
                  form.paymentStatus === 'Paid'
                    ? 'bg-green-600 text-white border-green-700 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <FiCheck className="text-base shrink-0" />
                <span className="leading-tight">
                  Paid Cash Directly
                  <span className="block text-[10px] font-medium opacity-90">(Full Paid)</span>
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Notes / Extra Detail</label>
            <input 
              type="text" 
              placeholder="e.g. Bill # 402 - Brought by Worker" 
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black p-3 rounded transition shadow-md mt-4"
          >
            {isPending ? 'Logging Purchase...' : 'Save Purchase Entry'}
          </button>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT: VENDOR KHATA STATEMENT PRINT MODAL (56mm, 80mm, A4)
const VendorStatementPrintModal = ({ supplier, processedEntries, balance, periodLabel, periodPurchases, periodPaid, closeModal }) => {
  const [paperSize, setPaperSize] = useState('80mm');

  const handlePrint = () => {
    try {
      const originalTitle = document.title;
      document.title = `Khata_Statement_${supplier.shopName.replace(/\s+/g, '_')}`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    } catch (err) {
      console.error('Print trigger error:', err);
      window.print();
    }
  };

  const containerWidthClass =
    paperSize === '56mm' ? 'w-[56mm] max-w-[56mm] text-[10px] p-2' :
    paperSize === '80mm' ? 'w-[80mm] max-w-[80mm] text-xs p-3.5' :
    'w-full max-w-3xl text-sm px-8 py-10';

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-gray-900/85 backdrop-blur-sm p-3 sm:p-6 font-sans">
      <div className="min-h-full flex flex-col items-center justify-start pb-12">
        
        {/* Dynamic Print CSS */}
        <style>{`
          @media print {
            @page {
              size: ${paperSize === '56mm' ? '56mm auto' : paperSize === '80mm' ? '80mm auto' : 'A4 portrait'};
              margin: ${paperSize === '56mm' ? '0mm' : paperSize === '80mm' ? '0mm' : '8mm'};
            }
            *, *:before, *:after {
              box-shadow: none !important;
              text-shadow: none !important;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            header, nav, aside, footer, .no-print, .Toastify {
              display: none !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
            }
            body * {
              visibility: hidden !important;
            }
            #printable-vendor-slip, #printable-vendor-slip * {
              visibility: visible !important;
            }
            #printable-vendor-slip {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              right: 0 !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              border: none !important;
              width: ${paperSize === '56mm' ? '54mm' : paperSize === '80mm' ? '76mm' : '100%'} !important;
              max-width: ${paperSize === '56mm' ? '54mm' : paperSize === '80mm' ? '76mm' : '100%'} !important;
              padding: ${paperSize === '56mm' ? '1.5mm' : paperSize === '80mm' ? '2.5mm' : '0mm'} !important;
              background: #ffffff !important;
            }
          }
        `}</style>

        {/* Top Sticky Bar (Screen only) */}
        <div className="w-full max-w-3xl sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-center gap-3 mb-4 no-print bg-white p-3 rounded shadow-lg border border-gray-200">
          
          <button 
            onClick={closeModal} 
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded font-bold flex items-center gap-2 transition text-xs sm:text-sm cursor-pointer"
          >
            <FiArrowLeft /> Back to Khata
          </button>

          {/* 3 Size Selector Pills */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded border border-gray-200 text-xs font-bold">
            <span className="text-gray-400 px-2 hidden sm:inline-flex items-center gap-1">
              <FiSliders /> Size:
            </span>

            <button
              type="button"
              onClick={() => setPaperSize('56mm')}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                paperSize === '56mm' 
                  ? 'bg-[#0F172A] text-[#DFAC43] font-black shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              56mm Thermal
            </button>

            <button
              type="button"
              onClick={() => setPaperSize('80mm')}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                paperSize === '80mm' 
                  ? 'bg-[#0F172A] text-[#DFAC43] font-black shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              80mm POS
            </button>

            <button
              type="button"
              onClick={() => setPaperSize('a4')}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                paperSize === 'a4' 
                  ? 'bg-[#0F172A] text-[#DFAC43] font-black shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              A4 Sheet
            </button>
          </div>

          {/* Print Button */}
          <button 
            onClick={handlePrint} 
            type="button"
            className="bg-[#0F172A] hover:bg-[#DFAC43] active:scale-95 text-[#DFAC43] hover:text-[#0F172A] px-6 py-2 rounded shadow-md font-black tracking-wide flex items-center gap-2 transition text-xs sm:text-sm cursor-pointer"
          >
            <FiPrinter className="text-base" /> Print Slip
          </button>
        </div>

        {/* --- PRINTABLE SLIP CONTAINER --- */}
        <div 
          id="printable-vendor-slip"
          className={`bg-white shadow-2xl border border-gray-200 text-black mx-auto overflow-hidden transition-all ${containerWidthClass}`}
          style={{
            minHeight: paperSize === 'a4' ? '10in' : 'auto'
          }}
        >
          {/* HEADER */}
          <div className="text-center pb-3 border-b-2 border-dashed border-gray-300 mb-3 space-y-1">
            <div className="flex justify-center mb-1">
              <img 
                src={logo} 
                alt="Balouch Tailors" 
                className={paperSize === '56mm' ? 'h-10 w-auto object-contain' : paperSize === '80mm' ? 'h-12 w-auto object-contain' : 'h-16 w-auto object-contain'} 
              />
            </div>
            <h1 className={`font-black uppercase tracking-wider text-black ${
              paperSize === '56mm' ? 'text-sm' : paperSize === '80mm' ? 'text-lg' : 'text-2xl'
            }`}>
              Balouch Tailors
            </h1>
            <p className={`font-extrabold text-[#D4AF37] uppercase tracking-widest ${
              paperSize === '56mm' ? 'text-[8px]' : paperSize === '80mm' ? 'text-[10px]' : 'text-xs'
            }`}>
              Gents Shalwar Qameez Specialist
            </p>
            <p className={`font-bold text-gray-900 ${
              paperSize === '56mm' ? 'text-[8px]' : paperSize === '80mm' ? 'text-[10px]' : 'text-xs'
            }`}>
            
            </p>
            <p className={`text-gray-500 font-medium ${
              paperSize === '56mm' ? 'text-[7px] leading-tight' : paperSize === '80mm' ? 'text-[9px] leading-tight' : 'text-xs'
            }`}>
              Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan
            </p>
            <div className="pt-1">
              <span className="inline-block bg-[#0F172A] text-white px-3 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                Vendor Khata Statement
              </span>
            </div>
          </div>

          {/* VENDOR & STATEMENT DETAILS */}
          <div className={`mb-3 pb-2.5 border-b border-gray-200 ${
            paperSize === 'a4' ? 'flex justify-between items-center' : 'space-y-1 text-left'
          }`}>
            <div>
              <span className="text-gray-400 font-bold uppercase text-[8px] sm:text-[9px] block">Vendor Details:</span>
              <p className="font-black text-gray-900 text-xs sm:text-sm">{supplier.shopName}</p>
              <p className="font-bold text-gray-700 text-[10px] sm:text-xs">Contact: {supplier.name} ({supplier.phone})</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">{supplier.category} | {supplier.address || 'Local Market'}</p>
            </div>
            <div className={paperSize === 'a4' ? 'text-right' : 'pt-1 border-t border-dashed border-gray-100 text-[9px] sm:text-[10px]'}>
              <p><span className="text-gray-500 font-bold">Statement Period:</span> <span className="font-bold text-black">{periodLabel}</span></p>
              <p><span className="text-gray-500 font-bold">Printed On:</span> <span>{new Date().toLocaleDateString()} ({new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span></p>
            </div>
          </div>

          {/* ITEMIZED RUNNING BALANCE KHATA TABLE */}
          <table className="w-full text-left border-collapse mb-3">
            <thead>
              <tr className={`border-b-2 border-black font-black uppercase text-gray-700 ${
                paperSize === '56mm' ? 'text-[7px]' : paperSize === '80mm' ? 'text-[9px]' : 'text-xs'
              }`}>
                <th className="py-1 pr-1 whitespace-nowrap">Date</th>
                <th className="py-1 px-1">Description / Items</th>
                <th className="py-1 px-1 text-right whitespace-nowrap">Bill (+)</th>
                <th className="py-1 px-1 text-right whitespace-nowrap">Paid (-)</th>
                <th className="py-1 pl-1 text-right whitespace-nowrap">Balance</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-100 ${
              paperSize === '56mm' ? 'text-[7px]' : paperSize === '80mm' ? 'text-[9px]' : 'text-xs'
            }`}>
              {processedEntries.map((entry, idx) => {
                const isPurchase = entry.type === 'purchase';
                const isPaid = entry.paymentStatus === 'Paid';
                return (
                  <tr key={entry._id || idx}>
                    <td className="py-1 pr-1 font-mono text-gray-600 whitespace-nowrap align-top">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="py-1 px-1 font-bold text-gray-900 align-top">
                      <span className="block leading-tight">
                        {isPurchase ? entry.itemDetails : `Cash Settlement (${entry.paymentMethod || 'Cash'})`}
                      </span>
                      {entry.notes && <span className="block text-[7px] text-gray-400 font-normal leading-tight mt-0.5">{entry.notes}</span>}
                    </td>
                    <td className="py-1 px-1 text-right font-bold text-gray-800 font-sans whitespace-nowrap align-top">
                      {isPurchase ? `Rs ${entry.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-1 px-1 text-right font-bold text-green-700 font-sans whitespace-nowrap align-top">
                      {!isPurchase ? `Rs ${entry.amount.toLocaleString()}` : (isPaid ? `Rs ${entry.amount.toLocaleString()}` : '-')}
                    </td>
                    <td className="py-1 pl-1 text-right font-black font-sans text-gray-900 whitespace-nowrap align-top">
                      Rs {entry.runningBalance.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* FINANCIAL SUMMARY TOTALS */}
          <div className="border-t-2 border-black pt-2 mb-3 space-y-1 text-[9px] sm:text-xs">
            <div className="flex justify-between text-gray-600 font-bold">
              <span>Period Purchases ({periodLabel}):</span>
              <span className="font-sans">Rs {Number(periodPurchases || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-700 font-bold">
              <span>Period Payments Made:</span>
              <span className="font-sans">Rs {Number(periodPaid || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm font-black border-t-2 border-black pt-1.5 text-black">
              <span>Current Outstanding Balance Due:</span>
              <span className="font-sans text-[#DFAC43] bg-[#0F172A] px-2 py-0.5 rounded">
                Rs {balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* FOOTER & PROPRIETOR DETAILS */}
          <div className="text-center pt-2 border-t border-dashed border-gray-300 space-y-1 text-[7px] sm:text-[9px] text-gray-500">
            <p className="font-black text-gray-800">
              Thank you for your business & partnership!
            </p>
            <div className="bg-gray-100 rounded py-1 px-2 text-gray-700 font-bold inline-block border border-gray-200">
              Proprietor: <span className="text-black font-black">Zubair Balouch</span> | 
              📞 0313-4389192 | 0306-7379919
            </div>
            <p className="text-[7px] text-gray-400">
              Computer Generated Vendor Statement | Balouch Tailors Multan
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

// -------------------------------------------------------------
// MODAL 3: SUPPLIER KHATA STATEMENT & SETTLEMENT MODAL
const SupplierLedgerModal = ({ supplier, closeModal }) => {
  const { data: ledgerData = {}, isLoading } = useGetSupplierLedger(supplier._id);
  const { mutate: settlePayment, isPending: settling } = useSettleSupplier();

  const [settleAmount, setSettleAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [settleNotes, setSettleNotes] = useState('');
  const [isSettlingMode, setIsSettlingMode] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Date Range Filter State
  const [datePreset, setDatePreset] = useState('all'); // 'all' | 'this_month' | 'last_30' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const entries = ledgerData.ledger || [];
  const currentSupplier = ledgerData.supplier || supplier;
  const balance = Number(currentSupplier.balancePayable) || 0;

  // Calculate Running Balance Chronologically (earliest to latest)
  const sortedAsc = [...entries].sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));
  let running = 0;
  const processedAsc = sortedAsc.map(entry => {
    const isPurchase = entry.type === 'purchase';
    const isPaid = entry.paymentStatus === 'Paid';
    const amount = Number(entry.amount) || 0;
    
    if (isPurchase) {
      if (!isPaid) {
        running += amount;
      }
    } else {
      running = Math.max(0, running - amount);
    }
    
    return {
      ...entry,
      runningBalance: running
    };
  });
  const processedEntries = [...processedAsc].reverse();

  // Apply Date Range Filter
  const filteredEntries = processedEntries.filter(entry => {
    if (!startDate && !endDate) return true;
    const entryDate = new Date(entry.date).toISOString().split('T')[0];
    if (startDate && entryDate < startDate) return false;
    if (endDate && entryDate > endDate) return false;
    return true;
  });

  // Calculate Period Statistics
  const periodPurchases = filteredEntries
    .filter(e => e.type === 'purchase')
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const periodPaid = filteredEntries
    .filter(e => e.type === 'payment' || (e.type === 'purchase' && e.paymentStatus === 'Paid'))
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const periodUnpaidDues = filteredEntries
    .filter(e => e.type === 'purchase' && e.paymentStatus === 'Unpaid')
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  const getPeriodLabel = () => {
    if (datePreset === 'all' || (!startDate && !endDate)) return 'All Time';
    if (startDate && endDate) return `${startDate} to ${endDate}`;
    if (startDate) return `From ${startDate}`;
    if (endDate) return `Until ${endDate}`;
    return 'Custom Period';
  };

  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'this_month') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      setStartDate(`${year}-${month}-01`);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'last_30') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  const handleSettle = (e) => {
    e.preventDefault();
    if (!settleAmount || Number(settleAmount) <= 0) return;

    settlePayment({
      id: supplier._id,
      data: {
        amount: Number(settleAmount),
        paymentMethod,
        notes: settleNotes || (periodUnpaidDues > 0 && Number(settleAmount) === periodUnpaidDues ? `Cleared dues for period: ${getPeriodLabel()}` : 'Vendor bill settlement')
      }
    }, {
      onSuccess: () => {
        setIsSettlingMode(false);
        setSettleAmount('');
      }
    });
  };

  if (isPrintOpen) {
    return (
      <VendorStatementPrintModal 
        supplier={currentSupplier}
        processedEntries={filteredEntries}
        balance={balance}
        periodLabel={getPeriodLabel()}
        periodPurchases={periodPurchases}
        periodPaid={periodPaid}
        closeModal={() => setIsPrintOpen(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded border border-gray-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col relative overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="bg-[#0F172A] text-white p-5 sm:p-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span className="w-2 h-4 bg-[#DFAC43] rounded-sm"></span>
              {currentSupplier.shopName}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Contact: <span className="text-white font-bold">{currentSupplier.name}</span> ({currentSupplier.phone}) | <span className="text-[#DFAC43] font-semibold">{currentSupplier.category}</span>
            </p>
          </div>
          
          <button onClick={closeModal} className="text-gray-400 hover:text-white text-2xl p-1 leading-none cursor-pointer">
            <FiX />
          </button>
        </div>

        {/* BALANCE & PRIMARY ACTIONS BANNER (SINGLE PRINT BUTTON + PAY VENDOR) */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-[10px] uppercase text-gray-500 font-bold block">Current Net Balance Due:</span>
            <p className={`text-2xl sm:text-3xl font-black font-sans ${balance > 0 ? 'text-[#DFAC43]' : 'text-green-600'}`}>
              Rs {balance.toLocaleString()}
            </p>
            {balance === 0 && <span className="text-[10px] text-green-700 font-bold">Account Fully Settled (No Pending Dues)</span>}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {balance > 0 && !isSettlingMode && (
              <button
                onClick={() => {
                  setSettleAmount(periodUnpaidDues > 0 ? periodUnpaidDues : balance);
                  setIsSettlingMode(true);
                }}
                className="flex-1 sm:flex-none bg-[#DFAC43] hover:bg-black hover:text-[#DFAC43] text-[#0F172A] font-black px-4 py-2.5 rounded text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FaMoneyBillWave className="text-sm shrink-0" /> Pay Vendor
              </button>
            )}
            
            {/* SINGLE PROMINENT PRINT STATEMENT BUTTON */}
            <button
              onClick={() => setIsPrintOpen(true)}
              className="flex-1 sm:flex-none bg-[#0F172A] hover:bg-gray-800 text-[#DFAC43] font-bold px-4 py-2.5 rounded text-xs transition flex items-center justify-center gap-1.5 border border-gray-700 cursor-pointer shadow-sm"
              title="Print Filtered Statement Slip"
            >
              <FiPrinter className="text-sm shrink-0" /> Print Statement
            </button>
          </div>
        </div>

        {/* SETTLEMENT FORM DRAWER */}
        {isSettlingMode && (
          <form onSubmit={handleSettle} className="bg-amber-50/70 p-4 border-b border-amber-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-amber-950 uppercase">Vendor Payment Entry:</span>
              <button 
                type="button" 
                onClick={() => setIsSettlingMode(false)}
                className="text-xs text-gray-500 hover:text-black underline cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Pay Amount (Rs) *</label>
                <input 
                  required
                  type="number" 
                  max={balance}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full border border-gray-300 focus:border-black rounded p-2 outline-none font-black text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 focus:border-black rounded p-2 outline-none font-medium bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="JazzCash/EasyPaisa">JazzCash / EasyPaisa</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Note (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Paid in Market by Admin" 
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full border border-gray-300 focus:border-black rounded p-2 outline-none font-medium bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={settling}
              className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black p-2.5 rounded text-xs transition shadow cursor-pointer"
            >
              {settling ? 'Processing Settlement...' : `Confirm Rs ${settleAmount} Payment to Vendor`}
            </button>
          </form>
        )}

        {/* DATE RANGE FILTER CONTROLS */}
        <div className="bg-slate-50 border-b border-gray-200 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 font-bold">
            <span className="text-gray-500 text-[11px] mr-1">Period:</span>
            
            <button
              type="button"
              onClick={() => handlePresetChange('all')}
              className={`px-2.5 py-1 rounded text-[11px] transition cursor-pointer ${
                datePreset === 'all' 
                  ? 'bg-[#0F172A] text-[#DFAC43] font-black' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              All Time
            </button>

            <button
              type="button"
              onClick={() => handlePresetChange('this_month')}
              className={`px-2.5 py-1 rounded text-[11px] transition cursor-pointer ${
                datePreset === 'this_month' 
                  ? 'bg-[#0F172A] text-[#DFAC43] font-black' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              This Month
            </button>

            <button
              type="button"
              onClick={() => handlePresetChange('last_30')}
              className={`px-2.5 py-1 rounded text-[11px] transition cursor-pointer ${
                datePreset === 'last_30' 
                  ? 'bg-[#0F172A] text-[#DFAC43] font-black' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Last 30 Days
            </button>

            <button
              type="button"
              onClick={() => setDatePreset('custom')}
              className={`px-2.5 py-1 rounded text-[11px] transition cursor-pointer ${
                datePreset === 'custom' 
                  ? 'bg-[#0F172A] text-[#DFAC43] font-black' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Custom Date Pickers */}
          {datePreset === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-black"
              />
              <span className="text-gray-400 font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-black"
              />
            </div>
          )}

          {/* Period Summary Stats Badge */}
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="text-gray-600">Period Purchases: <span className="text-black font-black font-sans">Rs {periodPurchases.toLocaleString()}</span></span>
            <span className="text-gray-300">|</span>
            <span className="text-green-700">Paid: <span className="font-black font-sans">Rs {periodPaid.toLocaleString()}</span></span>
          </div>

        </div>

        {/* LEDGER ENTRIES TABLE (RUNNING BALANCE STANDARD KHATA) */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-2.5">
            <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider">
              {getPeriodLabel()} Transactions
            </h4>
            <span className="text-[10px] text-gray-400 font-bold">
              {filteredEntries.length} Records Found
            </span>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12 text-gray-500 font-bold">Loading statement...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-bold space-y-1">
              <p>No transactions found for this period.</p>
              <button onClick={() => handlePresetChange('all')} className="text-[#DFAC43] underline cursor-pointer">
                View All Time History
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-[10px] font-black border-b">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Type & Details</th>
                    <th className="p-2.5 text-right">Bill (+)</th>
                    <th className="p-2.5 text-right">Paid (-)</th>
                    <th className="p-2.5 text-right">Baqi Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEntries.map((entry) => {
                    const isPurchase = entry.type === 'purchase';
                    const isPaid = entry.paymentStatus === 'Paid';
                    return (
                      <tr key={entry._id} className="hover:bg-gray-50/80 font-medium">
                        <td className="p-2.5 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                              isPurchase ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-900'
                            }`}>
                              {isPurchase ? 'Purchase' : 'Payment'}
                            </span>
                            <span className="font-bold text-gray-900">
                              {isPurchase ? entry.itemDetails : `Cash Settlement (${entry.paymentMethod || 'Cash'})`}
                            </span>
                          </div>
                          {entry.notes && <span className="block text-[10px] text-gray-400 font-normal pl-1 mt-0.5">{entry.notes}</span>}
                        </td>
                        <td className="p-2.5 text-right font-bold text-gray-800 font-sans whitespace-nowrap">
                          {isPurchase ? `Rs ${entry.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-bold text-green-700 font-sans whitespace-nowrap">
                          {!isPurchase ? `Rs ${entry.amount.toLocaleString()}` : (isPaid ? `Rs ${entry.amount.toLocaleString()}` : '-')}
                        </td>
                        <td className="p-2.5 text-right font-black font-sans text-xs whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded ${
                            entry.runningBalance > 0 ? 'bg-amber-50 text-[#DFAC43] border border-[#DFAC43]/30' : 'bg-green-50 text-green-700'
                          }`}>
                            Rs {entry.runningBalance.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">
            Showing {filteredEntries.length} transaction records
          </span>
          <button
            onClick={closeModal}
            className="bg-[#0F172A] hover:bg-gray-800 text-white font-bold px-4 py-1.5 rounded text-xs transition cursor-pointer"
          >
            Close Statement
          </button>
        </div>

      </div>
    </div>
  );
};

// -------------------------------------------------------------
// MODAL 4: LOG DIRECT OPERATIONAL SHOP EXPENSE
const DirectExpenseModal = ({ closeModal }) => {
  const { mutate: addExpense, isPending } = useAddDirectExpense();
  const [form, setForm] = useState({
    title: '',
    category: 'Electricity & Utilities',
    amount: '',
    paidTo: '',
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense(form, {
      onSuccess: () => closeModal()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded border border-gray-200 shadow-2xl w-full max-w-md p-6 relative">
        <button 
          onClick={closeModal} 
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-lg"
        >
          <FiX />
        </button>

        <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wider mb-1 flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-[#DFAC43] rounded-sm"></span>
          Log Shop Expense
        </h3>
        <p className="text-xs text-gray-500 mb-4">Record rent, utility bills, machine oil, tea or general expenses.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-gray-700 mb-1">Expense Title / Description *</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Shop Electricity Bill - September" 
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs bg-white"
              >
                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Amount (Rs) *</label>
              <input 
                required
                type="number" 
                min="1"
                placeholder="4500" 
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-black text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 mb-1">Date *</label>
              <input 
                required
                type="date" 
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Paid To / Recipient</label>
              <input 
                type="text" 
                placeholder="e.g. WAPDA / Landlord" 
                value={form.paidTo}
                onChange={(e) => setForm({ ...form, paidTo: e.target.value })}
                className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs bg-white"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="JazzCash/EasyPaisa">JazzCash / EasyPaisa</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Notes (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Receipt # 104" 
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 focus:border-black rounded p-2.5 outline-none font-medium text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black p-3 rounded transition shadow-md mt-4"
          >
            {isPending ? 'Logging Expense...' : 'Save Expense Record'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminExpenses;
