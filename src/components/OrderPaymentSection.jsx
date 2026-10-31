import React from 'react';
import { FiCreditCard, FiCalendar, FiPercent, FiX, FiSave } from 'react-icons/fi';

const OrderPaymentSection = ({
  bookingDate,
  setBookingDate,
  deliveryDate,
  setDeliveryDate,
  discountPercent,
  setDiscountPercent,
  discountAmount,
  rawSubtotal,
  khataAdjustment,
  totalAmount,
  advancePaid,
  setAdvancePaid,
  isEditMode,
  orderStatus,
  setOrderStatus,
  isPending
}) => {
  return (
    <div className="bg-[#0F172A] text-white p-3.5 sm:p-5 rounded border border-gray-800 space-y-4 sm:space-y-5 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <h3 className="text-xs sm:text-sm font-bold text-[#DFAC43] uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
          <FiCreditCard /> 4. Delivery & Payment Settlement
        </h3>
        <span className="text-[10px] font-bold text-gray-400">Final Step</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        
        {/* Delivery Date & Discount Inputs */}
        <div className="space-y-3 sm:space-y-4">
          {/* Booking Date & Delivery Due Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Booking Date */}
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">
                Booking Date (بکنگ کی تاریخ) *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  required 
                  type="date" 
                  value={bookingDate} 
                  onChange={(e) => setBookingDate(e.target.value)} 
                  className="w-full h-10 pl-9 pr-3 bg-gray-900 border border-gray-700 focus:border-[#DFAC43] text-white rounded outline-none font-medium text-xs sm:text-sm cursor-pointer" 
                />
              </div>
            </div>

            {/* Delivery Due Date */}
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">
                Delivery Due Date (ڈیلیوری کی تاریخ) *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  required 
                  type="date" 
                  value={deliveryDate} 
                  onChange={(e) => setDeliveryDate(e.target.value)} 
                  className="w-full h-10 pl-9 pr-3 bg-gray-900 border border-gray-700 focus:border-[#DFAC43] text-white rounded outline-none font-medium text-xs sm:text-sm cursor-pointer" 
                />
              </div>
            </div>
          </div>

          {/* Discount Percentage Section */}
          <div className="bg-gray-900/90 p-2.5 sm:p-3 rounded border border-gray-800 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                <FiPercent className="text-[#DFAC43]" /> Special Discount (%)
              </label>
              {discountPercent && Number(discountPercent) > 0 && (
                <span className="text-[11px] font-bold text-green-400">
                  - Rs {discountAmount.toLocaleString()} Saved
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-xs">%</span>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0" 
                  value={discountPercent} 
                  onChange={(e) => setDiscountPercent(e.target.value)} 
                  className="w-full h-10 pl-3 pr-7 bg-black border border-gray-700 focus:border-[#DFAC43] text-white rounded outline-none font-bold text-xs sm:text-sm" 
                />
              </div>

              {/* Quick Discount Presets */}
              <div className="flex items-center gap-1">
                {[5, 10, 15, 20].map(pct => (
                  <button
                    type="button"
                    key={pct}
                    onClick={() => setDiscountPercent(pct.toString())}
                    className={`flex-1 sm:flex-initial text-[11px] h-10 px-2 sm:px-2.5 rounded font-bold transition-all ${
                      discountPercent === pct.toString()
                        ? 'bg-[#DFAC43] text-[#0F172A]'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
                {discountPercent && (
                  <button
                    type="button"
                    onClick={() => setDiscountPercent('')}
                    className="text-[11px] h-10 px-2.5 rounded bg-gray-800 text-red-400 hover:bg-gray-700 font-bold"
                    title="Clear Discount"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Totals Breakdown Card */}
        <div className="bg-gray-900/90 p-3 sm:p-4 rounded border border-gray-800 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-gray-400">
            <span>Gross Subtotal:</span>
            <span className="text-gray-200 font-bold font-sans">Rs {rawSubtotal.toLocaleString()}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-green-400">
              <span>Discount ({discountPercent}%):</span>
              <span className="font-bold font-sans">- Rs {discountAmount.toLocaleString()}</span>
            </div>
          )}

          {khataAdjustment.type === 'added_due' && (
            <div className="flex justify-between items-center text-red-400">
              <span>+ Previous Due Added:</span>
              <span className="font-bold font-sans">+ Rs {khataAdjustment.amount.toLocaleString()}</span>
            </div>
          )}

          {khataAdjustment.type === 'deducted_advance' && (
            <div className="flex justify-between items-center text-green-400">
              <span>- Advance Credit Deducted:</span>
              <span className="font-bold font-sans">- Rs {khataAdjustment.amount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-gray-800">
            <span className="text-white font-black uppercase tracking-wider text-xs sm:text-sm">Net Total Bill:</span>
            <span className="text-xl sm:text-2xl font-black text-[#DFAC43] font-sans">
              Rs {totalAmount.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center gap-2 pt-2">
            <span className="text-gray-300 font-bold text-xs whitespace-nowrap">Advance Paid:</span>
            <input 
              type="number" 
              min="0" 
              placeholder="0" 
              value={advancePaid} 
              onChange={(e) => setAdvancePaid(e.target.value)} 
              onWheel={(e) => e.target.blur()} 
              className="w-28 sm:w-36 h-10 px-3 bg-black border border-gray-700 focus:border-[#DFAC43] text-white rounded outline-none font-bold text-right text-xs sm:text-sm" 
            />
          </div>

          {/* Order Status Selector (When in Edit Mode) */}
          {isEditMode && (
            <div className="flex justify-between items-center gap-2 pt-2 border-t border-gray-800">
              <span className="text-white font-bold text-xs">Order Status:</span>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="h-9 px-2 bg-black border border-gray-700 focus:border-[#DFAC43] text-[#DFAC43] rounded outline-none font-bold text-xs cursor-pointer"
              >
                <option value="Booked">Booked</option>
                <option value="Cutting">Cutting</option>
                <option value="Stitching">Stitching</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Save & Generate Invoice Submit Button */}
      <div className="pt-1 sm:pt-2">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full h-11 bg-[#DFAC43] hover:bg-white text-[#0F172A] rounded font-black transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 text-xs sm:text-base cursor-pointer"
        >
          <FiSave /> {isPending ? (isEditMode ? 'Updating Order...' : 'Saving Order...') : (isEditMode ? 'Update Order Details' : 'Save & Generate Invoice')}
        </button>
      </div>
    </div>
  );
};

export default OrderPaymentSection;
