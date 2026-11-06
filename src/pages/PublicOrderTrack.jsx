// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import API from '../api/axios';
// import useAuthStore from '../Store/authStore';
// import { FiCheck, FiClock, FiScissors, FiSmile, FiAlertCircle } from 'react-icons/fi';
// import Preloader from '../components/Preloader';
// import { useGetShopSettings } from '../hooks/useShopSettings';


// const PublicOrderTrack = () => {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const { orderNumber } = useParams();
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [phoneInput, setPhoneInput] = useState('');
//   const [verifiedDigits, setVerifiedDigits] = useState('');
//   const { data: shopSettings } = useGetShopSettings();
//   const shopName = shopSettings?.shopName || 'Balouch Tailors';

//   useEffect(() => {
//     if (!orderNumber || !verifiedDigits) return;

//     const fetchOrderStatus = async () => {
//       try {
//         setLoading(true);
//         setError('');
//                 const res = await API.get(`/orders/track/suit/${suitId}`);
//         setSuit(res.data);
//       } catch (err) {
//         const status = err.response?.status;
//         if (status === 401 || !isAuthenticated) {
//           setError('This specification sheet is for the shop team. Please log in as a worker or admin, then scan the QR code again.');
//         } else if (status === 403) {
//           setError('This suit is not assigned to you.');
//         } else {
//           setError(err.response?.data?.message || 'Suit details not found. Please verify the QR Code or URL.');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrderStatus();
//   }, [orderNumber, verifiedDigits]);

//   const handleVerify = (e) => {
//     e.preventDefault();
//     const digits = phoneInput.replace(/\D/g, '').slice(-4);
//     if (digits.length < 4) {
//       setError('Please enter the last 4 digits of your phone number.');
//       return;
//     }
//     setError('');
//     setVerifiedDigits(digits);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
//         <Preloader />
//       </div>
//     );
//   }

//   // Step 1: ask for the last 4 digits of the phone number
//   if (!order) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
//         <form
//           onSubmit={handleVerify}
//           className="bg-gray-800 text-white rounded p-8 max-w-md w-full shadow-2xl border border-gray-700/50 space-y-4 text-center"
//         >
//           <h1 className="text-xl font-black tracking-widest text-[#D4AF37] uppercase">{shopName}</h1>
//           <p className="text-xs text-gray-400 font-black uppercase tracking-wider">
//             Track Order #BT-{orderNumber}
//           </p>
//           <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto"></div>
//           <p className="text-sm text-gray-300">
//             To protect your privacy, please enter the <strong>last 4 digits</strong> of the phone
//             number you gave us when booking.
//           </p>
//           <input
//             type="tel"
//             inputMode="numeric"
//             maxLength={4}
//             autoFocus
//             value={phoneInput}
//             onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
//             placeholder="e.g. 6331"
//             className="w-full text-center text-2xl tracking-[0.5em] font-black bg-black/40 border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
//           />
//           {error && (
//             <p className="flex items-center justify-center gap-2 text-sm text-red-400 font-medium">
//               <FiAlertCircle className="shrink-0" /> {error}
//             </p>
//           )}
//           <button
//             type="submit"
//             className="w-full bg-[#D4AF37] text-black font-black uppercase tracking-wider py-3 rounded hover:opacity-90 transition"
//           >
//             Track My Order
//           </button>
//         </form>
//       </div>
//     );
//   }

//   // Stepper logic calculation based on Order & Suit stages
//   const getActiveStep = () => {
//     if (order.orderStatus === 'Completed') return 5;
    
//     const suits = order.suits || [];
//     const allStitched = suits.length > 0 && suits.every(s => s.stitchingStatus === 'Stitched');
//     const hasStitched = suits.some(s => s.stitchingStatus === 'Stitched');
//     const hasUnderQC = suits.some(s => s.stitchingStatus === 'Submitted for Inspection');
//     const hasAssigned = suits.some(s => s.stitchingStatus === 'Assigned' || s.stitchingStatus === 'Submitted for Inspection' || s.stitchingStatus === 'Stitched');
    
//     if (allStitched || order.orderStatus === 'In Progress') return 4;
//     if (hasStitched || hasUnderQC) return 3;
//     if (hasAssigned) return 2;
//     return 1;
//   };

//   const activeStep = getActiveStep();

//   const steps = [
//     { number: 1, label: 'Order Booked', description: 'Order registered in tailoring database and queued for master cutter.', icon: FiClock },
//     { number: 2, label: 'Cutting & Allocation', description: 'Fabric cutting completed and assigned to master stitching karigar.', icon: FiScissors },
//     { number: 3, label: 'Stitching & QC Inspection', description: 'Garment stitching in progress and undergoing quality control check.', icon: FiScissors },
//     { number: 4, label: 'Pressing & Packing', description: 'Final steam pressing, finishing quality audit, and packaging.', icon: FiCheck },
//     { number: 5, label: 'Ready for Collection', description: 'Order is ready for pickup. Please collect from the shop counter.', icon: FiSmile }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-900 text-white py-12 px-4 md:px-8 font-sans">
//       <div className="max-w-3xl mx-auto space-y-8">
        
//         {/* Brand Header */}
//         <div className="text-center space-y-2">
//           <h1 className="text-3xl md:text-4xl font-black tracking-widest text-[#D4AF37] uppercase">{shopName}</h1>
//           <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Premium Stitching Status Tracker</p>
//           <div className="w-24 h-0.5 bg-[#D4AF37] mx-auto my-2"></div>
//         </div>

//         {/* Order Details Header Card */}
//         <div className="bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded p-6 shadow-xl space-y-4">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <span className="text-[10px] text-[#D4AF37] font-black uppercase tracking-wider">Customer Name</span>
//               <h2 className="text-xl font-black text-white">{order.customerName}</h2>
//             </div>
//             <div className="bg-black/50 border border-gray-700 px-4 py-2 rounded text-center">
//               <span className="text-[9px] text-gray-400 font-bold block uppercase">Tracking ID</span>
//               <span className="text-lg font-black text-[#D4AF37]">#BT-{order.orderNumber}</span>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50 text-xs">
//             <div>
//               <span className="text-gray-400 font-bold block uppercase text-[9px]">Booking Date</span>
//               <span className="font-extrabold text-white text-sm">{new Date(order.bookingDate).toLocaleDateString()}</span>
//             </div>
//             <div className="text-right">
//               <span className="text-gray-400 font-bold block uppercase text-[9px]">Delivery Due Date</span>
//               <span className="font-extrabold text-[#D4AF37] text-sm">{new Date(order.deliveryDate).toLocaleDateString()}</span>
//             </div>
//           </div>
//         </div>

//         {/* Stepper Timeline */}
//         <div className="bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded p-6 md:p-8 shadow-xl space-y-8">
//           <div className="flex justify-between items-center border-b border-gray-700/50 pb-3">
//             <h3 className="font-black text-sm uppercase text-gray-300 tracking-wider">Live Progress Stepper</h3>
//             <span className="text-[11px] font-black bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2.5 py-0.5 rounded">
//               Stage {activeStep} of 5
//             </span>
//           </div>
          
//           <div className="relative pl-8 border-l-2 border-gray-700 space-y-8 ml-3">
//             {steps.map((step) => {
//               const isCompleted = step.number < activeStep;
//               const isActive = step.number === activeStep;

//               return (
//                 <div key={step.number} className="relative">
//                   {/* Step indicator circle */}
//                   <span className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition shadow-md border ${
//                     isCompleted ? 'bg-green-600 border-green-600 text-white' : 
//                     isActive ? 'bg-[#D4AF37] border-[#D4AF37] text-black animate-pulse font-black' : 
//                     'bg-gray-800 border-gray-700 text-gray-500'
//                   }`}>
//                     {isCompleted ? <FiCheck /> : step.number}
//                   </span>

//                   {/* Step Description */}
//                   <div className="space-y-1">
//                     <h4 className={`text-sm font-black uppercase tracking-wider ${
//                       isCompleted ? 'text-green-500' :
//                       isActive ? 'text-[#D4AF37]' :
//                       'text-gray-500'
//                     }`}>
//                       {step.label}
//                     </h4>
//                     <p className={`text-xs ${isActive ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
//                       {step.description}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Suit Status Details */}
//         <div className="bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded p-6 shadow-xl space-y-4">
//           <h3 className="font-black text-sm uppercase text-gray-400 tracking-wider">Suits In This Order ({order.suits?.length || 0})</h3>
          
//           <div className="space-y-4">
//             {order.suits?.map((suit, idx) => (
//               <div key={suit._id || idx} className="bg-black/30 border border-gray-700/30 rounded p-4 flex justify-between items-center gap-4">
//                 <div>
//                   <h4 className="font-black text-sm uppercase tracking-wide text-white">{suit.fabricDetails}</h4>
//                   <p className="text-[11px] text-gray-400 mt-1">Wearer: <span className="font-bold">{suit.wearerName}</span> | Vol: {suit.volumeNo}</p>
//                 </div>
//                 <div>
//                   <span className={`px-3 py-1 rounded text-[10px] font-black uppercase border ${
//                     suit.stitchingStatus === 'Stitched' ? 'bg-green-950/40 border-green-800/50 text-green-400' :
//                     suit.stitchingStatus === 'Submitted for Inspection' ? 'bg-amber-950/40 border-amber-800/50 text-amber-400' :
//                     suit.stitchingStatus === 'Assigned' ? 'bg-blue-950/40 border-blue-800/50 text-blue-400' :
//                     'bg-yellow-950/40 border-yellow-800/50 text-yellow-400'
//                   }`}>
//                     {suit.stitchingStatus === 'Submitted for Inspection' ? 'Under QC' : suit.stitchingStatus}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default PublicOrderTrack;


import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { FiCheck, FiClock, FiScissors, FiSmile, FiAlertCircle } from 'react-icons/fi';
import Preloader from '../components/Preloader';
import { useGetShopSettings } from '../hooks/useShopSettings';


const PublicOrderTrack = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const { data: shopSettings } = useGetShopSettings();
  const shopName = shopSettings?.shopName || 'Balouch Tailors';

  // Customer verifies with the last 4 digits of their phone, then we fetch the order.
  // This is a PUBLIC page: no login needed (the backend checks the digits).
  const handleVerify = async (e) => {
    e.preventDefault();
    const digits = phoneInput.replace(/\D/g, '').slice(-4);
    if (digits.length < 4) {
      setError('Please enter the last 4 digits of your phone number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await API.get(`/orders/track/${encodeURIComponent(orderNumber)}`, {
        params: { phone: digits },
      });
      setOrder(res.data);
    } catch (err) {
      setOrder(null);
      setError(
        err.response?.data?.message ||
          'Could not load your order. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Preloader />
      </div>
    );
  }

  // Step 1: ask for the last 4 digits of the phone number
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <form
          onSubmit={handleVerify}
          className="bg-gray-800 text-white rounded p-8 max-w-md w-full shadow-2xl border border-gray-700/50 space-y-4 text-center"
        >
          <h1 className="text-xl font-black tracking-widest text-[#D4AF37] uppercase">{shopName}</h1>
          <p className="text-xs text-gray-400 font-black uppercase tracking-wider">
            Track Order #BT-{orderNumber}
          </p>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto"></div>
          <p className="text-sm text-gray-300">
            To protect your privacy, please enter the <strong>last 4 digits</strong> of the phone
            number you gave us when booking.
          </p>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={4}
            autoFocus
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 6331"
            className="w-full text-center text-2xl tracking-[0.5em] font-black bg-black/40 border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
          />
          {error && (
            <p className="flex items-center justify-center gap-2 text-sm text-red-400 font-medium">
              <FiAlertCircle className="shrink-0" /> {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-[#D4AF37] text-black font-black uppercase tracking-wider py-3 rounded hover:opacity-90 transition"
          >
            Track My Order
          </button>
        </form>
      </div>
    );
  }

  // Stepper logic calculation based on Order & Suit stages
  const getActiveStep = () => {
    if (order.orderStatus === 'Completed') return 5;
    
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
    { number: 1, label: 'Order Booked', description: 'Order registered in tailoring database and queued for master cutter.', icon: FiClock },
    { number: 2, label: 'Cutting & Allocation', description: 'Fabric cutting completed and assigned to master stitching karigar.', icon: FiScissors },
    { number: 3, label: 'Stitching & QC Inspection', description: 'Garment stitching in progress and undergoing quality control check.', icon: FiScissors },
    { number: 4, label: 'Pressing & Packing', description: 'Final steam pressing, finishing quality audit, and packaging.', icon: FiCheck },
    { number: 5, label: 'Ready for Collection', description: 'Order is ready for pickup. Please collect from the shop counter.', icon: FiSmile }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-widest text-[#D4AF37] uppercase">{shopName}</h1>
          <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Premium Stitching Status Tracker</p>
          <div className="w-24 h-0.5 bg-[#D4AF37] mx-auto my-2"></div>
        </div>

        {/* Order Details Header Card */}
        <div className="bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] text-[#D4AF37] font-black uppercase tracking-wider">Customer Name</span>
              <h2 className="text-xl font-black text-white">{order.customerName}</h2>
            </div>
            <div className="bg-black/50 border border-gray-700 px-4 py-2 rounded text-center">
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
        <div className="bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded p-6 md:p-8 shadow-xl space-y-8">
          <div className="flex justify-between items-center border-b border-gray-700/50 pb-3">
            <h3 className="font-black text-sm uppercase text-gray-300 tracking-wider">Live Progress Stepper</h3>
            <span className="text-[11px] font-black bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2.5 py-0.5 rounded">
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
                  <span className={`absolute -left-[41px] top-0.5 w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition shadow-md border ${
                    isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                    isActive ? 'bg-[#D4AF37] border-[#D4AF37] text-black animate-pulse font-black' : 
                    'bg-gray-800 border-gray-700 text-gray-500'
                  }`}>
                    {isCompleted ? <FiCheck /> : step.number}
                  </span>

                  {/* Step Description */}
                  <div className="space-y-1">
                    <h4 className={`text-sm font-black uppercase tracking-wider ${
                      isCompleted ? 'text-green-500' :
                      isActive ? 'text-[#D4AF37]' :
                      'text-gray-500'
                    }`}>
                      {step.label}
                    </h4>
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
        <div className="bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded p-6 shadow-xl space-y-4">
          <h3 className="font-black text-sm uppercase text-gray-400 tracking-wider">Suits In This Order ({order.suits?.length || 0})</h3>
          
          <div className="space-y-4">
            {order.suits?.map((suit, idx) => (
              <div key={suit._id || idx} className="bg-black/30 border border-gray-700/30 rounded p-4 flex justify-between items-center gap-4">
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wide text-white">{suit.fabricDetails}</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Wearer: <span className="font-bold">{suit.wearerName}</span> | Vol: {suit.volumeNo}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded text-[10px] font-black uppercase border ${
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