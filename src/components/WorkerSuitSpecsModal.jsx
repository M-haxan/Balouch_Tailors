import React, { useState, useMemo, useEffect } from 'react';
import defaultLogo from '../assets/BT_Logo.png';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { useGetOrderById } from '../hooks/useOrder';
import { formatPhone } from '../utils/formatters';
import {
  FiPrinter,
  FiX,
  FiUser,
  FiPhone,
  FiCalendar,
  FiCreditCard,
  FiScissors,
  FiImage,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiLayers
} from 'react-icons/fi';

// HELPER: MAP MEASUREMENT KEYS TO URDU LABELS FOR JOB PARCHI
// -------------------------------------------------------------
const MEASUREMENT_URDU_MAP = {
  length: 'لمبائی',
  lambai: 'لمبائی',
  kameezLength: 'قمیض لمبائی',
  kameez_length: 'قمیض لمبائی',
  sleeves: 'بازو',
  bazu: 'بازو',
  collar: 'گلہ / بین',
  neck: 'گلہ',
  gala: 'گلہ',
  chest: 'چھاتی',
  chati: 'چھاتی',
  ghera: 'گھیرا',
  daman: 'دامن / گھیرا',
  shoulder: 'تیرا',
  tera: 'تیرا',
  teera: 'تیرا',
  shalwar: 'شلوار',
  shalwarLength: 'شلوار لمبائی',
  trouser: 'شلوار',
  paincha: 'پانچہ',
  paicha: 'پانچہ',
  bottom: 'پانچہ',
  waist: 'کمر',
  kamar: 'کمر',
  hip: 'کولہے',
  thigh: 'تھائی / ران',
  frontPatti: 'سامنے پٹی',
  cuff: 'کف',
  armhole: 'موڈھا',
  modha: 'موڈھا'
};

const formatMeasurementsForParchi = (measurements) => {
  if (!measurements || measurements.length === 0) return [];
  
  const merged = {};
  measurements.forEach(m => {
    const dataObj = m.data instanceof Map ? Object.fromEntries(m.data) : (m.data || {});
    Object.entries(dataObj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        merged[k] = v;
      }
    });
  });

  const standardKeys = [
    { keys: ['length', 'lambai', 'kameezLength', 'kameez_length', 'لمبائی'], label: 'لمبائی' },
    { keys: ['sleeves', 'bazu', 'بازو'], label: 'بازو' },
    { keys: ['collar', 'neck', 'gala', 'گلہ', 'بین', 'گلہ / بین'], label: 'گلہ' },
    { keys: ['chest', 'chati', 'چھاتی'], label: 'چھاتی' },
    { keys: ['ghera', 'daman', 'گھیرا', 'دامن'], label: 'گھیرا' },
    { keys: ['shoulder', 'tera', 'teera', 'تیرا'], label: 'تیرا' },
    { keys: ['shalwar', 'shalwarLength', 'trouser', 'شلوار', 'شلوار لمبائی'], label: 'شلوار' },
    { keys: ['paincha', 'paicha', 'bottom', 'پانچہ'], label: 'پانچہ' },
  ];

  const rows = [];
  const handledKeys = new Set();

  standardKeys.forEach(std => {
    for (const k of std.keys) {
      if (merged[k] !== undefined) {
        rows.push({ label: std.label, val: merged[k] });
        handledKeys.add(k);
        break;
      }
    }
  });

  Object.entries(merged).forEach(([k, v]) => {
    if (!handledKeys.has(k)) {
      const urduLabel = MEASUREMENT_URDU_MAP[k] || k;
      rows.push({ label: urduLabel, val: v });
    }
  });

  return rows;
};

// -------------------------------------------------------------
// COMPONENT: SUIT CUTTING & STITCHING JOB PARCHI PRINT MODAL (WORKER)
// -------------------------------------------------------------
const SuitJobCardPrintModal = ({ order, suit, suitIndex = 0, worker, closeModal }) => {
  const [paperSize, setPaperSize] = useState('80mm'); // '56mm' | '80mm' | 'a4'
  const { data: shopSettings } = useGetShopSettings();

  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';
  const tagline = shopSettings?.tagline || 'Gents Shalwar Qameez Specialist';
  const proprietor = shopSettings?.proprietor || 'Zubair Balouch';
  const primaryPhone = shopSettings?.primaryPhone || '0313-4389192';
  const secondaryPhone = shopSettings?.secondaryPhone || '0306-7379919';
  const address = shopSettings?.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan';

  const suitIdBadge = suit?.suitNumber || (order?.orderNumber ? `BT-${order.orderNumber}-${suitIndex + 1}` : 'BT-SUIT');
  const wearer = suit?.wearer || {};
  const measurements = (suit?.measurements && suit?.measurements.length > 0)
    ? suit?.measurements
    : (wearer.measurements || order?.customer?.measurements || []);
  const prefs = suit?.stitchingPreferences || wearer.stitchingPreferences || order?.customer?.stitchingPreferences || {};

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

      <div className="bg-white rounded shadow-2xl max-w-2xl w-full border overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Top Controls Bar */}
        <div className="bg-[#0F172A] text-white p-4 flex flex-wrap justify-between items-center gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 bg-[#DFAC43] rounded"></span>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <FiPrinter className="text-[#DFAC43]" /> Print Suit Cutting & Job Parchi
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-800 p-1 rounded text-xs font-bold">
              {['56mm', '80mm', 'a4'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPaperSize(size)}
                  className={`px-2.5 py-1 rounded transition uppercase cursor-pointer ${
                    paperSize === size ? 'bg-[#DFAC43] text-[#0F172A] font-black' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="text-gray-400 hover:text-white p-1 text-lg transition cursor-pointer"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-100 flex justify-center items-start">
          <div 
            id="suit-job-printable-slip"
            className={`bg-white shadow-md text-black leading-tight ${containerWidthClass}`}
          >
            {/* Shop Header */}
            <div className="text-center pb-2 border-b-2 border-black space-y-1">
              <div className="flex justify-center mb-0.5">
                <img 
                  src={currentLogo} 
                  alt={shopName} 
                  className={paperSize === '56mm' ? 'h-9 w-auto object-contain' : paperSize === '80mm' ? 'h-11 w-auto object-contain' : 'h-14 w-auto object-contain'} 
                />
              </div>

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

            {/* Order & Suit Metadata */}
            <div className="py-2 border-b border-dashed space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>Suit ID:</span>
                <span className="font-black font-sans text-sm bg-gray-100 px-1 py-0.2 rounded border border-gray-300">
                  #{suitIdBadge}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-bold">#BT-{order?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Due:</span>
                <span className="font-black text-red-600 font-sans">
                  {order?.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-black">{order?.customer?.name || 'Walk-in'} ({formatPhone(order?.customer?.phone)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wearer:</span>
                <span className="font-black">{wearer.name || order?.customer?.name || 'Customer'} {wearer.relation ? `(${wearer.relation})` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fabric & Vol:</span>
                <span className="font-bold">{suit?.fabricDetails || 'Standard'} {suit?.volumeNo ? `[Vol: ${suit?.volumeNo}]` : ''}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-600">Karigar Wage:</span>
                <span className="font-black font-sans text-emerald-700">Rs {worker?.perSuitWage || suit?.price || 0}</span>
              </div>
            </div>

            {/* Style & Design Preferences */}
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

            {/* Add-ons */}
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

            {/* Special Instructions */}
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

            {/* Measurements Table */}
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

            <div className="text-center py-2 space-y-1.5"></div>
          </div>
        </div>

        {/* Modal Footer */}
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

// -------------------------------------------------------------
// COMPONENT: SUIT SPECIFICATIONS & AUTHENTIC JOB PARCHI MODAL
// -------------------------------------------------------------
const SuitSpecsModal = ({ suit: initialSuit, allSuits = [], worker, closeModal, onSubmitForQC, isSubmitting }) => {
  const [selectedSuitIndex, setSelectedSuitIndex] = useState(0);
  const [printJobSuit, setPrintJobSuit] = useState(null);

  // Fetch full order data if available for complete customer details & all order suits
  const orderId = initialSuit?.orderId;
  const canFetchFullOrder = Boolean(worker?.canCreateOrder || worker?.canDeliverOrder);
  const { data: orderData, isLoading: isLoadingOrder } = useGetOrderById(orderId, { enabled: canFetchFullOrder });

  // Deduplicate and resolve all suits in this order
  const orderSuits = useMemo(() => {
    if (orderData?.suits && orderData.suits.length > 0) {
      return orderData.suits;
    }
    if (!initialSuit || !allSuits || allSuits.length === 0) return [initialSuit];
    const list = allSuits.filter(s => 
      (s.orderId && s.orderId === initialSuit.orderId) || 
      (s.orderNumber && s.orderNumber === initialSuit.orderNumber)
    );
    const seen = new Set();
    const deduped = [];
    for (const item of list) {
      const key = item.suitId || item._id || item.suitNumber || `${item.orderNumber}-${item.suitIndex}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(item);
      }
    }
    return deduped.length > 0 ? deduped : [initialSuit];
  }, [orderData, initialSuit, allSuits]);

  // Sync selected index to matching initialSuit when opened
  useEffect(() => {
    if (orderSuits.length > 0 && initialSuit) {
      const foundIdx = orderSuits.findIndex(s => 
        (s._id && s._id === initialSuit.suitId) ||
        (s.suitId && s.suitId === initialSuit.suitId) ||
        (s.suitNumber && s.suitNumber === initialSuit.suitNumber)
      );
      if (foundIdx !== -1) {
        setSelectedSuitIndex(foundIdx);
      }
    }
  }, [orderSuits, initialSuit]);

  const activeSuit = orderSuits[selectedSuitIndex] || orderSuits[0] || initialSuit;
  if (!activeSuit) return null;

  // Resolved metadata
  const orderNumber = orderData?.orderNumber || activeSuit.orderNumber || initialSuit.orderNumber;
  const customerName = orderData?.customer?.name || activeSuit.customerName || initialSuit.customerName || 'Walk-in Customer';
  const customerPhone = orderData?.customer?.phone || activeSuit.customerPhone || initialSuit.customerPhone;
  const customerAddress = orderData?.customer?.address || '';
  const bookingDate = orderData?.bookingDate || activeSuit.createdAt || initialSuit.createdAt;
  const deliveryDate = orderData?.deliveryDate || activeSuit.deliveryDate || initialSuit.deliveryDate;
  
  const wearer = activeSuit.wearer || initialSuit.wearer || {};
  const wearerName = activeSuit.wearerName || wearer.name || customerName;
  const suitIdBadge = activeSuit.suitNumber || (orderNumber ? `BT-${orderNumber}-${selectedSuitIndex + 1}` : 'BT-SUIT');

  const measurements = (activeSuit.measurements && activeSuit.measurements.length > 0)
    ? activeSuit.measurements
    : (wearer.measurements || orderData?.customer?.measurements || []);
  const measurementRows = formatMeasurementsForParchi(measurements);

  const prefs = activeSuit.stitchingPreferences || wearer.stitchingPreferences || orderData?.customer?.stitchingPreferences || {};

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
    ...(Array.isArray(activeSuit.staticTags) ? activeSuit.staticTags : [])
  ];

  const prefValues = Array.from(new Set([...prefValuesFromObj, ...rawTags])).filter(Boolean);

  const suitStatus = activeSuit.stitchingStatus || initialSuit.stitchingStatus || 'Assigned';
  const isUnderInspection = suitStatus === 'Submitted for Inspection';
  const isRework = suitStatus === 'Rework Required' || suitStatus === 'Rework';
  const isStitched = suitStatus === 'Stitched';
  const reworkNotes = activeSuit.reworkNotes || initialSuit.reworkNotes || '';
  const workerWage = worker?.perSuitWage || activeSuit.price || 0;

  const suitOrderId = orderId || activeSuit.orderId || initialSuit.orderId;
  const suitId = activeSuit._id || activeSuit.suitId || initialSuit.suitId;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-3 font-sans">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl relative flex flex-col max-h-[92vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center py-2.5 px-4 sm:px-5 border-b border-gray-100 bg-[#0F172A] text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 bg-[#DFAC43] rounded-sm"></span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-white">
                    Order Details & Specifications
                  </h2>
                  <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2 py-0.5 rounded shadow-2xs">
                    #BT-{orderNumber}
                  </span>
                  {orderSuits.length > 1 && (
                    <span className="bg-blue-900/80 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-700">
                      {orderSuits.length} Suits
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  Job Sheet, Full Naap Measurements, Specs & Direct Actions
                </p>
              </div>
            </div>
            <button 
              onClick={closeModal} 
              className="p-1 text-gray-400 hover:text-white transition rounded hover:bg-gray-800 cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-3 sm:p-4 space-y-3 flex-1 bg-gray-100/70">
            
            {/* 1. TOP 4 SUMMARY CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              
              {/* Customer Details Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiUser className="text-[#DFAC43]" /> Customer Information
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{customerName}</p>
                <p className="text-[11px] text-gray-600 font-semibold flex items-center gap-1 font-mono">
                  <FiPhone className="text-gray-400 text-[9px]" /> {formatPhone(customerPhone)}
                </p>
                {customerAddress && (
                  <p className="text-[10px] text-gray-400 truncate">{customerAddress}</p>
                )}
              </div>

              {/* Dates Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiCalendar className="text-[#DFAC43]" /> Timeline & Schedule
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Booked:</span>
                  <span className="text-gray-900">{bookingDate ? new Date(bookingDate).toLocaleDateString() : '-'}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Delivery Due:</span>
                  <span className="text-red-600 font-black">{deliveryDate ? new Date(deliveryDate).toLocaleDateString() : '-'}</span>
                </div>
              </div>

              {/* Karigar Wage & Status Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiCreditCard className="text-[#DFAC43]" /> Karigar Wage & Status
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Your Wage:</span>
                  <span className="text-emerald-700 font-black font-sans text-xs">Rs {workerWage}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">QC Status:</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase ${
                    isStitched ? 'bg-green-100 text-green-800' :
                    isUnderInspection ? 'bg-amber-100 text-amber-800' :
                    isRework ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {suitStatus}
                  </span>
                </div>
              </div>

              {/* Garment & Wearer Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiScissors className="text-[#DFAC43]" /> Garment & Wearer
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Wearer:</span>
                  <span className="text-gray-900 font-bold truncate max-w-[110px]">{wearerName}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Service:</span>
                  <span className="text-gray-900 font-bold truncate max-w-[110px]">{activeSuit.serviceType || 'Shalwar Qameez'}</span>
                </div>
              </div>

            </div>

            {/* SUIT SELECTION TABS (If multiple suits in order) */}
            {orderSuits.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase shrink-0">Suits:</span>
                {orderSuits.map((s, sIdx) => {
                  const sBadge = s.suitNumber || `BT-${orderNumber}-${sIdx + 1}`;
                  return (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setSelectedSuitIndex(sIdx)}
                      className={`py-1 px-2.5 rounded-lg text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        selectedSuitIndex === sIdx
                          ? 'bg-[#0F172A] text-[#DFAC43] shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <span>Suit #{sIdx + 1} ({sBadge})</span>
                      {s.fabricDetails && <span className="text-[10px] opacity-75">[{s.fabricDetails}]</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. MAIN SPLIT SECTION: LEFT SIDE (PARCHI DETAIL) & RIGHT SIDE (IMAGE & QC ACTIONS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
              
              {/* LEFT SIDE (lg:col-span-7): AUTHENTIC JOB PARCHI / NAAP DETAIL CARD */}
              <div className="lg:col-span-7 bg-white rounded-xl border-2 border-black overflow-hidden shadow-xs">
                
                {/* Parchi Top Header Bar */}
                <div className="bg-[#0F172A] text-white px-3.5 py-2 flex flex-wrap justify-between items-center gap-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2 py-0.5 rounded shadow-2xs">
                      {suitIdBadge}
                    </span>
                    <span className="font-bold text-xs text-gray-200">
                      {activeSuit.serviceType || 'Shalwar Qameez'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-[#DFAC43]">
                      Wage: Rs {workerWage}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPrintJobSuit({ 
                        order: orderData || {
                          orderNumber,
                          deliveryDate,
                          customer: { name: customerName, phone: customerPhone, address: customerAddress },
                          bookingDate
                        },
                        suit: activeSuit,
                        suitIndex: selectedSuitIndex 
                      })}
                      className="bg-[#DFAC43] hover:bg-yellow-400 text-[#0F172A] font-black px-2.5 py-0.5 rounded text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                      title="Print Suit Job Parchi"
                    >
                      <FiPrinter className="text-xs" /> Print Parchi
                    </button>
                  </div>
                </div>

                {/* Split Parchi: Left (اضافی تفصیل) + Right (ناپ ٹیبل) */}
                <div className="grid grid-cols-1 sm:grid-cols-12">
                  
                  {/* Left Column: اضافی تفصیل + Fabric + Tags + Custom Notes */}
                  <div className="sm:col-span-7 p-3 sm:p-4 flex flex-col justify-between space-y-3 border-b sm:border-b-0 sm:border-r-2 border-black bg-white">
                    
                    <div className="space-y-2.5">
                      {/* Heading */}
                      <div className="text-center">
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-wide font-serif">
                          اضافی تفصیل
                        </h3>
                        <div className="w-20 h-0.5 bg-gray-300 mx-auto mt-0.5"></div>
                      </div>

                      {/* Fabric Details & Volume Badge */}
                      <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-1">
                        <span className="font-black text-sm sm:text-base text-gray-900 font-serif underline decoration-2">
                          {activeSuit.fabricDetails || 'کپڑا درج نہیں'}
                        </span>
                        {activeSuit.volumeNo && (
                          <span className="bg-black text-white font-mono font-black text-[11px] px-2 py-0.5 rounded">
                            VOL: {activeSuit.volumeNo}
                          </span>
                        )}
                      </div>

                      {/* Style / Design Preference Tags */}
                      {prefValues.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {prefValues.map((tag, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="border border-black text-black font-black text-[11px] px-2 py-0.5 rounded bg-white shadow-2xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Add-on Customizations (if any) */}
                      {activeSuit.customizations && activeSuit.customizations.length > 0 && (
                        <div className="pt-1.5 border-t border-dashed border-gray-300">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                            Add-on Customizations:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {activeSuit.customizations.map((c, cIdx) => (
                              <span key={cIdx} className="bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px] px-1.5 py-0.5 rounded">
                                + {c.name} {c.price ? `(+Rs ${c.price})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Special Tailor Instructions (خصوصی ہدایات) ONLY if present */}
                    {activeSuit.customDesign && activeSuit.customDesign.trim() !== '' && (
                      <div className="border-t-2 border-dashed border-gray-400 pt-2 mt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block text-right mb-0.5">خصوصی ہدایات:</span>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 text-right leading-relaxed font-sans" dir="rtl">
                          {activeSuit.customDesign}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Right Column: Complete Measurement Table */}
                  <div className="sm:col-span-5 bg-white flex flex-col justify-start">
                    {measurementRows.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 italic text-xs">
                        Is suit ke liye koi naap darj nahi hai.
                      </div>
                    ) : (
                      <table className="w-full text-center border-collapse">
                        <tbody>
                          {measurementRows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-black last:border-b-0">
                              <td className="p-1.5 font-sans font-black text-sm text-gray-900 border-r-2 border-black w-1/2 bg-gray-50/60">
                                {row.val || '-'}
                              </td>
                              <td className="p-1.5 font-bold text-xs text-gray-900 text-right pr-2.5 font-serif w-1/2">
                                {row.label}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                </div>

              </div>

              {/* RIGHT SIDE (lg:col-span-5): FABRIC IMAGE + WORK STATUS + QC SUBMISSION ACTIONS */}
              <div className="lg:col-span-5 space-y-3">
                
                {/* 1. FABRIC / SUIT IMAGE CARD (Compact) */}
                <div className="bg-white rounded-xl border border-gray-200 p-2.5 sm:p-3 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <FiImage className="text-[#DFAC43]" /> Suit & Fabric Photo
                    </span>
                    {activeSuit.fabricImage?.url && (
                      <a 
                        href={activeSuit.fabricImage.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        Open Full Photo
                      </a>
                    )}
                  </div>
                  
                  <div className="w-full h-36 sm:h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center relative group">
                    {activeSuit.fabricImage?.url ? (
                      <img 
                        src={activeSuit.fabricImage.url} 
                        alt="Suit Fabric" 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="text-center p-3 text-gray-400 space-y-1">
                        <FiImage className="text-3xl mx-auto text-gray-300" />
                        <p className="text-[11px] font-bold text-gray-600">No Fabric Photo Attached</p>
                        <p className="text-[10px] text-gray-400">{activeSuit.fabricDetails || 'Standard Fabric'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. QC INSPECTION ACTIONS & WORK STATUS CARD */}
                <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <FiScissors className="text-[#DFAC43]" /> Work & QC Status
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      isStitched ? 'bg-green-100 text-green-800 border border-green-300' :
                      isUnderInspection ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      isRework ? 'bg-red-100 text-red-800 border border-red-300' :
                      'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {suitStatus}
                    </span>
                  </div>

                  {/* REWORK REQUIRED STATE */}
                  {isRework && (
                    <div className="bg-red-50 border-2 border-red-500 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2 text-red-900 font-black text-xs">
                        <FiAlertTriangle className="text-red-600 text-base shrink-0 animate-bounce" />
                        <span>Admin Alteration / Rework Instructions:</span>
                      </div>
                      <p className="text-xs font-bold text-red-800 bg-white p-2.5 rounded-lg border border-red-200">
                        {reworkNotes || 'Please correct stitching defects and re-submit for QC inspection.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSubmitForQC(suitOrderId, suitId)}
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-2 px-3 rounded-lg text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <FiCheckCircle /> Re-Submit for QC Inspection
                      </button>
                    </div>
                  )}

                  {/* SUBMITTED FOR INSPECTION STATE */}
                  {isUnderInspection && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                        <FiClock className="text-amber-700 text-base shrink-0 animate-spin" />
                        <span>Submitted for QC Inspection!</span>
                      </div>
                      <p className="text-[11px] text-amber-900 font-medium">
                        Suit is currently with the shop master/admin for quality inspection. Once approved, wage of <strong>Rs {workerWage}</strong> will be added to your approved balance.
                      </p>
                    </div>
                  )}

                  {/* STITCHED / COMPLETED STATE */}
                  {isStitched && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-950 font-black text-xs">
                        <FiCheckCircle className="text-emerald-700 text-base shrink-0" />
                        <span>QC Passed & Stitched!</span>
                      </div>
                      <p className="text-[11px] text-emerald-900 font-medium">
                        Suit has passed quality inspection. Your wage of <strong>Rs {workerWage}</strong> has been approved.
                      </p>
                    </div>
                  )}

                  {/* ASSIGNED / IN-PROGRESS STATE */}
                  {!isRework && !isUnderInspection && !isStitched && (
                    <div className="space-y-2.5">
                      <div className="bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-700">
                        <p className="font-medium text-[11px]">
                          Once you finish cutting and stitching this suit according to the job parchi measurements, submit it for inspection.
                        </p>
                        <p className="font-black text-emerald-700 mt-1">
                          Wage to earn: Rs {workerWage}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSubmitForQC(suitOrderId, suitId)}
                        disabled={isSubmitting}
                        className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <FiCheckCircle /> Submit for QC Inspection
                      </button>
                    </div>
                  )}

                </div>

                {/* 3. MULTI-SUIT LIST IN THIS ORDER (IF MULTIPLE SUITS) */}
                {orderSuits.length > 1 && (
                  <div className="bg-slate-50 border border-gray-200 rounded-xl p-3 shadow-2xs space-y-2">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <FiLayers className="text-[#DFAC43]" /> All Suits in this Order ({orderSuits.length})
                    </span>
                    <div className="space-y-1.5">
                      {orderSuits.map((s, idx) => {
                        const isCur = idx === selectedSuitIndex;
                        const sBadge = s.suitNumber || `BT-${orderNumber}-${idx + 1}`;
                        const isSStitched = s.stitchingStatus === 'Stitched';
                        const isSInspection = s.stitchingStatus === 'Submitted for Inspection';
                        const isSRework = s.stitchingStatus === 'Rework Required' || s.stitchingStatus === 'Rework';
                        
                        return (
                          <div 
                            key={idx}
                            onClick={() => setSelectedSuitIndex(idx)}
                            className={`p-2 rounded-lg border text-xs flex justify-between items-center cursor-pointer transition ${
                              isCur ? 'bg-amber-50 border-[#DFAC43] shadow-2xs' : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="truncate mr-2">
                              <span className="font-mono font-black text-[11px] mr-1.5 text-black">
                                #{sBadge}
                              </span>
                              <span className="text-gray-600 font-medium truncate text-[11px]">
                                {s.fabricDetails || 'Fabric'}
                              </span>
                            </div>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 ${
                              isSStitched ? 'bg-green-600 text-white' :
                              isSInspection ? 'bg-amber-400 text-black' :
                              isSRework ? 'bg-red-600 text-white' :
                              'bg-blue-600 text-white'
                            }`}>
                              {s.stitchingStatus || 'Assigned'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="py-2.5 px-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-gray-500">
              Active Suit: <span className="font-black text-black">{suitIdBadge}</span> ({suitStatus})
            </span>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={closeModal} 
                className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-xs font-bold transition shadow cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SUIT JOB PARCHI PRINT MODAL */}
      {printJobSuit && (
        <SuitJobCardPrintModal
          order={printJobSuit.order}
          suit={printJobSuit.suit}
          suitIndex={printJobSuit.suitIndex}
          worker={worker}
          closeModal={() => setPrintJobSuit(null)}
        />
      )}
    </>
  );
};

export default SuitSpecsModal;
