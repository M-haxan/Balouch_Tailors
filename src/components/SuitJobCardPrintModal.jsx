import React, { useState } from 'react';
import defaultLogo from '../assets/BT_Logo.png';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { useGetWorkers } from '../hooks/useWorkers';
import { FiPrinter, FiSliders, FiArrowLeft } from 'react-icons/fi';

// -------------------------------------------------------------
// COMPONENT: SUIT CUTTING & STITCHING JOB PARCHI PRINT MODAL
// -------------------------------------------------------------
const SuitJobCardPrintModal = ({ order, suit, suitIndex = 0, closeModal }) => {
  const [paperSize, setPaperSize] = useState('80mm'); // '56mm' | '80mm' | 'a4'
  const { data: shopSettings } = useGetShopSettings();
  const { data: workers = [] } = useGetWorkers();

  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';
  const tagline = shopSettings?.tagline || 'Gents Shalwar Qameez Specialist';
  const proprietor = shopSettings?.proprietor || 'Zubair Balouch';
  const primaryPhone = shopSettings?.primaryPhone || '0313-4389192';
  const secondaryPhone = shopSettings?.secondaryPhone || '0306-7379919';
  const address = shopSettings?.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan';

  const suitIdBadge = suit?.suitNumber || `BT-${order?.orderNumber}-${suitIndex + 1}`;
  const wearer = suit?.wearer || {};
  const measurements = (suit?.measurements && suit?.measurements.length > 0)
    ? suit?.measurements
    : (wearer.measurements || order?.customer?.measurements || []);
  const prefs = suit?.stitchingPreferences || wearer.stitchingPreferences || order?.customer?.stitchingPreferences || {};

  // Extract direct selected preferences from all sources
  const prefValuesFromObj = [
    prefs.collar,
    prefs.sleeves,
    prefs.daman,
    prefs.frontPocket,
    prefs.sidePockets,
    prefs.shalwarPocket,
    prefs.patti,
    prefs.stitchingStyle,
    prefs.otherPreferences
  ].filter(Boolean);

  const rawTags = [
    ...(Array.isArray(prefs.tags) ? prefs.tags : []),
    ...(Array.isArray(suit?.staticTags) ? suit.staticTags : [])
  ];

  const prefValues = Array.from(new Set([...prefValuesFromObj, ...rawTags])).filter(Boolean);

  // Current assigned worker name
  const currentAssignedId = suit?.stitching?.isSelf 
    ? 'self' 
    : (suit?.assignedWorker?._id || suit?.assignedWorker || '');
  const activeWorkerObj = workers.find(w => w._id === currentAssignedId) || (typeof suit?.assignedWorker === 'object' ? suit?.assignedWorker : null);
  const workerDisplay = suit?.stitching?.isSelf 
    ? 'Owner / Self Stitched' 
    : activeWorkerObj ? `${activeWorkerObj.name} (Rs ${activeWorkerObj.perSuitWage})` : 'Unassigned / Pending';

  const handlePrint = () => {
    try {
      const originalTitle = document.title;
      document.title = `JobParchi_${suitIdBadge}`;
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
    paperSize === '56mm' ? 'w-[56mm] max-w-[56mm] text-[10px] p-2.5' :
    paperSize === '80mm' ? 'w-[80mm] max-w-[80mm] text-xs p-4' :
    'w-full max-w-xl text-xs p-6';

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 font-sans overflow-y-auto">
      
      {/* Print Specific CSS */}
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
          #suit-job-printable-slip, #suit-job-printable-slip * {
            visibility: visible !important;
          }
          #suit-job-printable-slip {
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

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col relative overflow-hidden border border-gray-200">
        
        {/* Top Control Bar (Screen Only) */}
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-2 no-print shrink-0">
          
          <button
            type="button"
            onClick={closeModal}
            className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            <FiArrowLeft /> Back to Details
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
            id="suit-job-printable-slip"
            className={`bg-white shadow-md text-black leading-tight ${containerWidthClass}`}
          >
            {/* SHOP HEADER */}
            <div className="text-center pb-2 border-b-2 border-black space-y-1">
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
                  SUIT CUTTING & STITCHING JOB PARCHI
                </span>
              </div>
            </div>

            {/* ORDER & SUIT METADATA */}
            <div className="py-2 border-b border-dashed space-y-1 text-[11px]">
              <div className="flex justify-between items-center font-black">
                <span className="text-base sm:text-lg font-mono underline decoration-2">{suitIdBadge}</span>
                <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] uppercase font-sans">
                  {suit?.serviceType || 'Shalwar Qameez'}
                </span>
              </div>

              <div className="flex justify-between text-gray-700 font-bold text-[10px] pt-1">
                <span>Customer: <strong className="text-black">{order?.customer?.name || 'Walk-in'}</strong></span>
                <span>Contact: {order?.customer?.phone || 'N/A'}</span>
              </div>

              <div className="flex justify-between text-gray-600 text-[9px] border-t border-gray-200 pt-1">
                <span>Order Date: {new Date(order?.bookingDate || Date.now()).toLocaleDateString()}</span>
                <span className="font-black text-red-600">Due: {new Date(order?.deliveryDate || Date.now()).toLocaleDateString()}</span>
              </div>

              {/* Fabric details */}
              <div className="bg-gray-100 p-1.5 rounded flex justify-between items-center text-[10px] font-black mt-1">
                <span>Fabric: {suit?.fabricDetails || 'Cloth provided by customer'}</span>
                {suit?.volumeNo && <span className="text-gray-600">VOL: {suit.volumeNo}</span>}
              </div>

              {/* Worker Assignment Info */}
              <div className="flex justify-between text-[10px] font-black pt-1">
                <span className="text-gray-500 uppercase">Assigned Stitcher:</span>
                <span className="text-black underline">{workerDisplay}</span>
              </div>
            </div>

            {/* SPECIFICATIONS & STYLE TAGS */}
            {prefValues.length > 0 && (
              <div className="py-2 border-b border-dashed border-gray-400 space-y-1.5 text-[10px]">
                <div className="font-black uppercase border-b border-gray-200 pb-0.5 flex items-center gap-1">
                  <span>Style & Design Specifications</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {prefValues.map((val, pIdx) => (
                    <div key={pIdx} className="font-bold text-gray-900 flex items-center gap-1">
                      <span className="text-black font-black">✓</span>
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADD-ONS ON DEDICATED SEPARATE LINE */}
            {suit?.customizations && suit?.customizations.length > 0 && (
              <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[10px]">
                <div className="flex items-center flex-wrap gap-1">
                  <span className="text-gray-700 font-black text-[9px] uppercase">Add-on Customizations:</span>
                  {suit.customizations.map((c, cIdx) => (
                    <span key={cIdx} className="bg-gray-100 border border-gray-300 px-1.5 py-0.2 rounded text-[9px] font-black">
                      + {c.name} {c.urduName ? `(${c.urduName})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SPECIAL TAILOR INSTRUCTIONS (خصوصی ہدایات) */}
            {suit?.customDesign && (
              <div className="py-2 border-b border-dashed border-gray-400 space-y-1 bg-gray-50/60 p-1.5 rounded">
                <span className="font-black text-[10px] uppercase text-black block">
                  Special Tailor Instructions:
                </span>
                <p className="font-black text-xs text-gray-900 font-sans leading-relaxed text-right" dir="rtl">
                  {suit?.customDesign}
                </p>
              </div>
            )}

            {/* FULL BODY MEASUREMENTS */}
            <div className="py-2 border-b-2 border-black space-y-1.5">
              <div className="font-black text-[10px] uppercase border-b border-black pb-0.5 flex justify-between">
                <span>Body Measurements</span>
                <span>Qty: 1 Suit</span>
              </div>

              {(!measurements || measurements.length === 0) ? (
                <p className="text-[10px] text-gray-400 italic py-1 text-center">No measurements recorded.</p>
              ) : (
                measurements.map((meas, mIdx) => {
                  const dataObj = meas.data instanceof Map ? Object.fromEntries(meas.data) : (meas.data || {});
                  const entries = Object.entries(dataObj);
                  return (
                    <div key={mIdx} className="space-y-1">
                      {meas.category && (
                        <span className="font-black text-[9px] bg-black text-white px-1.5 py-0.2 rounded uppercase inline-block">
                          {meas.category}
                        </span>
                      )}
                      <table className="w-full text-left border-collapse border border-gray-400 text-[10px]">
                        <tbody>
                          {Array.from({ length: Math.ceil(entries.length / 2) }).map((_, rIdx) => {
                            const item1 = entries[rIdx * 2];
                            const item2 = entries[rIdx * 2 + 1];
                            return (
                              <tr key={rIdx} className="border-b border-gray-300">
                                <td className="p-1 font-bold text-gray-600 border-r border-gray-300 w-1/4 uppercase bg-gray-50/50">
                                  {item1 ? item1[0] : ''}
                                </td>
                                <td className="p-1 font-black text-black border-r border-gray-400 w-1/4 font-sans text-xs">
                                  {item1 ? item1[1] : ''}
                                </td>
                                <td className="p-1 font-bold text-gray-600 border-r border-gray-300 w-1/4 uppercase bg-gray-50/50">
                                  {item2 ? item2[0] : ''}
                                </td>
                                <td className="p-1 font-black text-black w-1/4 font-sans text-xs">
                                  {item2 ? item2[1] : ''}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })
              )}
            </div>

            {/* CUTTING & STAMP FOOTER */}
            <div className="text-center py-2 space-y-1.5">
            </div>

          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 no-print">
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
            <FiPrinter /> Print Suit Parchi
          </button>
        </div>

      </div>

    </div>
  );
};

export default SuitJobCardPrintModal;
