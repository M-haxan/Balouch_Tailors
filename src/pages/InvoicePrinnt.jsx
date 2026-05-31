import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useGetOrders } from '../hooks/useOrder';
import { FiPrinter, FiArrowLeft } from 'react-icons/fi';

const InvoicePrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetOrders();
  
  // Specific order find karna
  const order = orders.find(o => o._id === id);
  
  // Print ke liye reference
  const printRef = useRef();
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Order_BT-${order?.orderNumber || 'Slip'}`,
  });

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500">Loading slip data...</div>;
  if (!order) return <div className="p-10 text-center text-red-500 font-bold">Order not found!</div>;

  // Order ID format: Agar custom sequence hai toh wo use karo, warna purani slice wali logic
  const displayId = order.orderNumber ? `BT-${order.orderNumber}` : order._id.slice(-6).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center">
      
      {/* Top Action Buttons (Yeh print nahi honge, sirf screen par dikhenge) */}
      <div className="w-full max-w-3xl flex justify-between mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="bg-white text-black px-5 py-2.5 rounded-xl shadow-sm font-bold border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition"
        >
          <FiArrowLeft /> Back
        </button>
        <button 
          onClick={handlePrint} 
          className="bg-black hover:bg-gray-900 text-[#D4AF37] px-8 py-2.5 rounded-xl shadow-lg font-black tracking-wider flex items-center gap-2 transition"
        >
          <FiPrinter /> PRINT SLIPS
        </button>
      </div>

      {/* --- A4 PAPER SHEET (Jo asal mein print hogi) --- */}
      <div 
        ref={printRef} 
        className="w-full max-w-3xl bg-white shadow-xl px-10 py-12"
        style={{ minHeight: '11in' }} 
      >
        
        {/* ========================================= */}
        {/* 1. CUSTOMER INVOICE (Dukan Dar Ki Parchi) */}
        {/* ========================================= */}
        <div className="border-b-2 border-dashed border-gray-300 pb-8 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black text-black uppercase tracking-widest">Balouch Tailors</h1>
            <p className="text-sm text-gray-600 mt-1 font-medium">Main Bazar, Multan | Contact: 0300-XXXXXXX</p>
          </div>
          
          <div className="flex justify-between items-start mb-6 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 min-w-[200px]">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Billed To:</p>
              <p className="font-black text-lg">{order.customer?.name}</p>
              <p className="font-bold text-gray-700">{order.customer?.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-lg"><strong>Order #:</strong> <span className="font-black">#{displayId}</span></p>
              <p className="text-gray-600"><strong>Booking:</strong> {new Date(order.bookingDate).toLocaleDateString()}</p>
              <p className="text-red-600 text-lg mt-1"><strong>Due Date:</strong> <span className="font-black">{new Date(order.deliveryDate).toLocaleDateString()}</span></p>
            </div>
          </div>

          <table className="w-full text-left text-sm mb-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2 text-gray-600 uppercase text-xs">Fabric & Details</th>
                <th className="py-2 text-right text-gray-600 uppercase text-xs">Stitching (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {order.suits.map((suit, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3">
                    <span className="font-black text-base">{suit.fabricDetails}</span> <span className="text-gray-500 font-bold">(Vol: {suit.volumeNo})</span><br/>
                    <span className="text-xs font-semibold text-gray-500 block mt-1">Tags: {suit.staticTags?.join(', ')}</span>
                  </td>
                  <td className="py-3 text-right font-black text-base">{suit.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end text-sm">
            <div className="w-72 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex justify-between font-bold text-gray-600"><span>Total Bill:</span> <span>Rs {order.totalAmount}</span></div>
              <div className="flex justify-between font-bold text-gray-600"><span>Advance Paid:</span> <span>Rs {order.advancePaid}</span></div>
              <div className="flex justify-between text-xl font-black border-t-2 border-black pt-2 mt-2 text-black">
                <span>Balance:</span> <span>Rs {order.balanceAmount}</span>
              </div>
            </div>
          </div>
        </div>

       {/* ========================================= */}
        {/* 2. KARIGAR SLIP (Smart Grouped Parchi)      */}
        {/* ========================================= */}
        <div className="pt-6">
          <div className="bg-black text-[#D4AF37] print:text-black print:bg-white print:border-b-2 print:border-black px-4 py-2 mb-6 font-black uppercase text-xl rounded text-center print:hidden">
            ✂️ Master Slips (Karigar Copy)
          </div>

          <div className="space-y-8">
            {/* 🌟 LOGIC: Suits ko Wearer ke hisaab se group kar rahe hain 🌟 */}
            {Object.values(
              order.suits.reduce((acc, suit, idx) => {
                const wearerId = suit.wearer?._id || order.customer._id;
                if (!acc[wearerId]) {
                  acc[wearerId] = {
                    wearerData: suit.wearer || order.customer,
                    suitsList: [] // Is bande ke saare suits is array mein jayenge
                  };
                }
                // Suit ka number yaad rakhne ke liye idx + 1 bheja
                acc[wearerId].suitsList.push({ ...suit, displayNum: idx + 1 });
                return acc;
              }, {})
            ).map((group, groupIdx) => {
              
              const { wearerData, suitsList } = group;
              const hasMeasurements = wearerData?.measurements && wearerData.measurements.length > 0;
              const measData = hasMeasurements ? wearerData.measurements[0].data : {};

              return (
                <div 
                  key={groupIdx} 
                  dir="rtl" 
                  className="border-[3px] border-black p-4 bg-white break-inside-avoid font-sans"
                  style={{ fontFamily: '"Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", Arial, sans-serif' }}
                >
                  
                  {/* Decorative Top Border */}
                  <div className="w-full border-y-[3px] border-double border-black py-1 mb-6 flex justify-between items-center px-4 bg-gray-50 print:bg-white">
                    <span className="font-black text-xl tracking-widest" dir="ltr">BALOUCH TAILORS</span>
                    <span className="font-bold">کل سوٹ: {suitsList.length}</span>
                  </div>

                  {/* Header: Name, Date, Phone, Booking No */}
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6 text-xl font-bold text-black px-2">
                    <div className="flex items-end border-b border-black pb-1">
                      <span className="min-w-[40px] text-2xl">نام:</span>
                      <span className="flex-grow px-2 font-black text-xl" dir="ltr">{wearerData?.name}</span>
                    </div>
                    <div className="flex items-end border-b border-black pb-1">
                      <span className="min-w-[50px] text-2xl">تاریخ:</span>
                      <span className="flex-grow px-2 font-black text-lg font-sans" dir="ltr">{new Date(order.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-end border-b border-black pb-1">
                      <span className="min-w-[80px] text-2xl">بکنگ نمبر:</span>
                      <span className="flex-grow px-2 font-black text-xl font-sans" dir="ltr">#{displayId}</span>
                    </div>
                    <div className="flex items-end border-b border-black pb-1">
                      <span className="min-w-[80px] text-2xl">فون نمبر:</span>
                      <span className="flex-grow px-2 font-black text-xl font-sans" dir="ltr">{wearerData?.phone}</span>
                    </div>
                  </div>

                  {/* Main Body */}
                  <div className="flex border-2 border-black">
                    
                    {/* RIGHT COLUMN: Measurements Table (Ek Baar Aayega) */}
                    <div className="w-[35%] border-l-2 border-black bg-gray-50 print:bg-white">
                      {!hasMeasurements ? (
                        <div className="p-4 text-center font-bold text-red-500 text-xl">کوئی ناپ نہیں</div>
                      ) : (
                        <table className="w-full text-center border-collapse">
                          <tbody>
                            {Object.keys(measData).map((field, fIdx) => (
                              <tr key={fIdx} className="border-b border-black last:border-b-0">
                                <td className="w-1/2 border-l border-black p-2 font-black text-lg uppercase bg-gray-100 print:bg-white" dir="ltr">{field}</td>
                                <td className="w-1/2 p-2 font-black text-2xl font-sans" dir="ltr">{measData[field]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* LEFT COLUMN: Izafi Tafseel (Saare Suits List Honge) */}
                    <div className="w-[65%] flex flex-col">
                      <h3 className="text-3xl font-black text-center py-3 border-b-2 border-black bg-gray-100 print:bg-white m-0">
                        سوٹوں کی تفصیل ({suitsList.length})
                      </h3>
                      
                      <div className="flex flex-col grow">
                        {suitsList.map((suitItem, sIdx) => (
                          <div key={sIdx} className="p-4 border-b last:border-b-0 border-gray-300 border-dashed">
                            
                            {/* Suit Title & Volume */}
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-sans font-black text-xl uppercase" dir="ltr">
                                {suitItem.displayNum}. {suitItem.fabricDetails}
                              </span>
                              <span className="bg-black text-white px-2 py-0.5 rounded text-xs font-sans font-bold tracking-wider" dir="ltr">
                                VOL: {suitItem.volumeNo}
                              </span>
                            </div>

                            {/* Tags */}
                            {suitItem.staticTags && suitItem.staticTags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5" dir="ltr">
                                {suitItem.staticTags.map(tag => (
                                  <span key={tag} className="border border-black px-2 py-0.5 rounded text-xs font-bold font-sans">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Custom Design Voice Note */}
                            {suitItem.customDesign && (
                              <div className="mt-2 text-xl font-bold leading-relaxed text-right text-gray-800">
                                {suitItem.customDesign}
                              </div>
                            )}
                            
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;