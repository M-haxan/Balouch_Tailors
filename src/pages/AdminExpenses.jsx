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
  FiDollarSign, 
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
              <FiPlus className="text-base" /> + Add Material Vendor
            </button>
            <button
              onClick={() => setIsDirectExpenseOpen(true)}
              className="bg-[#1E293B] hover:bg-gray-800 text-white font-bold px-4 py-2.5 rounded text-xs transition border border-gray-700 flex items-center gap-1.5"
            >
              <FiDollarSign className="text-sm" /> + Log Shop Expense
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
            <span className="text-[10px] text-amber-300 uppercase font-black block">Abhi Denay Hain (Material)</span>
            <p className="text-xl font-black text-[#DFAC43] mt-1">
              Rs {(supplierSummary.totalBalancePayableAll || 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-amber-200/70 font-semibold">Vendor Outstanding Udhar</span>
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
                + Register First Vendor (Bukram, Kaj, Thread)
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0F172A] text-[#DFAC43] uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="p-4 rounded-tl">Shop / Vendor Name</th>
                    <th className="p-4">Contact Person</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-right">Total Purchases</th>
                    <th className="p-4 text-right">Total Paid</th>
                    <th className="p-4 text-right">Abhi Denay Hain</th>
                    <th className="p-4 rounded-tr text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSuppliers.map((supplier) => {
                    const payable = Number(supplier.balancePayable) || 0;
                    return (
                      <tr key={supplier._id} className="hover:bg-gray-50/80 transition font-medium">
                        
                        {/* Shop Name & Address */}
                        <td className="p-4">
                          <p className="font-black text-gray-900 text-sm">{supplier.shopName}</p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <FiMapPin className="text-gray-400" /> {supplier.address || 'Local Market'}
                          </p>
                        </td>

                        {/* Contact Person */}
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{supplier.name}</p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                            <FiPhone className="text-gray-400" /> {supplier.phone}
                          </p>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className="bg-slate-100 text-gray-800 px-2.5 py-1 rounded text-[10px] font-bold uppercase border border-gray-200">
                            {supplier.category}
                          </span>
                        </td>

                        {/* Total Purchases */}
                        <td className="p-4 text-right font-bold text-gray-800">
                          Rs {(supplier.totalPurchases || 0).toLocaleString()}
                        </td>

                        {/* Total Paid */}
                        <td className="p-4 text-right font-bold text-green-700">
                          Rs {(supplier.totalPaid || 0).toLocaleString()}
                        </td>

                        {/* Abhi Denay Hain (Payable) */}
                        <td className="p-4 text-right">
                          {payable > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-[#DFAC43]/40 text-amber-950 px-2.5 py-1 rounded text-xs font-black">
                              <FiAlertTriangle className="text-xs text-[#DFAC43]" />
                              Rs {payable.toLocaleString()}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-xs font-bold">
                              <FiCheckCircle className="text-xs text-green-600" /> Settled (Rs 0)
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5 items-center whitespace-nowrap">
                            
                            {/* + Maal Purchase Button */}
                            <button
                              onClick={() => openPurchaseModal(supplier)}
                              className="bg-[#DFAC43] hover:bg-black hover:text-[#DFAC43] text-[#0F172A] font-black px-2.5 py-1.5 rounded text-xs transition shadow-sm flex items-center gap-1"
                              title="Purchase Material Entry"
                            >
                              <FiPlus /> Maal Liya
                            </button>

                            {/* Khata & Statement Button */}
                            <button
                              onClick={() => openLedgerModal(supplier)}
                              className="bg-[#0F172A] hover:bg-gray-800 text-[#DFAC43] font-bold px-2.5 py-1.5 rounded text-xs transition flex items-center gap-1 border border-gray-700"
                              title="View Vendor Statement & Pay"
                            >
                              <FiBook /> Khata
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteSupplier(supplier._id)}
                              disabled={deletingSupplier}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition text-sm"
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
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0F172A] text-[#DFAC43] uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="p-4 rounded-tl">Expense Detail</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Paid To</th>
                    <th className="p-4">Method</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 rounded-tr text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-gray-50/80 transition font-medium">
                      <td className="p-4">
                        <p className="font-black text-gray-900 text-sm">{exp.title}</p>
                        {exp.notes && <p className="text-[11px] text-gray-500 mt-0.5">{exp.notes}</p>}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-gray-800 px-2.5 py-1 rounded text-[10px] font-bold border border-gray-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 font-bold">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-800 font-bold">{exp.paidTo || '-'}</td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {exp.paymentMethod || 'Cash'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-gray-900 text-sm font-sans">
                        Rs {(exp.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          disabled={deletingExpense}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition text-sm"
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
          Maal Purchase Entry
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Vendor: <span className="font-bold text-black">{supplier.shopName}</span> ({supplier.category})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-gray-700 mb-1">Item Details (Detail se likhein) *</label>
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
            <span className="block text-gray-700">Payment Condition:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, paymentStatus: 'Unpaid' })}
                className={`py-2 rounded font-black text-xs transition border ${
                  form.paymentStatus === 'Unpaid'
                    ? 'bg-amber-500 text-black border-amber-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                ⚠️ Udhar (Khate Mein Add Karein)
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, paymentStatus: 'Paid' })}
                className={`py-2 rounded font-black text-xs transition border ${
                  form.paymentStatus === 'Paid'
                    ? 'bg-green-600 text-white border-green-700 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                ✓ Cash Paid Foren De Diye
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
// MODAL 3: SUPPLIER KHATA STATEMENT & SETTLEMENT MODAL
const SupplierLedgerModal = ({ supplier, closeModal }) => {
  const { data: ledgerData = {}, isLoading } = useGetSupplierLedger(supplier._id);
  const { mutate: settlePayment, isPending: settling } = useSettleSupplier();

  const [settleAmount, setSettleAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [settleNotes, setSettleNotes] = useState('');
  const [isSettlingMode, setIsSettlingMode] = useState(false);

  const entries = ledgerData.ledger || [];
  const currentSupplier = ledgerData.supplier || supplier;
  const balance = Number(currentSupplier.balancePayable) || 0;

  const handleSettle = (e) => {
    e.preventDefault();
    if (!settleAmount || Number(settleAmount) <= 0) return;

    settlePayment({
      id: supplier._id,
      data: {
        amount: Number(settleAmount),
        paymentMethod,
        notes: settleNotes || 'Vendor bill settlement'
      }
    }, {
      onSuccess: () => {
        setIsSettlingMode(false);
        setSettleAmount('');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="bg-[#0F172A] text-white p-6 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span className="w-2 h-4 bg-[#DFAC43] rounded-sm"></span>
              {currentSupplier.shopName}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Malik: {currentSupplier.name} | Phone: {currentSupplier.phone} | {currentSupplier.category}
            </p>
          </div>
          
          <button onClick={closeModal} className="text-gray-400 hover:text-white text-xl">
            <FiX />
          </button>
        </div>

        {/* BALANCE BANNER */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <span className="text-[10px] uppercase text-gray-500 font-bold block">Current Outstanding Balance:</span>
            <p className={`text-2xl font-black font-sans ${balance > 0 ? 'text-[#DFAC43]' : 'text-green-600'}`}>
              Rs {balance.toLocaleString()}
            </p>
          </div>

          {balance > 0 && !isSettlingMode && (
            <button
              onClick={() => {
                setSettleAmount(balance);
                setIsSettlingMode(true);
              }}
              className="bg-[#DFAC43] hover:bg-black hover:text-[#DFAC43] text-[#0F172A] font-black px-4 py-2 rounded text-xs transition shadow flex items-center gap-1.5"
            >
              <FiDollarSign /> Paise Ada Karein (Pay Vendor)
            </button>
          )}
        </div>

        {/* SETTLEMENT FORM DRAWER */}
        {isSettlingMode && (
          <form onSubmit={handleSettle} className="bg-amber-50/50 p-4 border-b border-amber-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-amber-950 uppercase">Vendor Payment Entry:</span>
              <button 
                type="button" 
                onClick={() => setIsSettlingMode(false)}
                className="text-xs text-gray-500 hover:text-black underline"
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
                  className="w-full border border-gray-300 focus:border-black rounded p-2 outline-none font-black text-sm"
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
                  className="w-full border border-gray-300 focus:border-black rounded p-2 outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={settling}
              className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black p-2.5 rounded text-xs transition shadow"
            >
              {settling ? 'Processing Settlement...' : `Confirm Rs ${settleAmount} Payment to Vendor`}
            </button>
          </form>
        )}

        {/* LEDGER ENTRIES TABLE */}
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider mb-3">Itemized Transaction History</h4>
          
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 font-bold">Loading statement...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs font-bold">No purchase or payment entries yet.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-[10px] font-black border-b">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Items & Details</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50 font-medium">
                    <td className="p-2.5 text-gray-600 font-bold whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        entry.type === 'purchase' ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-900'
                      }`}>
                        {entry.type === 'purchase' ? '📦 Maal Liya' : '💵 Paisa Diya'}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-gray-900">
                      {entry.itemDetails}
                      {entry.notes && <span className="block text-[10px] text-gray-400 font-normal">{entry.notes}</span>}
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.paymentStatus === 'Paid' ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        {entry.paymentStatus}
                      </span>
                    </td>
                    <td className={`p-2.5 text-right font-black font-sans text-sm ${
                      entry.type === 'purchase' ? 'text-gray-900' : 'text-green-600'
                    }`}>
                      {entry.type === 'payment' ? `- Rs ${entry.amount}` : `+ Rs ${entry.amount}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-end">
          <button
            onClick={closeModal}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded text-xs transition"
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
