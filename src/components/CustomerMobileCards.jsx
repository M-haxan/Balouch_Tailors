import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiMapPin, 
  FiArrowRight, 
  FiPlus 
} from 'react-icons/fi';
import { formatPhone } from '../utils/formatters';

const CustomerMobileCards = ({ customers = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="block md:hidden space-y-3">
      {customers.map((customer) => {
        const bal = Number(customer.khataBalance) || 0;
        const formattedId = customer.customerNumber 
          ? `#C-${customer.customerNumber}` 
          : `#C-${customer._id.slice(-4).toUpperCase()}`;

        return (
          <div 
            key={customer._id} 
            className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3.5 sm:p-4 space-y-3 transition hover:border-gray-300"
          >
            {/* Top Header: ID & Khata Status */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
              <span className="bg-gray-100 border border-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-md font-sans font-black">
                {formattedId}
              </span>
              
              {bal > 0 ? (
                <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-900 px-2.5 py-0.5 rounded-md text-[11px] font-black">
                  <FiAlertTriangle className="text-xs text-red-600" /> Udhar: Rs {bal.toLocaleString()}
                </span>
              ) : bal < 0 ? (
                <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-900 px-2.5 py-0.5 rounded-md text-[11px] font-black">
                  <FiCheckCircle className="text-xs text-green-700" /> Credit: Rs {Math.abs(bal).toLocaleString()}
                </span>
              ) : (
                <span className="inline-flex items-center bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[11px] font-bold">
                  Settled (Rs 0)
                </span>
              )}
            </div>

            {/* Customer Info: Avatar, Name, Phone & Address */}
            <div className="flex items-start gap-3">
              {customer.profileImage?.url ? (
                <img
                  src={customer.profileImage.url} 
                  alt={customer.name} 
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0" 
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-[#DFAC43] flex items-center justify-center text-sm font-black uppercase shrink-0">
                  {customer.name?.[0] || 'C'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-gray-900 text-sm truncate">{customer.name}</h3>
                <p className="text-xs text-gray-600 font-semibold font-mono mt-0.5">{formatPhone(customer.phone)}</p>
                {customer.address && (
                  <p className="text-[11px] text-gray-500 truncate mt-0.5 flex items-center gap-1">
                    <FiMapPin className="text-xs shrink-0 text-gray-400" /> {customer.address}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons: View Profile & New Order */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <button 
                onClick={() => navigate(`/admin/customers/${customer._id}`)}
                className="w-full py-2 bg-gray-100 hover:bg-[#0F172A] text-gray-800 hover:text-[#DFAC43] font-bold rounded-lg transition text-xs flex items-center justify-center gap-1.5 border border-gray-200 shadow-2xs cursor-pointer"
              >
                <span>View Profile</span>
                <FiArrowRight className="text-xs" />
              </button>

              <button 
                onClick={() => navigate(`/admin/orders/create?customerId=${customer._id}`)}
                className="w-full py-2 bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] font-black rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer"
              >
                <FiPlus className="text-sm" /> 
                <span>New Order</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerMobileCards;
