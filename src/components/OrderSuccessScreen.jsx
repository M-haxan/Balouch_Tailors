import React from 'react';
import { FiCheckCircle, FiScissors } from 'react-icons/fi';

const OrderSuccessScreen = ({
  savedOrder,
  isEditMode,
  editOrderId,
  isWorker,
  navigate
}) => {
  return (
    <div className="bg-gray-50 min-h-[85vh] p-3 sm:p-6 flex items-center justify-center">
      <div className="bg-white p-5 sm:p-8 rounded shadow-md border border-gray-200 text-center max-w-md w-full">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 text-green-600 rounded flex items-center justify-center mx-auto mb-4 sm:mb-5">
          <FiCheckCircle className="text-2xl sm:text-3xl" />
        </div>
        <h2 className="text-lg sm:text-2xl font-black text-gray-900 mb-1.5 sm:mb-2">
          {isEditMode ? 'Order Updated Successfully' : 'Order Created Successfully'}
        </h2>
        <p className="text-gray-500 mb-4 text-xs sm:text-sm font-medium">
          {isEditMode ? 'Order details and changes have been saved.' : 'Order has been saved and ledger balance updated.'}
        </p>

        {/* Assigned Suit IDs List for Writing on Cloth */}
        <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-5 text-left">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200 mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Order Number:</span>
            <span className="font-black text-sm text-[#0F172A]">#BT-{savedOrder.orderNumber}</span>
          </div>
          <p className="text-[10px] font-black text-gray-600 uppercase mb-2">
            Assigned Suit IDs (Tagging on fabric):
          </p>
          <div className="space-y-1.5">
            {savedOrder.suits && savedOrder.suits.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-xs">
                <span className="font-bold text-gray-800 truncate pr-2">
                  Suit #{idx + 1} ({s.serviceType || 'Shalwar Qameez'}{s.fabricDetails ? ` - ${s.fabricDetails}` : ''})
                </span>
                <span className="bg-[#0F172A] text-[#DFAC43] font-mono font-black px-2 py-0.5 rounded text-xs shrink-0 shadow-xs">
                  {s.suitNumber || `BT-${savedOrder.orderNumber}-${idx + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2.5 sm:space-y-3">
          <button 
            onClick={() => navigate(`/print/${savedOrder._id}`)}
            className="w-full bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] font-black h-10 sm:h-11 rounded transition shadow-sm flex justify-center items-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            <FiScissors /> Print Customer Booking Slip
          </button>
          
          <button 
            onClick={() => {
              if (isEditMode) {
                navigate(isWorker ? `/worker/allorders?viewOrderId=${savedOrder._id || editOrderId}` : `/admin/allorders?viewOrderId=${savedOrder._id || editOrderId}`);
              } else {
                navigate(isWorker ? '/worker/dashboard' : '/admin/allorders');
              }
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold h-10 sm:h-11 rounded transition text-xs sm:text-sm cursor-pointer"
          >
            ← {isEditMode ? 'Back to Order View Details' : `Back to ${isWorker ? 'Worker Portal' : 'All Orders'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessScreen;
