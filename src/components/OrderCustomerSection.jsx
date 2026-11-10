import React from 'react';
import { FiUser, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { formatPhone } from '../utils/formatters';
import { useCustomerDues } from '../hooks/useCustomers';
import useAuthStore from '../Store/authStore';

const OrderCustomerSection = ({
  customers,
  loadingCustomers,
  customerId,
  setCustomerId,
  selectedCustomer
}) => {
  const user = useAuthStore((state) => state.user);
  const canSeeDues = Boolean(user?.role === 'admin' || user?.canDeliverOrder);

  const { data: duesData } = useCustomerDues(customerId, {
    enabled: Boolean(customerId && canSeeDues)
  });

  const totalDues = Number(duesData?.totalDues ?? selectedCustomer?.duesBalance ?? (selectedCustomer?.khataBalance > 0 ? selectedCustomer?.khataBalance : 0));
  const openCount = Number(duesData?.openOrdersCount ?? 0);
  const creditBalance = Number(duesData?.creditBalance ?? selectedCustomer?.creditBalance ?? (selectedCustomer?.khataBalance < 0 ? Math.abs(selectedCustomer?.khataBalance) : 0));

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
            const bal = Number(c.duesBalance !== undefined ? (c.duesBalance - (c.creditBalance || 0)) : (c.khataBalance || 0));
            const balBadge = bal > 0 ? ` [Due: Rs ${bal}]` : bal < 0 ? ` [Credit: Rs ${Math.abs(bal)}]` : '';
            return (
              <option key={c._id} value={c._id}>
                {c.name} - {formatPhone(c.phone)}{balBadge}
              </option>
            );
          })}
        </select>
      )}

      {/* Dues and Credit Information Chips (No bill adjustment) */}
      {selectedCustomer && canSeeDues && (totalDues > 0 || creditBalance > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {totalDues > 0 && (
            <div className="flex items-center gap-2 p-2 px-3 rounded border bg-amber-50 border-amber-200 text-amber-900 text-xs font-bold">
              <FiInfo className="text-amber-600 shrink-0" />
              <span>
                Customer has Rs {totalDues.toLocaleString()} open dues {openCount > 0 ? `on ${openCount} previous order${openCount > 1 ? 's' : ''}` : 'in ledger'}
              </span>
            </div>
          )}
          {creditBalance > 0 && (
            <div className="flex items-center gap-2 p-2 px-3 rounded border bg-emerald-50 border-emerald-200 text-emerald-900 text-xs font-bold">
              <FiCheckCircle className="text-emerald-600 shrink-0" />
              <span>Customer has Rs {creditBalance.toLocaleString()} advance credit</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCustomerSection;
