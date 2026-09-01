import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiCheck, FiClock, FiScissors, FiSmile, FiAlertCircle } from 'react-icons/fi';
import Preloader from '../components/Preloader';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://bt-backend-5d1ec458f8eb.herokuapp.com/api';

const PublicOrderTrack = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${BACKEND_URL}/orders/track/${orderNumber}`);
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Order nahi mila. Kirya booking slip par QR code ya Order number verify karein.');
      } finally {
        setLoading(false);
      }
    };
    if (orderNumber) {
      fetchOrderStatus();
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Preloader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 text-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-red-900/30 text-center space-y-4">
          <FiAlertCircle className="text-5xl text-red-500 mx-auto" />
          <h2 className="text-xl font-black uppercase tracking-wider text-red-500">Order Not Found</h2>
          <p className="text-sm text-gray-400 font-medium">{error}</p>
          <div className="w-16 h-1 bg-red-500 mx-auto rounded-full"></div>
        </div>
      </div>
    );
  }

  // Stepper logic calculation based on Order & Suit stages
  const getActiveStep = () => {
    if (order.orderStatus === 'Completed') return 5;
    
    // Check individual suit statuses
    const suits = order.suits || [];
    const allStitched = suits.length > 0 && suits.every(s => s.stitchingStatus === 'Stitched');
    const hasStitched = suits.some(s => s.stitchingStatus === 'Stitched');
    const hasUnderQC = suits.some(s => s.stitchingStatus === 'Submitted for Inspection');
    const hasAssigned = suits.some(s => s.stitchingStatus === 'Assigned' || s.stitchingStatus === 'Submitted for Inspection' || s.stitchingStatus === 'Stitched');
    
    if (allStitched || order.orderStatus === 'In Progress') return 4;
    if (hasStitched || hasUnderQC) return 3;
    if (hasAssigned) return 2;
    return 1;
  };

  const activeStep = getActiveStep();

  const steps = [
    { number: 1, label: 'Order Booked', urdu: 'آرڈر بک ہو گیا', description: 'Order system mein register ho gaya hai.', icon: FiClock },
    { number: 2, label: 'Cutting & Allocation', urdu: 'کٹنگ مکمل', description: 'Kapre ki cutting aur master allocation mukammal.', icon: FiScissors },
    { number: 3, label: 'Stitching & QC Inspection', urdu: 'سلائی اور معیار کی جانچ', description: 'Aap ka suit silayi aur quality check mein hai.', icon: FiScissors },
    { number: 4, label: 'Pressing & Packing', urdu: 'پریس اور فنشنگ', description: 'Suit ki final pressing aur packing jari hai.', icon: FiCheck },
    { number: 5, label: 'Ready for Collection', urdu: 'وصولی کے لیے تیار', description: 'Suit bilkul tayyar hai, aap shop se collect kar sakte hain.', icon: FiSmile }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-widest text-[#D4AF37] uppercase font-serif">Balouch Tailors</h1>
          <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Premium Stitching Status Tracker</p>
          <div className="w-24 h-0.5 bg-[#D4AF37] mx-auto my-2"></div>
        </div>

        {/* Order Details Header Card */}
        <div className="bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] text-[#D4AF37] font-black uppercase tracking-wider">Customer Name</span>
              <h2 className="text-xl font-black text-white">{order.customerName}</h2>
            </div>
            <div className="bg-black/50 border border-gray-700 px-4 py-2 rounded-xl text-center">
              <span className="text-[9px] text-gray-400 font-bold block uppercase">Tracking ID</span>
              <span className="text-lg font-black text-[#D4AF37]">#BT-{order.orderNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50 text-xs">
            <div>
              <span className="text-gray-400 font-bold block uppercase text-[9px]">Booking Date</span>
              <span className="font-extrabold text-white text-sm">{new Date(order.bookingDate).toLocaleDateString()}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 font-bold block uppercase text-[9px]">Delivery Due Date</span>
              <span className="font-extrabold text-[#D4AF37] text-sm">{new Date(order.deliveryDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Stepper Timeline */}
        <div className="bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded-2xl p-6 md:p-8 shadow-xl space-y-8">
          <div className="flex justify-between items-center border-b border-gray-700/50 pb-3">
            <h3 className="font-black text-sm uppercase text-gray-300 tracking-wider">Live Progress Stepper</h3>
            <span className="text-[11px] font-black bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-full">
              Stage {activeStep} of 5
            </span>
          </div>
          
          <div className="relative pl-8 border-l-2 border-gray-700 space-y-8 ml-3">
            {steps.map((step) => {
              const isCompleted = step.number < activeStep;
              const isActive = step.number === activeStep;

              return (
                <div key={step.number} className="relative">
                  {/* Step indicator circle */}
                  <span className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition shadow-md border ${
                    isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                    isActive ? 'bg-[#D4AF37] border-[#D4AF37] text-black animate-pulse font-black' : 
                    'bg-gray-800 border-gray-700 text-gray-500'
                  }`}>
                    {isCompleted ? <FiCheck /> : step.number}
                  </span>

                  {/* Step Description */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-black uppercase tracking-wider ${
                        isCompleted ? 'text-green-500' :
                        isActive ? 'text-[#D4AF37]' :
                        'text-gray-500'
                      }`}>
                        {step.label}
                      </h4>
                      <span className="text-[11px] text-gray-400 font-serif" dir="rtl">({step.urdu})</span>
                    </div>
                    <p className={`text-xs ${isActive ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suit Status Details */}
        <div className="bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-black text-sm uppercase text-gray-400 tracking-wider">Suits In This Order ({order.suits?.length || 0})</h3>
          
          <div className="space-y-4">
            {order.suits?.map((suit, idx) => (
              <div key={suit._id || idx} className="bg-black/30 border border-gray-700/30 rounded-xl p-4 flex justify-between items-center gap-4">
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide text-white">{suit.fabricDetails}</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Wearer: <span className="font-bold">{suit.wearerName}</span> | Vol: {suit.volumeNo}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                    suit.stitchingStatus === 'Stitched' ? 'bg-green-950/40 border-green-800/50 text-green-400' :
                    suit.stitchingStatus === 'Submitted for Inspection' ? 'bg-amber-950/40 border-amber-800/50 text-amber-400' :
                    suit.stitchingStatus === 'Assigned' ? 'bg-blue-950/40 border-blue-800/50 text-blue-400' :
                    'bg-yellow-950/40 border-yellow-800/50 text-yellow-400'
                  }`}>
                    {suit.stitchingStatus === 'Submitted for Inspection' ? 'Under QC' : suit.stitchingStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicOrderTrack;
