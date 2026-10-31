import React from 'react';
import { FiUser, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { formatPhone } from '../utils/formatters';

const OrderCustomerSection = ({
  customers,
  loadingCustomers,
  customerId,
  setCustomerId,
  selectedCustomer,
  customerKhataBal,
  adjustKhata,
  setAdjustKhata
}) => {
  return (
    <div className="bg-white p-3.5 sm:p-5 rounded border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
        <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
          <span className="w-5 h-5 rounded bg-amber-100 text-[#DFAC43] flex items-center justify-center text-xs">
            <FiUser />
          </span>
          1. Customer Information
        </h3>
        {selectedCustomer && (
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            ID: {selectedCustomer._id.slice(-6)}
          </span>
        )}
      </div>

      {loadingCustomers ? (
        <div className="text-xs text-gray-500 font-bold py-2">Loading customer list...</div>
      ) : (
        <select 
          required
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-semibold text-gray-800 bg-white outline-none transition"
        >
          <option value="">-- Select Customer --</option>
          {customers.map(c => {
            const bal = Number(c.khataBalance) || 0;
            const balBadge = bal > 0 ? ` [Due: Rs ${bal}]` : bal < 0 ? ` [Credit: Rs ${Math.abs(bal)}]` : '';
            return (
              <option key={c._id} value={c._id}>
                {c.name} - {formatPhone(c.phone)}{balBadge}
              </option>
            );
          })}
        </select>
      )}

      {/* Khata Adjustment Alert Banner */}
      {selectedCustomer && customerKhataBal !== 0 && (
        <div className={`mt-3 p-2.5 sm:p-3 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
          customerKhataBal > 0 
            ? 'bg-red-50 border-red-200 text-red-900' 
            : 'bg-green-50 border-green-200 text-green-900'
        }`}>
          <div className="flex items-start sm:items-center gap-2">
            {customerKhataBal > 0 ? (
              <FiAlertCircle className="text-base text-red-600 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <FiCheckCircle className="text-base text-green-600 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                {customerKhataBal > 0 ? 'Outstanding Ledger Due' : 'Advance Credit Balance'}
              </span>
              <p className="text-xs sm:text-sm font-bold">
                {customerKhataBal > 0 
                  ? `Rs ${customerKhataBal.toLocaleString()} pending from previous orders` 
                  : `Rs ${Math.abs(customerKhataBal).toLocaleString()} advance credit available`}
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold cursor-pointer bg-white px-2.5 sm:px-3 py-1.5 rounded border border-gray-200 shadow-sm shrink-0 self-start sm:self-auto">
            <input 
              type="checkbox" 
              checked={adjustKhata} 
              onChange={(e) => setAdjustKhata(e.target.checked)}
              className="w-4 h-4 text-black rounded accent-[#DFAC43] cursor-pointer"
            />
            <span>
              {customerKhataBal > 0 ? 'Add to Bill (+)' : 'Deduct from Bill (-)'}
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default OrderCustomerSection;
