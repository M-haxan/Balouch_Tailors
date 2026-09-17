import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrders } from '../hooks/useOrder';
import { FiPrinter, FiArrowLeft, FiSliders } from 'react-icons/fi';
import logo from '../assets/BT_Logo.png';

const InvoicePrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetOrders();
  
  // Paper size state: '56mm' | '80mm' | 'a4'
  const [paperSize, setPaperSize] = useState('80mm');
  
  // Find specific order
  const order = orders.find(o => o._id === id);
  
  const handlePrint = () => {
    try {
      const originalTitle = document.title;
      document.title = `Order_BT-${order?.orderNumber || (order?._id ? order._id.slice(-6).toUpperCase() : 'Slip')}`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    } catch (err) {
      console.error('Print error:', err);
      window.print();
    }
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500">Loading slip data...</div>;
  if (!order) return <div className="p-10 text-center text-red-500 font-bold">Order not found!</div>;

  const displayId = order.orderNumber ? `BT-${order.orderNumber}` : order._id.slice(-6).toUpperCase();

  // Dynamic width classes based on selected paper size
  const containerWidthClass = 
    paperSize === '56mm' ? 'w-[56mm] max-w-[56mm] text-[10px] p-2' :
    paperSize === '80mm' ? 'w-[80mm] max-w-[80mm] text-xs p-3.5' :
    'w-full max-w-3xl text-sm px-8 py-10';

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6 md:p-8 flex flex-col items-center font-sans printable-slip-wrapper">
      
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
          /* 1. Hide the entire application DOM */
          body * {
            visibility: hidden !important;
          }
          /* 2. Make ONLY the printable slip container and its children visible */
          #printable-slip, #printable-slip * {
            visibility: visible !important;
          }
          /* 3. Position the slip directly at the top-left for zero page bleed */
          #printable-slip {
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

      {/* Top Action & Size Switcher Bar (Screen only) */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 no-print">
        
        <button 
          onClick={() => navigate(-1)} 
          type="button"
          className="bg-white text-black px-4 py-2 rounded shadow-sm font-bold border border-gray-200 flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition text-xs sm:text-sm cursor-pointer"
        >
          <FiArrowLeft /> Back
        </button>

        {/* 3 Size Selector Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded shadow-sm border border-gray-200 text-xs font-bold">
          <span className="text-gray-400 px-2 hidden sm:inline-flex items-center gap-1">
            <FiSliders /> Size:
          </span>

          <button
            type="button"
            onClick={() => setPaperSize('56mm')}
            className={`px-3 py-1.5 rounded transition cursor-pointer ${
              paperSize === '56mm' 
                ? 'bg-[#0F172A] text-[#DFAC43] font-black shadow-xs' 
                : 'text-gray-600 hover:bg-gray-100'
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
                : 'text-gray-600 hover:bg-gray-100'
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
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            A4 Sheet
          </button>
        </div>

        {/* Print Button */}
        <button 
          onClick={handlePrint} 
          type="button"
          className="bg-[#0F172A] hover:bg-[#DFAC43] active:scale-95 text-[#DFAC43] hover:text-[#0F172A] px-6 py-2.5 rounded shadow-md font-black tracking-wide flex items-center gap-2 transition text-xs sm:text-sm cursor-pointer"
        >
          <FiPrinter className="text-base" /> Print Slip
        </button>
      </div>

      {/* --- PRINTABLE SLIP CONTAINER --- */}
      <div 
        id="printable-slip"
        className={`bg-white shadow-xl border border-gray-200 text-black mx-auto overflow-hidden transition-all printable-slip-box ${containerWidthClass}`}
        style={{
          minHeight: paperSize === 'a4' ? '10in' : 'auto'
        }}
      >
        
        {/* ========================================================= */}
        {/* HEADER: LOGO, DISTINCT VISIBLE SECTIONS & CONTACT DETAILS */}
        {/* ========================================================= */}
        <div className="text-center pb-3 border-b-2 border-dashed border-gray-300 mb-3 space-y-1">
          
          {/* Logo */}
          <div className="flex justify-center mb-1">
            <img 
              src={logo} 
              alt="Balouch Tailors" 
              className={paperSize === '56mm' ? 'h-10 w-auto object-contain' : paperSize === '80mm' ? 'h-12 w-auto object-contain' : 'h-16 w-auto object-contain'} 
            />
          </div>

          {/* Shop Name */}
          <h1 className={`font-black uppercase tracking-wider text-black ${
            paperSize === '56mm' ? 'text-sm' : paperSize === '80mm' ? 'text-lg' : 'text-3xl'
          }`}>
            Balouch Tailors
          </h1>

          {/* Speciality Tag (Separate Line) */}
          <div>
            <span className={`inline-block bg-gray-100 text-gray-800 rounded font-black tracking-wider uppercase ${
              paperSize === '56mm' ? 'text-[7px] px-1.5 py-0.5' : paperSize === '80mm' ? 'text-[9px] px-2 py-0.5' : 'text-xs px-3 py-1'
            }`}>
              Custom Bespoke Tailoring & Stitching for Gents
            </span>
          </div>

          {/* Proprietor / Owner & Contact Details (Separate Line) */}
          <p className={`font-bold text-gray-900 ${
            paperSize === '56mm' ? 'text-[8px]' : paperSize === '80mm' ? 'text-[10px]' : 'text-sm'
          }`}>
            Proprietor: <span className="font-black">Muhammad Zubair</span> | Ph: <span className="font-black">0306-7379919</span>
          </p>

          {/* Shop Address (Separate Line) */}
          <p className={`text-gray-500 font-medium ${
            paperSize === '56mm' ? 'text-[7px] leading-tight' : paperSize === '80mm' ? 'text-[9px] leading-tight' : 'text-xs'
          }`}>
            Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan
          </p>

          {/* Prominent Invoice Number Badge */}
          <div className="pt-1">
            <div className="inline-block bg-[#0F172A] text-white px-3 py-1 rounded-md print:border print:border-black">
              <span className={`font-black uppercase tracking-widest ${paperSize === '56mm' ? 'text-[9px]' : 'text-xs'}`}>
                INVOICE #{displayId}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* CUSTOMER & DATES INFO                     */}
        {/* ========================================= */}
        <div className={`mb-3 pb-2.5 border-b border-gray-200 ${
          paperSize === 'a4' ? 'flex justify-between items-center' : 'space-y-1 text-left'
        }`}>
          <div>
            <span className="text-gray-400 font-bold uppercase text-[8px] sm:text-[9px] block">Customer:</span>
            <p className="font-black text-gray-900 text-xs sm:text-sm">{order.customer?.name || 'Customer'}</p>
            <p className="font-semibold text-gray-700 text-[10px] sm:text-xs">{order.customer?.phone || '-'}</p>
          </div>

          <div className={paperSize === 'a4' ? 'text-right' : 'pt-1 border-t border-dashed border-gray-100'}>
            <div className="flex justify-between sm:justify-end gap-2 text-[10px] sm:text-xs">
              <span className="text-gray-500 font-bold">Booking Date:</span>
              <span className="font-bold text-gray-800">{new Date(order.bookingDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-2 text-[10px] sm:text-xs text-red-600 font-bold mt-0.5">
              <span>Delivery Due:</span>
              <span className="font-black">{new Date(order.deliveryDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* SERVICE ITEMS & SUITS BREAKDOWN           */}
        {/* ========================================= */}
        <table className="w-full text-left border-collapse mb-3">
          <thead>
            <tr className="border-b-2 border-black text-[9px] sm:text-xs font-black uppercase text-gray-700">
              <th className="py-1">Description & Specs</th>
              <th className="py-1 text-center w-8 sm:w-10">Qty</th>
              <th className="py-1 text-right w-16 sm:w-20">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-[10px] sm:text-xs">
            
            {/* 1. Suits, Add-ons & Compact Preferences / Specs */}
            {order.suits && order.suits.map((suit, suitIdx) => {
              const suitCustoms = suit.customizations || [];
              const customsSum = suitCustoms.reduce((acc, c) => acc + (Number(c.price) || 0), 0);
              const baseRate = Number(suit.basePrice) > 0 
                ? Number(suit.basePrice) 
                : Math.max(0, (Number(suit.price) || 0) - customsSum);

              const selectedTags = suit.staticTags || [];
              const customNote = suit.customDesign || '';

              return (
                <React.Fragment key={`suit-${suitIdx}`}>
                  {/* Suit Base Row */}
                  <tr>
                    <td className="py-1.5">
                      <div className="font-black text-gray-900">
                        {suit.serviceType ? `${suit.serviceType}` : 'Suit'} #{suitIdx + 1}
                      </div>
                      
                      {suit.fabricDetails && (
                        <div className="text-[9px] sm:text-[10px] text-gray-600">
                          {suit.fabricDetails} {suit.volumeNo ? `(Vol: ${suit.volumeNo})` : ''}
                        </div>
                      )}

                      {/* Only customer selected preferences / tags */}
                      {selectedTags.length > 0 && (
                        <div className="text-[8px] sm:text-[9px] text-gray-700 font-semibold mt-0.5">
                          {selectedTags.join(' • ')}
                        </div>
                      )}

                      {customNote && (
                        <div className="text-[8px] text-gray-500 italic mt-0.5">
                          Note: {customNote}
                        </div>
                      )}
                    </td>
                    <td className="py-1.5 text-center font-bold text-gray-600">1</td>
                    <td className="py-1.5 text-right font-black font-sans">
                      Rs {baseRate.toLocaleString()}
                    </td>
                  </tr>

                  {/* Customization Rows */}
                  {suitCustoms.map((cust, cIdx) => (
                    <tr key={`suit-${suitIdx}-cust-${cIdx}`} className="bg-gray-50/60 text-[9px] sm:text-[11px]">
                      <td className="py-1 pl-2.5 text-gray-700 font-medium">
                        + {cust.name} {cust.urduName ? `(${cust.urduName})` : ''}
                      </td>
                      <td className="py-1 text-center text-gray-500">1</td>
                      <td className="py-1 text-right font-bold font-sans">
                        Rs {Number(cust.price || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}

            {/* 2. Standalone Service Items */}
            {order.orderItems && order.orderItems.map((item, idx) => (
              <tr key={`item-${idx}`}>
                <td className="py-1.5 font-bold text-gray-800">
                  {item.name} {item.category ? `(${item.category})` : ''}
                </td>
                <td className="py-1.5 text-center font-bold text-gray-600">{item.quantity || 1}</td>
                <td className="py-1.5 text-right font-black font-sans">
                  Rs {(item.total || (Number(item.rate || 0) * Number(item.quantity || 1))).toLocaleString()}
                </td>
              </tr>
            ))}

            {/* 3. Alterations */}
            {order.alterations && order.alterations.map((alt, idx) => (
              <tr key={`alt-${idx}`}>
                <td className="py-1.5 font-bold text-gray-800">
                  Alteration: {alt.description}
                </td>
                <td className="py-1.5 text-center font-bold text-gray-600">1</td>
                <td className="py-1.5 text-right font-black font-sans">
                  Rs {Number(alt.price || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ========================================= */}
        {/* FINANCIAL BILL BREAKDOWN                  */}
        {/* ========================================= */}
        <div className="border-t-2 border-black pt-1.5 mb-3 space-y-1 text-[10px] sm:text-xs">
          {order.subtotal > 0 && (
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Gross Subtotal:</span>
              <span>Rs {Number(order.subtotal).toLocaleString()}</span>
            </div>
          )}

          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-700 font-bold">
              <span>Discount ({order.discountPercent || 0}%):</span>
              <span>- Rs {Number(order.discountAmount).toLocaleString()}</span>
            </div>
          )}

          {order.previousKhataAdjusted?.type === 'added_due' && (
            <div className="flex justify-between text-red-600 font-bold">
              <span>+ Previous Udhar Added:</span>
              <span>+ Rs {Number(order.previousKhataAdjusted.amount).toLocaleString()}</span>
            </div>
          )}
          {order.previousKhataAdjusted?.type === 'deducted_advance' && (
            <div className="flex justify-between text-green-700 font-bold">
              <span>- Stored Advance Adjusted:</span>
              <span>- Rs {Number(order.previousKhataAdjusted.amount).toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between font-black text-gray-900 pt-1 border-t border-gray-200">
            <span>Total Bill:</span> 
            <span className="font-sans">Rs {Number(order.totalAmount || 0).toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-bold text-gray-600">
            <span>Advance Paid:</span> 
            <span className="font-sans">Rs {Number(order.advancePaid || 0).toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-xs sm:text-base font-black border-t-2 border-black pt-1 text-black">
            <span>Balance Due:</span> 
            <span className="font-sans">Rs {Number(order.balanceAmount || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* QR Code Tracking Status */}
        <div className="flex flex-col items-center justify-center my-2.5 py-1.5 border-y border-dashed border-gray-300">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${window.location.origin}/track/${order.orderNumber}`)}`} 
            alt="Track Order QR" 
            className="w-12 h-12"
          />
          <span className="text-[7px] sm:text-[8px] text-gray-500 font-bold mt-0.5 uppercase tracking-wider">
            Scan to Live Track Order #{displayId}
          </span>
        </div>

        {/* ========================================= */}
        {/* FOOTER: THANK YOU & TERMS / POLICY        */}
        {/* ========================================= */}
        <div className="text-center pt-1.5 space-y-1.5">
          <p className="font-black text-[10px] sm:text-xs text-gray-900 tracking-wide">
            Thank you for choosing Balouch Tailors!
          </p>
          <p className="text-[9px] sm:text-[10px] text-gray-600 font-urdu" dir="rtl">
            آپ کے اعتماد کا شکریہ۔
          </p>

          <div className="border-t border-gray-200 pt-1.5 text-[7px] sm:text-[8px] text-gray-500 text-left space-y-0.5">
            <p className="font-bold text-gray-700 uppercase">Terms & Conditions:</p>
            <p>1. Please bring this receipt when collecting your stitched clothes.</p>
            <p>2. Delivery will be handed over only after clearance of remaining balance.</p>
            <p>3. Any fitting complaints/alterations must be reported within 7 days of delivery.</p>
            <p>4. Advance payment is non-refundable.</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default InvoicePrint;