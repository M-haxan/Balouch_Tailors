import React, { useState } from 'react';
import { FiArrowLeft, FiSliders, FiPrinter } from 'react-icons/fi';
import { useGetShopSettings } from '../hooks/useShopSettings';
import defaultLogo from '../assets/BT_Logo.png';
import { formatPhone } from '../utils/formatters';

// -------------------------------------------------------------
// COMPONENT: VENDOR KHATA STATEMENT PRINT MODAL (56mm, 80mm, A4)
const VendorStatementPrintModal = ({ supplier, processedEntries, balance, periodLabel, periodPurchases, periodPaid, closeModal }) => {
  const [paperSize, setPaperSize] = useState('80mm');
  const { data: shopSettings } = useGetShopSettings();

  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';
  const tagline = shopSettings?.tagline || 'Gents Shalwar Qameez Specialist';
  const proprietor = shopSettings?.proprietor || 'Zubair Balouch';
  const primaryPhone = shopSettings?.primaryPhone || '0313-4389192';
  const secondaryPhone = shopSettings?.secondaryPhone || '0306-7379919';
  const address = shopSettings?.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan';

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
                src={currentLogo} 
                alt={shopName} 
                className={paperSize === '56mm' ? 'h-9 w-auto object-contain' : paperSize === '80mm' ? 'h-11 w-auto object-contain' : 'h-14 w-auto object-contain'} 
              />
            </div>
            <h1 className={`font-black uppercase tracking-wider text-black leading-tight ${
              paperSize === '56mm' ? 'text-xs' : paperSize === '80mm' ? 'text-base sm:text-lg' : 'text-2xl'
            }`}>
              {shopName}
            </h1>
            <p className={`font-bold tracking-widest text-gray-500 uppercase -mt-0.5 ${
              paperSize === '56mm' ? 'text-[7px]' : paperSize === '80mm' ? 'text-[8px]' : 'text-xs'
            }`}>
              {tagline}
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
              <p className="font-bold text-gray-700 text-[10px] sm:text-xs">Contact: {supplier.name} ({formatPhone(supplier.phone)})</p>
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
              Proprietor: <span className="text-black font-black">{proprietor}</span> | 
              📞 {primaryPhone}{secondaryPhone ? ` | ${secondaryPhone}` : ''}
            </div>
            <p className="text-[7px] text-gray-400">
              Computer Generated Vendor Statement | {shopName}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default VendorStatementPrintModal;
