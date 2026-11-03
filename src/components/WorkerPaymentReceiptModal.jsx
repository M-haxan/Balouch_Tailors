import React from 'react';
import defaultLogo from '../assets/BT_Logo.png';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { FiX, FiCheckCircle, FiPhone } from 'react-icons/fi';

// -------------------------------------------------------------
// COMPONENT: PAYMENT DETAILS MODAL (VIEW ONLY - WORKER PORTAL)
// -------------------------------------------------------------
const WorkerPaymentReceiptModal = ({ payment, worker = {}, closeModal }) => {
  const { data: shopSettings } = useGetShopSettings();

  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';
  const tagline = shopSettings?.tagline || 'Gents Shalwar Qameez Specialist';
  const proprietor = shopSettings?.proprietor || 'Zubair Balouch';
  const primaryPhone = shopSettings?.primaryPhone || '0313-4389192';
  const secondaryPhone = shopSettings?.secondaryPhone || '0306-7379919';
  const address = shopSettings?.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan';

  const receiptNum = `#SR-${payment._id.substring(payment._id.length - 6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 font-sans overflow-y-auto">
      <div className="bg-white rounded shadow-2xl max-w-xl w-full border overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* HEADER */}
        <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex justify-between items-center shrink-0 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-6 bg-[#DFAC43] rounded"></span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Salary Payment & Settlement Details</h3>
                <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2.5 py-0.5 rounded shadow-xs">
                  {receiptNum}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Paid Salary Record & Wage Statement</p>
            </div>
          </div>
          <button 
            onClick={closeModal} 
            className="text-gray-400 hover:text-white p-1 text-2xl leading-none transition cursor-pointer"
          >
            <FiX />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-100/70 space-y-4">
          <div className="bg-white border-2 rounded p-4 sm:p-5 bg-linear-to-b from-white to-gray-50/50 shadow-xs space-y-4">
            
            {/* BRAND HEADER BANNER */}
            <div className="text-center space-y-1 pb-3 border-b-2 border-black">
              {currentLogo && (
                <div className="flex justify-center mb-1">
                  <img 
                    src={currentLogo} 
                    alt={shopName} 
                    className="h-10 max-w-[120px] object-contain" 
                  />
                </div>
              )}
              
              <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-black leading-tight">
                {shopName}
              </h2>
              
              <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase -mt-0.5">
                {tagline}
              </p>
              
              <div className="pt-1">
                <span className="inline-block bg-[#0F172A] text-white text-[10px] font-black px-3.5 py-0.5 uppercase tracking-widest rounded-xs">
                  KARIGAR SALARY PAYMENT RECEIPT
                </span>
              </div>
            </div>

            {/* RECEIPT & SETTLEMENT METADATA GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-gray-50 p-3 rounded border border-gray-200 text-xs font-semibold">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Receipt No:</span>
                  <span className="font-black text-black font-mono">{receiptNum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Date:</span>
                  <span className="font-black text-gray-900 font-sans">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Karigar Name:</span>
                  <span className="font-black text-blue-700">{worker.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Settlement Period:</span>
                  <span className="font-bold text-gray-800 font-sans">
                    {new Date(payment.startDate).toLocaleDateString()} - {new Date(payment.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* WAGES & DEDUCTIONS SUMMARY TABLE */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider block">
                Wages & Deductions Summary
              </span>
              
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] border-b border-gray-200">
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 text-right">Amount (Rs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    <tr className="hover:bg-gray-50">
                      <td className="p-2.5 text-gray-800 font-medium">Total Stitching Wages Earned (Wages Credit)</td>
                      <td className="p-2.5 text-right font-black text-green-700 font-sans">+ Rs {Number(payment.totalEarned || 0).toLocaleString()}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-2.5 text-gray-800 font-medium">Advance Deductions (Deductions Debit)</td>
                      <td className="p-2.5 text-right font-black text-red-600 font-sans">- Rs {Number(payment.totalAdvance || 0).toLocaleString()}</td>
                    </tr>
                    <tr className="bg-gray-50 border-t-2 border-black font-black">
                      <td className="p-2.5 uppercase text-gray-900 font-black">Net Cash Paid Out</td>
                      <td className="p-2.5 text-right text-sm font-black font-sans text-black">Rs {Number(payment.netPaid || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* NOTES (IF ANY) */}
            {payment.notes && (
              <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded text-xs space-y-0.5">
                <span className="font-black uppercase text-amber-950 block text-[10px]">
                  Payment Notes:
                </span>
                <p className="font-medium text-gray-800 italic leading-relaxed">
                  {payment.notes}
                </p>
              </div>
            )}

            {/* AUTHENTIC OFFICIAL PAID & SETTLED STAMP */}
            <div className="flex justify-center my-2 py-1">
              <div className="border-2 border-dashed border-green-600 text-green-700 font-black text-xs uppercase px-5 py-2 rounded tracking-widest inline-flex items-center gap-2 bg-green-50 shadow-2xs rotate-[-1deg]">
                <FiCheckCircle className="text-base text-green-600" />
                <span>PAID & SETTLED</span>
              </div>
            </div>

            {/* SHOP & PROPRIETOR FOOTER */}
            <div className="pt-3 border-t-2 border-black text-center space-y-0.5 text-black">
              <p className="font-black text-[10px] uppercase tracking-wider">
                Proprietor: {proprietor}
              </p>
              <p className="font-black text-[10px] font-sans flex items-center justify-center gap-1.5">
                <FiPhone className="text-gray-600 text-[10px]" /> {primaryPhone}{secondaryPhone ? ` | ${secondaryPhone}` : ''}
              </p>
              <p className="text-[9px] text-gray-600 leading-tight">
                {address}
              </p>
            </div>

          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 border-t border-gray-200 bg-white flex justify-between items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-gray-500">
            Payment Status: <strong className="text-green-700 uppercase">Paid & Settled</strong>
          </span>
          <button
            type="button"
            onClick={closeModal}
            className="px-5 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] rounded font-black text-xs transition cursor-pointer shadow"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default WorkerPaymentReceiptModal;
