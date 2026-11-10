import React, { useState } from 'react';
import defaultLogo from '../assets/BT_Logo.png';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { formatPhone } from '../utils/formatters';
import { FiPrinter, FiSliders, FiArrowLeft } from 'react-icons/fi';

// ====================================================================
// COMPONENT: CUSTOMER KHATA PRINT MODAL (56mm, 80mm, A4 STATEMENT)
// ====================================================================
const CustomerKhataPrintModal = ({ customer, ledger = [], khataBalance = 0, closeModal }) => {
  const [paperSize, setPaperSize] = useState('80mm'); // '56mm' | '80mm' | 'a4'
  const { data: shopSettings } = useGetShopSettings();

  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';
  const tagline = shopSettings?.tagline || 'Gents Shalwar Qameez Specialist';
  const proprietor = shopSettings?.proprietor || 'Zubair Balouch';
  const primaryPhone = shopSettings?.primaryPhone || '0313-4389192';
  const secondaryPhone = shopSettings?.secondaryPhone || '0306-7379919';
  const address = shopSettings?.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan';

  const formattedCustomerId = customer.customerNumber ? `#C-${customer.customerNumber}` : `#C-${customer._id.slice(-4).toUpperCase()}`;

  // Totals calculations
  let totalDebit = 0;
  let totalCredit = 0;
  ledger.forEach(entry => {
    if (entry.debit) totalDebit += Number(entry.debit) || 0;
    else if (entry.type === 'debit') totalDebit += Number(entry.amount) || 0;

    if (entry.credit) totalCredit += Number(entry.credit) || 0;
    else if (entry.type === 'credit' || entry.type === 'payment') totalCredit += Number(entry.amount) || 0;
  });

  const handlePrint = () => {
    try {
      const originalTitle = document.title;
      document.title = `Khata_Statement_${customer.name.replace(/\s+/g, '_')}_${formattedCustomerId}`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    } catch (err) {
      console.error('Print error:', err);
      window.print();
    }
  };

  const containerWidthClass = 
    paperSize === '56mm' ? 'w-[56mm] max-w-[56mm] text-[10px] p-2' :
    paperSize === '80mm' ? 'w-[80mm] max-w-[80mm] text-xs p-3.5' :
    'w-full max-w-3xl text-sm px-8 py-10';

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 font-sans overflow-y-auto">
      
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
          #customer-khata-slip, #customer-khata-slip * {
            visibility: visible !important;
          }
          #customer-khata-slip {
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

      <div className="bg-white rounded shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col relative overflow-hidden border border-gray-200">
        
        {/* Top Control Bar (Screen Only) */}
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-2 no-print shrink-0">
          
          <button
            type="button"
            onClick={closeModal}
            className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            <FiArrowLeft /> Back to Profile
          </button>

          {/* Paper Size Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded border border-gray-200 text-xs">
            <span className="text-gray-400 px-1 hidden sm:inline-flex items-center gap-1">
              <FiSliders /> Size:
            </span>
            <button
              type="button"
              onClick={() => setPaperSize('56mm')}
              className={`px-2.5 py-1 rounded transition cursor-pointer font-bold ${
                paperSize === '56mm' ? 'bg-[#0F172A] text-[#DFAC43]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              56mm
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('80mm')}
              className={`px-2.5 py-1 rounded transition cursor-pointer font-bold ${
                paperSize === '80mm' ? 'bg-[#0F172A] text-[#DFAC43]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              80mm POS
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('a4')}
              className={`px-2.5 py-1 rounded transition cursor-pointer font-bold ${
                paperSize === 'a4' ? 'bg-[#0F172A] text-[#DFAC43]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              A4 Sheet
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] rounded font-black text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
          >
            <FiPrinter /> Print Slip
          </button>
        </div>

        {/* --- PRINTABLE SLIP BODY --- */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-gray-100 flex justify-center flex-1">
          
          <div 
            id="customer-khata-slip"
            className={`bg-white shadow-md text-black leading-tight ${containerWidthClass}`}
          >
            {/* SHOP HEADER */}
            <div className="text-center pb-2 border-b-2 border-dashed border-gray-300 space-y-1">
              {/* Logo */}
              <div className="flex justify-center mb-0.5">
                <img 
                  src={currentLogo} 
                  alt={shopName} 
                  className={paperSize === '56mm' ? 'h-9 w-auto object-contain' : paperSize === '80mm' ? 'h-11 w-auto object-contain' : 'h-14 w-auto object-contain'} 
                />
              </div>

              {/* Shop Name */}
              <h1 className={`font-black uppercase tracking-wider text-black leading-tight ${
                paperSize === '56mm' ? 'text-xs' : paperSize === '80mm' ? 'text-base sm:text-lg' : 'text-2xl sm:text-3xl'
              }`}>
                {shopName}
              </h1>
              
              <p className={`font-bold tracking-widest text-gray-500 uppercase -mt-0.5 ${
                paperSize === '56mm' ? 'text-[7px]' : paperSize === '80mm' ? 'text-[8px]' : 'text-xs'
              }`}>
                {tagline}
              </p>
              
              <div className="pt-1 pb-0.5">
                <span className="inline-block bg-[#0F172A] text-white text-[9px] sm:text-[10px] font-black px-3 py-0.5 uppercase tracking-widest rounded-xs">
                  CUSTOMER KHATA STATEMENT
                </span>
              </div>
            </div>

            {/* CUSTOMER & STATEMENT DETAILS */}
            <div className="py-2.5 border-b border-gray-200 text-left space-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[8px] sm:text-[9px] block">Customer Details:</span>
                  <p className="font-black text-gray-900 text-xs sm:text-sm">{customer.name}</p>
                  <p className="font-bold text-gray-700 text-[10px] sm:text-xs">
                    Phone: {formatPhone(customer.phone)}{customer.whatsapp ? ` | WA: ${formatPhone(customer.whatsapp)}` : ''}
                  </p>
                  {customer.city && <p className="text-[9px] text-gray-500">{customer.city}{customer.address ? ` - ${customer.address}` : ''}</p>}
                </div>
                <div className="text-right">
                  <span className="inline-block bg-gray-100 border border-gray-300 text-black font-mono font-black px-2 py-0.5 rounded text-[10px]">
                    {formattedCustomerId}
                  </span>
                  <p className="text-[9px] text-gray-500 font-medium mt-1">
                    Date: {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-[8px] text-gray-400">
                    Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* ITEMIZED TRANSACTION TABLE */}
            <table className="w-full text-left border-collapse my-2">
              <thead>
                <tr className={`border-b-2 border-black font-black uppercase text-gray-700 ${
                  paperSize === '56mm' ? 'text-[7px]' : paperSize === '80mm' ? 'text-[9px]' : 'text-xs'
                }`}>
                  <th className="py-1 pr-1 whitespace-nowrap">Date</th>
                  <th className="py-1 px-1">Details</th>
                  <th className="py-1 px-1 text-right whitespace-nowrap">Bill (+)</th>
                  <th className="py-1 px-1 text-right whitespace-nowrap">Paid (-)</th>
                  <th className="py-1 pl-1 text-right whitespace-nowrap">Balance</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-100 ${
                paperSize === '56mm' ? 'text-[7px]' : paperSize === '80mm' ? 'text-[9px]' : 'text-xs'
              }`}>
                {ledger.map((entry, idx) => (
                  <tr key={entry._id || idx}>
                    <td className="py-1 pr-1 font-mono text-gray-600 whitespace-nowrap align-top">
                      {new Date(entry.date || entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-1 px-1 font-bold text-gray-900 align-top">
                      <span className="block leading-tight">{entry.description}</span>
                      {entry.orderNumber && (
                        <span className="text-[7px] text-gray-500 font-mono block">Order #BT-{entry.orderNumber}</span>
                      )}
                    </td>
                    <td className="py-1 px-1 text-right font-black text-red-600 font-sans whitespace-nowrap align-top">
                      {entry.debit ? `Rs ${entry.debit.toLocaleString()}` : entry.type === 'debit' ? `Rs ${entry.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-1 px-1 text-right font-black text-green-700 font-sans whitespace-nowrap align-top">
                      {entry.credit ? `Rs ${entry.credit.toLocaleString()}` : (entry.type === 'credit' || entry.type === 'payment') ? `Rs ${entry.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-1 pl-1 text-right font-black font-sans text-gray-900 whitespace-nowrap align-top">
                      Rs {entry.runningBalance?.toLocaleString() || '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* FINANCIAL SUMMARY TOTALS */}
            <div className="border-t-2 border-black pt-2 mb-2 space-y-1 text-[9px] sm:text-xs">
              <div className="flex justify-between text-gray-600 font-bold">
                <span>Total Orders & Debits:</span>
                <span className="font-sans text-red-600">Rs {totalDebit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-bold">
                <span>Total Payments Received:</span>
                <span className="font-sans text-green-700">Rs {totalCredit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-black border-t-2 border-black pt-1.5 text-black">
                <span>Current Account Status:</span>
                <span className={`font-sans px-2 py-0.5 rounded ${
                  khataBalance > 0 ? 'bg-red-600 text-white' :
                  khataBalance < 0 ? 'bg-green-600 text-white' :
                  'bg-gray-800 text-white'
                }`}>
                  {khataBalance > 0 ? `Payable: Rs ${khataBalance.toLocaleString()}` :
                   khataBalance < 0 ? `Advance: Rs ${Math.abs(khataBalance).toLocaleString()}` :
                   'Khata Clear (Rs 0)'}
                </span>
              </div>
            </div>

            {/* FOOTER & SHOP INFORMATION */}
            <div className="text-center pt-2 border-t border-dashed border-gray-300 space-y-1 text-[7px] sm:text-[9px] text-gray-500">
              <p className="font-black text-gray-800">
                Thank you for choosing {shopName}!
              </p>
              <div className="bg-gray-100 rounded py-0.5 px-2 text-gray-700 font-bold inline-block border border-gray-200">
                Proprietor: <span className="text-black font-black">{proprietor}</span> | 
                📞 {primaryPhone}{secondaryPhone ? ` | ${secondaryPhone}` : ''}
              </div>
              <p className="text-[7px] text-gray-400">
                {address}
              </p>
            </div>

          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 no-print shrink-0">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] rounded font-black text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
          >
            <FiPrinter /> Print / PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerKhataPrintModal;
