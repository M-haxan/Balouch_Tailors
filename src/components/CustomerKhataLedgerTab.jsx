import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useGetShopSettings } from '../hooks/useShopSettings';
import CustomerKhataPrintModal from './CustomerKhataPrintModal';
import { FiAlertCircle, FiCheckCircle, FiCheck, FiPrinter } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

// ====================================================================
// SUB-COMPONENT: KHATA LEDGER TAB
// ====================================================================
const CustomerKhataLedgerTab = ({ customer, ledger = [], khataBalance = 0, openSettleModal }) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const { data: shopSettings } = useGetShopSettings();
  const shopName = shopSettings?.shopName || 'Balouch Tailors';

  const handleShareWhatsAppStatement = () => {
    const rawNum = customer.whatsapp || customer.phone;
    if (!rawNum) {
      toast.warning('No contact number available.');
      return;
    }
    const cleanPhone = rawNum.toString().replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone;

    let balanceText = '';
    if (khataBalance > 0) {
      balanceText = `*Baqiya Udhar (Payable):* Rs ${khataBalance.toLocaleString()}`;
    } else if (khataBalance < 0) {
      balanceText = `*Jama Advance (Credit):* Rs ${Math.abs(khataBalance).toLocaleString()}`;
    } else {
      balanceText = `*Status:* Khata Clear (Rs 0)`;
    }

    const message = `*${shopName.toUpperCase()} - KHATA STATEMENT*\n` +
      `Mohtaram *${customer.name}* Sahab (ID: #C-${customer.customerNumber || customer._id.slice(-4)}),\n\n` +
      `${balanceText}\n\n` +
      `Date: ${new Date().toLocaleDateString()}\n` +
      `Shukriya!\n*${shopName}*`;

    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">

        {/* Running Balance Banner */}
        <div className={`p-4 sm:p-6 rounded border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${khataBalance > 0
            ? 'bg-red-50/70 border-red-200 text-red-900'
            : khataBalance < 0
              ? 'bg-green-50/70 border-green-200 text-green-900'
              : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider block opacity-75">
              Current Account Balance
            </span>
            <p className="text-2xl sm:text-3xl font-black font-sans mt-1">
              {khataBalance > 0 ? (
                <span className="text-red-700 inline-flex items-center gap-1.5">
                  <FiAlertCircle className="text-red-600 text-xl" /> Customer Owes: Rs {khataBalance.toLocaleString()} (Udhar)
                </span>
              ) : khataBalance < 0 ? (
                <span className="text-green-700 inline-flex items-center gap-1.5">
                  <FiCheckCircle className="text-green-600 text-xl" /> Customer Credit: Rs {Math.abs(khataBalance).toLocaleString()} (Advance Jama)
                </span>
              ) : (
                <span className="text-gray-700 inline-flex items-center gap-1.5">
                  <FiCheck className="text-gray-500 text-xl" /> Clear Balance (Rs 0)
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex-1 sm:flex-none justify-center bg-[#0F172A] hover:bg-gray-800 text-[#DFAC43] text-xs font-black px-4 py-2.5 rounded transition flex items-center gap-1.5 shadow whitespace-nowrap cursor-pointer"
              title="Print Ledger Statement or Save as PDF"
            >
              <FiPrinter className="text-base" /> Print Statement
            </button>
            <button
              onClick={handleShareWhatsAppStatement}
              className="flex-1 sm:flex-none justify-center bg-green-600 hover:bg-green-700 text-white text-xs font-black px-4 py-2.5 rounded transition flex items-center gap-1.5 shadow whitespace-nowrap cursor-pointer"
            >
              <FaWhatsapp className="text-base" /> Send WhatsApp
            </button>
            <button
              onClick={openSettleModal}
              className="flex-1 sm:flex-none justify-center bg-amber-50 hover:bg-[#DFAC43] text-[#0F172A] hover:text-black border border-amber-300 text-xs font-black px-4 py-2.5 rounded transition flex items-center gap-1.5 shadow whitespace-nowrap cursor-pointer"
            >
              Settle / Post Entry
            </button>
          </div>
        </div>

        {/* Transaction Statement Table */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-800">
              Account Transaction History ({ledger.length} entries)
            </h3>
            {ledger.length > 0 && (
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="text-xs text-gray-600 hover:text-black font-bold flex items-center gap-1 cursor-pointer"
              >
                <FiPrinter /> Print PDF
              </button>
            )}
          </div>

          {ledger.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
              No khata transactions or settlements recorded yet for this customer.
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* 1. DESKTOP VIEW (TABLE) */}
              <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Description & Reference</th>
                      <th className="p-3.5 text-right">Debit (+)</th>
                      <th className="p-3.5 text-right">Credit (-)</th>
                      <th className="p-3.5 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ledger.map((entry) => (
                      <tr key={entry._id} className="hover:bg-gray-50/80 transition font-medium">
                        <td className="p-3.5 text-gray-500 whitespace-nowrap">
                          {new Date(entry.date || entry.createdAt).toLocaleDateString()} {new Date(entry.date || entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3.5 font-semibold text-gray-800">
                          {entry.description}
                          {entry.orderNumber && (
                            <span className="ml-2 bg-[#0F172A] text-[#DFAC43] px-2 py-0.5 rounded text-[10px] font-black whitespace-nowrap">
                              #BT-{entry.orderNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-black text-red-600 font-sans whitespace-nowrap">
                          {entry.type === 'debit' ? `+ Rs ${entry.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3.5 text-right font-black text-green-600 font-sans whitespace-nowrap">
                          {entry.type === 'credit' || entry.type === 'payment' ? `- Rs ${entry.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3.5 text-right font-black font-sans whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded text-xs ${
                            entry.runningBalance > 0 ? 'text-red-700 bg-red-50' :
                            entry.runningBalance < 0 ? 'text-green-700 bg-green-50' :
                            'text-gray-700 bg-gray-100'
                          }`}>
                            Rs {entry.runningBalance.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 2. MOBILE VIEW (TABLE-TO-CARD PATTERN) */}
              <div className="block md:hidden space-y-2.5">
                {ledger.map((entry) => (
                  <div 
                    key={entry._id} 
                    className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3.5 space-y-2.5 transition hover:border-gray-300"
                  >
                    {/* Date & Ref */}
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <span className="text-[11px] text-gray-500 font-medium">
                        {new Date(entry.date || entry.createdAt).toLocaleDateString()} at {new Date(entry.date || entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {entry.orderNumber && (
                        <span className="bg-[#0F172A] text-[#DFAC43] px-2 py-0.5 rounded text-[10px] font-black whitespace-nowrap">
                          #BT-{entry.orderNumber}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="font-bold text-gray-900 text-xs">{entry.description}</p>

                    {/* Amounts & Balance Row */}
                    <div className="flex items-center justify-between gap-2 bg-gray-50/80 p-2 rounded-lg border border-gray-150 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Amount</span>
                        {entry.type === 'debit' ? (
                          <span className="font-black text-red-600 text-xs font-sans">+ Rs {entry.amount.toLocaleString()}</span>
                        ) : (
                          <span className="font-black text-green-600 text-xs font-sans">- Rs {entry.amount.toLocaleString()}</span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Balance After</span>
                        <span className={`font-black text-xs font-sans px-2 py-0.5 rounded ${
                          entry.runningBalance > 0 ? 'text-red-700 bg-red-50' :
                          entry.runningBalance < 0 ? 'text-green-700 bg-green-50' :
                          'text-gray-700 bg-gray-200'
                        }`}>
                          Rs {entry.runningBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

      </div>

      {/* PRINT KHATA STATEMENT MODAL */}
      {isPrintModalOpen && (
        <CustomerKhataPrintModal
          customer={customer}
          ledger={ledger}
          khataBalance={khataBalance}
          closeModal={() => setIsPrintModalOpen(false)}
        />
      )}
    </>
  );
};

export default CustomerKhataLedgerTab;
