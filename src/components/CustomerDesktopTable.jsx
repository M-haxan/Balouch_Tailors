import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiArrowRight, 
  FiPlus 
} from 'react-icons/fi';
import { formatPhone } from '../utils/formatters';

const CustomerDesktopTable = ({ customers = [] }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#0F172A] text-[#DFAC43] text-xs uppercase tracking-wider">
            <th className="p-4">ID</th>
            <th className="p-4">{t('customers.customerName')}</th>
            <th className="p-4">{t('customers.phone')}</th>
            <th className="p-4">{t('customers.balanceDue')}</th>
            <th className="p-4">{t('customers.address')}</th>
            <th className="p-4 text-right">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.map((customer) => {
            const bal = Number(customer.khataBalance) || 0;
            const formattedId = customer.customerNumber 
              ? `#C-${customer.customerNumber}` 
              : `#C-${customer._id.slice(-4).toUpperCase()}`;

            return (
              <tr key={customer._id} className="hover:bg-gray-50 transition text-sm">
                {/* CUSTOMER ID */}
                <td className="p-4 font-black text-gray-900 whitespace-nowrap">
                  <span className="bg-gray-100 border border-gray-200 text-gray-800 text-xs px-2 py-1 rounded-md font-sans">
                    {formattedId}
                  </span>
                </td>

                {/* CLIENT NAME & AVATAR */}
                <td className="p-4 font-bold text-gray-900">
                  <div className="flex items-center gap-3">
                    {customer.profileImage?.url ? (
                      <img
                        src={customer.profileImage.url} 
                        alt={customer.name} 
                        className="w-9 h-9 rounded-full object-cover border border-gray-200" 
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-[#DFAC43] flex items-center justify-center text-xs font-black uppercase">
                        {customer.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-black text-gray-900">{customer.name}</p>
                    </div>
                  </div>
                </td>

                {/* CONTACT & WHATSAPP */}
                <td className="p-4 text-gray-600 font-medium whitespace-nowrap">
                  <div>
                    <p className="font-semibold text-gray-900">{formatPhone(customer.phone)}</p>
                  </div>
                </td>
                
                {/* KHATA BALANCE BADGE */}
                <td className="p-4 whitespace-nowrap">
                  {bal > 0 ? (
                    <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-900 px-2.5 py-1 rounded-md text-xs font-black">
                      <FiAlertTriangle className="text-xs text-red-600" /> {t('customers.balanceDue')}: Rs {bal.toLocaleString()}
                    </span>
                  ) : bal < 0 ? (
                    <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-900 px-2.5 py-1 rounded-md text-xs font-black">
                      <FiCheckCircle className="text-xs text-green-700" /> Credit: Rs {Math.abs(bal).toLocaleString()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold">
                      Settled (Rs 0)
                    </span>
                  )}
                </td>

                <td className="p-4 text-gray-600 text-xs max-w-xs truncate">{customer.address || '-'}</td>
                
                {/* 2 CLEAN ACTION BUTTONS ONLY: VIEW PROFILE & + NEW ORDER */}
                <td className="p-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {/* 1. View Profile Button */}
                    <button 
                      onClick={() => navigate(`/admin/customers/${customer._id}`)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-[#0F172A] text-gray-800 hover:text-[#DFAC43] font-bold rounded-lg transition text-xs flex items-center gap-1 border border-gray-200 shadow-sm cursor-pointer"
                    >
                      {t('customers.viewProfile')} <FiArrowRight className="text-xs rtl:rotate-180" />
                    </button>

                    {/* 2. New Order Button */}
                    <button 
                      onClick={() => navigate(`/admin/orders/create?customerId=${customer._id}`)}
                      className="px-3 py-1.5 bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] font-black rounded-lg transition text-xs flex items-center gap-1 shadow-sm whitespace-nowrap cursor-pointer"
                    >
                      <FiPlus className="text-sm" /> {t('admin.createOrder')}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerDesktopTable;
