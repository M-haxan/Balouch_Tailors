import React, { useState } from 'react';
import defaultLogo from '../assets/BT_Logo.png';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { formatPhone } from '../utils/formatters';
import { FiPrinter, FiX, FiCheckCircle, FiUser, FiCalendar, FiPhone } from 'react-icons/fi';

const DeliveryReceiptModal = ({ order, settlementData, closeModal }) => {
  const [paperSize, setPaperSize] = useState('80mm'); // '56mm' | '80mm' | 'a4'
  const { data: shopSettings } = useGetShopSettings();

  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';
  const tagline = shopSettings?.tagline || 'Gents Shalwar Qameez Specialist';
  const proprietor = shopSettings?.proprietor || 'Zubair Balouch';
  const primaryPhone = shopSettings?.primaryPhone || '0313-4389192';
  const secondaryPhone = shopSettings?.secondaryPhone || '0306-7379919';
  const address = shopSettings?.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan';

  const { receivedAmount = 0, paymentMethod = 'Cash', diff = 0, deliveredByName = '' } = settlementData || {};
  const totalBill = Number(order.totalAmount) || 0;
  const advancePaid = Number(order.advancePaid) || 0;
  const remainingBal = diff !== undefined ? diff : Math.max(0, (Number(order.balanceAmount) || 0) - Number(receivedAmount));

  // Determine who delivered this order
  const handlerName = deliveredByName || order.deliveredBy?.name || order.receivedAtDelivery?.receivedBy || 'Admin Counter';

  const handlePrint = () => {
    try {
      const originalTitle = document.title;
      document.title = `DeliverySlip_BT-${order.orderNumber || (order._id ? order._id.slice(-6).toUpperCase() : 'Slip')}`;
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
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 font-sans overflow-y-auto">
      
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
          body * {
            visibility: hidden !important;
          }
          #delivery-printable-slip, #delivery-printable-slip * {
            visibility: visible !important;
          }
          #delivery-printable-slip {
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

      <div className="bg-white rounded shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        
        {/* TOP CONTROLS BAR (SCREEN ONLY) */}
        <div className="bg-[#0F172A] text-white p-4 flex flex-wrap justify-between items-center gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 bg-[#DFAC43] rounded-sm"></span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <FiPrinter className="text-[#DFAC43]" /> Delivery & Cash Receiving Slip
              </h3>
              <p className="text-[11px] text-gray-300">رسید وصولی سوٹ و کیش ادائیگی</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Paper Size Switcher */}
            <div className="flex items-center bg-gray-800 p-1 rounded border border-gray-700 text-xs font-bold">
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
              onClick={handlePrint}
              className="bg-[#DFAC43] hover:bg-yellow-400 text-[#0F172A] font-black text-xs px-4 py-1.5 rounded transition shadow flex items-center gap-1 cursor-pointer"
            >
              <FiPrinter /> Print Slip
            </button>

            <button
              type="button"
              onClick={closeModal}
              className="text-gray-400 hover:text-white p-1 text-lg transition cursor-pointer"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-100 flex justify-center items-start">
          
          <div 
            id="delivery-printable-slip"
            className={`bg-white shadow-md border border-gray-300 text-black leading-tight ${containerWidthClass}`}
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
                  DELIVERY & PAYMENT RECEIPT (رسید وصولی سوٹ)
                </span>
              </div>
            </div>

            {/* ORDER & CUSTOMER METADATA */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>Order No:</span>
                <span className="font-black font-sans text-sm">#BT-{order.orderNumber || (order._id ? order._id.slice(-6).toUpperCase() : '---')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Date & Time:</span>
                <span className="font-bold">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-black">{order.customer?.name || 'Walk-in Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Phone:</span>
                <span className="font-bold font-mono">{formatPhone(order.customer?.phone)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivered / Handled By:</span>
                <span className="font-black text-[#0F172A]">{handlerName}</span>
              </div>
            </div>

            {/* DELIVERED SUITS LIST */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-1.5">
              <div className="flex justify-between font-black text-[10px] uppercase border-b border-gray-200 pb-1">
                <span>Delivered Suit Items</span>
                <span>Qty: {order.suits?.length || 1}</span>
              </div>
              
              {order.suits && order.suits.map((suit, idx) => (
                <div key={idx} className="flex justify-between items-start text-[10px] py-0.5">
                  <div>
                    <span className="font-black font-mono bg-gray-100 px-1 py-0.2 rounded border border-gray-200">
                      {suit.suitNumber || `BT-${order.orderNumber || '1'}-${idx + 1}`}
                    </span>
                    <p className="font-bold text-gray-800 mt-0.5">{suit.serviceType || 'Shalwar Qameez'} {suit.fabricDetails ? `(${suit.fabricDetails})` : ''}</p>
                    {suit.wearer?.name && <p className="text-gray-500 text-[9px]">Wearer: {suit.wearer.name}</p>}
                  </div>
                  <span className="font-black text-right font-sans">Rs {suit.price}</span>
                </div>
              ))}
            </div>

            {/* FINANCIAL SETTLEMENT BREAKDOWN */}
            <div className="py-2 border-b-2 border-black space-y-1 text-[11px]">
              <div className="flex justify-between font-bold text-gray-700">
                <span>Total Order Bill:</span>
                <span className="font-black font-sans">Rs {totalBill.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Advance Paid Earlier:</span>
                <span className="font-bold font-sans">Rs {advancePaid.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-green-900 font-bold bg-green-50 px-1 py-0.5 rounded border border-green-200">
                <span>Cash/Payment Received at Handover ({paymentMethod}):</span>
                <span className="font-black font-sans">Rs {Number(receivedAmount).toLocaleString()}</span>
              </div>

              {/* REMAINING BALANCE ROW */}
              <div className="flex justify-between items-center pt-1 border-t border-gray-200 text-xs font-black">
                <span>Net Balance Status:</span>
                <span>
                  {remainingBal === 0 ? (
                    <span className="text-green-800 font-black">Rs 0 (NILL / FULLY PAID)</span>
                  ) : remainingBal > 0 ? (
                    <span className="text-red-700 font-black">Rs {remainingBal.toLocaleString()} (Udhar / Khata)</span>
                  ) : (
                    <span className="text-blue-700 font-black">Rs {Math.abs(remainingBal).toLocaleString()} (Credit Balance)</span>
                  )}
                </span>
              </div>
            </div>

            {/* CUSTOMER CONFIRMATION & RECEIPT CLAUSE */}
            <div className="text-center py-2 space-y-1.5">
              <div className="p-1.5 bg-gray-50 border border-gray-200 rounded text-center space-y-0.5">
                <p className="text-[10px] font-black text-gray-900" dir="rtl">
                  سوٹ درست حالت، فٹنگ اور سائز میں چیک کر کے وصول پا لیا ہے۔
                </p>
                <p className="text-[8px] text-gray-500 italic">
                  Suits verified, checked & received in good order. Thank you for choosing {shopName}!
                </p>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-5 px-2 text-[8px] text-gray-500 font-bold">
                <div className="text-center">
                  <div className="w-20 border-b border-gray-400 mb-1"></div>
                  <span>Customer Sign</span>
                </div>
                <div className="text-center">
                  <div className="w-20 border-b border-gray-400 mb-1"></div>
                  <span>Delivery Stamp / Sign</span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="pt-2 border-t-2 border-black text-center space-y-0.5 text-black">
              <p className="font-black text-[9px] sm:text-[10px] uppercase tracking-wider">
                Proprietor: {proprietor}
              </p>
              <p className="font-black text-[9px] sm:text-[10px] font-sans">
                📞 {primaryPhone}{secondaryPhone ? ` | ${secondaryPhone}` : ''}
              </p>
              <p className="text-[7px] sm:text-[8px] text-gray-600">
                {address}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DeliveryReceiptModal;
