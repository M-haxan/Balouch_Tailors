import React, { useState } from 'react';
import { FiX, FiPrinter } from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import { useGetSupplierLedger, useSettleSupplier } from '../hooks/useExpenses';
import { formatPhone } from '../utils/formatters';
import Pagination from './Pagination';
import VendorStatementPrintModal from './VendorStatementPrintModal';

// -------------------------------------------------------------
// MODAL: SUPPLIER KHATA STATEMENT & SETTLEMENT MODAL
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
  const [ledgerPage, setLedgerPage] = useState(1);
  const LEDGER_PAGE_SIZE = 10;

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
    setLedgerPage(1);
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
              Contact: <span className="text-white font-bold">{currentSupplier.name}</span> ({formatPhone(currentSupplier.phone)}) | <span className="text-[#DFAC43] font-semibold">{currentSupplier.category}</span>
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
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setLedgerPage(1);
                }}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-black"
              />
              <span className="text-gray-400 font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setLedgerPage(1);
                }}
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
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
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
                    {filteredEntries.slice((ledgerPage - 1) * LEDGER_PAGE_SIZE, ledgerPage * LEDGER_PAGE_SIZE).map((entry) => {
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

              {/* Mobile Table-to-Card View */}
              <div className="block sm:hidden space-y-2.5">
                {filteredEntries.slice((ledgerPage - 1) * LEDGER_PAGE_SIZE, ledgerPage * LEDGER_PAGE_SIZE).map((entry) => {
                  const isPurchase = entry.type === 'purchase';
                  const isPaid = entry.paymentStatus === 'Paid';
                  return (
                    <div key={entry._id} className="bg-white rounded-lg border border-gray-200 p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                            isPurchase ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-900'
                          }`}>
                            {isPurchase ? 'Purchase' : 'Payment'}
                          </span>
                          <span className="font-bold text-gray-900 text-xs truncate">
                            {isPurchase ? entry.itemDetails : `Settlement (${entry.paymentMethod || 'Cash'})`}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono shrink-0">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>

                      {entry.notes && (
                        <p className="text-[10px] text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-150">
                          {entry.notes}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">
                            {isPurchase ? 'Bill Amount' : 'Paid Amount'}
                          </span>
                          <span className={`font-black font-sans ${isPurchase ? 'text-gray-900' : 'text-green-700'}`}>
                            Rs {entry.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">Baqi Balance</span>
                          <span className={`inline-block px-1.5 py-0.5 rounded font-black font-sans text-xs ${
                            entry.runningBalance > 0 ? 'bg-amber-50 text-[#DFAC43] border border-[#DFAC43]/30' : 'bg-green-50 text-green-700'
                          }`}>
                            Rs {entry.runningBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {filteredEntries.length > 0 && (
            <Pagination
              currentPage={ledgerPage}
              totalItems={filteredEntries.length}
              pageSize={LEDGER_PAGE_SIZE}
              onPageChange={setLedgerPage}
              className="mt-2 rounded border"
            />
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

export default SupplierLedgerModal;
