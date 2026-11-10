import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useGetShopSettings } from '../hooks/useShopSettings';
import CustomerKhataPrintModal from './CustomerKhataPrintModal';
import { FiAlertCircle, FiCheckCircle, FiCheck, FiPrinter, FiEdit2, FiRotateCcw, FiArrowDownRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const CustomerKhataLedgerTab = ({
  customer,
  ledger = [],
  khataBalance = 0,
  duesBalance = 0,
  creditBalance = 0,
  legacyBalance = 0,
  openOrders = [],
  openSettleModal,
  openRefundModal,
  openLegacyModal
}) => {
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
              Net Khata Balance (Dues - Credit)
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
            <div className="flex gap-4 text-xs font-bold text-gray-600 mt-2">
              <span>Total Dues: <strong className="text-red-600">Rs {duesBalance.toLocaleString()}</strong></span>
              <span>Available Credit: <strong className="text-emerald-700">Rs {creditBalance.toLocaleString()}</strong></span>
            </div>
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
              <FaWhatsapp className="text-base" /> WhatsApp
            </button>
            {creditBalance > 0 && openRefundModal && (
              <button
                onClick={openRefundModal}
                className="flex-1 sm:flex-none justify-center bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-xs font-black px-3 py-2.5 rounded transition flex items-center gap-1.5 shadow whitespace-nowrap cursor-pointer"
              >
                <FiRotateCcw /> Refund Credit
              </button>
            )}
            <button
              onClick={() => openSettleModal()}
              className="flex-1 sm:flex-none justify-center bg-amber-50 hover:bg-[#DFAC43] text-[#0F172A] hover:text-black border border-amber-300 text-xs font-black px-4 py-2.5 rounded transition flex items-center gap-1.5 shadow whitespace-nowrap cursor-pointer"
            >
              Receive Payment
            </button>
          </div>
        </div>

        {/* Legacy Balance Card */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded flex justify-between items-center text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Opening Balance (Legacy / Pre-system)</span>
            <span className="font-black text-gray-900 text-sm">Rs {legacyBalance.toLocaleString()}</span>
          </div>
          {openLegacyModal && (
            <button
              onClick={openLegacyModal}
              className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded flex items-center gap-1 transition"
            >
              <FiEdit2 className="text-[10px]" /> Adjust Legacy
            </button>
          )}
        </div>

        {/* Open Orders with Pending Dues */}
        {openOrders.length > 0 && (
          <div className="border border-amber-200 bg-amber-50/40 rounded p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <FiAlertCircle /> Open Orders with Dues ({openOrders.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-white border border-amber-200 rounded">
                <thead>
                  <tr className="bg-amber-100/60 text-amber-950 font-black text-[10px] uppercase border-b border-amber-200">
                    <th className="p-2.5">Order No</th>
                    <th className="p-2.5">Booking Date</th>
                    <th className="p-2.5 text-right">Net Bill</th>
                    <th className="p-2.5 text-right">Paid</th>
                    <th className="p-2.5 text-right">Due</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {openOrders.map(o => (
                    <tr key={o._id} className="hover:bg-amber-50/50">
                      <td className="p-2.5 font-black font-sans">#BT-{o.orderNumber}</td>
                      <td className="p-2.5 text-gray-600">{new Date(o.bookingDate).toLocaleDateString()}</td>
                      <td className="p-2.5 text-right font-bold">Rs {(o.netAmount || o.totalAmount)?.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">Rs {(o.paidAmount || o.advancePaid || 0)?.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-black text-red-600">Rs {o.due?.toLocaleString()}</td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => openSettleModal(o._id)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-[#DFAC43] text-[#0F172A] hover:text-black rounded text-[11px] font-black transition cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <FiArrowDownRight /> Pay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
                      <tr key={entry._id || entry.id} className="hover:bg-gray-50/80 transition font-medium">
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
                          {entry.receiptNumber && (
                            <span className="ml-2 bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap">
                              {entry.receiptNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-black text-red-600 font-sans whitespace-nowrap">
                          {entry.debit ? `+ Rs ${entry.debit.toLocaleString()}` : entry.type === 'debit' ? `+ Rs ${entry.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3.5 text-right font-black text-green-600 font-sans whitespace-nowrap">
                          {entry.credit ? `- Rs ${entry.credit.toLocaleString()}` : (entry.type === 'credit' || entry.type === 'payment') ? `- Rs ${entry.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3.5 text-right font-black font-sans whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded text-xs ${
                            entry.runningBalance > 0 ? 'text-red-700 bg-red-50' :
                            entry.runningBalance < 0 ? 'text-green-700 bg-green-50' :
                            'text-gray-700 bg-gray-100'
                          }`}>
                            Rs {entry.runningBalance?.toLocaleString()}
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
                    key={entry._id || entry.id} 
                    className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3.5 space-y-2.5 transition hover:border-gray-300"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <span className="text-[11px] text-gray-500 font-medium">
                        {new Date(entry.date || entry.createdAt).toLocaleDateString()}
                      </span>
                      {entry.orderNumber && (
                        <span className="bg-[#0F172A] text-[#DFAC43] px-2 py-0.5 rounded text-[10px] font-black">
                          #BT-{entry.orderNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-semibold text-gray-900 leading-snug">
                        {entry.description}
                      </p>
                      <span className={`font-black text-xs font-sans whitespace-nowrap ${
                        (entry.debit > 0 || entry.type === 'debit') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {(entry.debit > 0 || entry.type === 'debit') ? `+ Rs ${(entry.debit || entry.amount).toLocaleString()}` : `- Rs ${(entry.credit || entry.amount).toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-gray-100">
                      <span className="text-gray-500 font-medium">Running Balance:</span>
                      <span className={`font-bold font-sans ${entry.runningBalance > 0 ? 'text-red-700' : entry.runningBalance < 0 ? 'text-green-700' : 'text-gray-700'}`}>
                        Rs {entry.runningBalance?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

      </div>

      {/* PRINT STATEMENT MODAL */}
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
