import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import defaultLogo from '../assets/BT_Logo.png';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { formatPhone } from '../utils/formatters';
import {
  useGetCustomerProfile,
  useDeleteCustomer,
  useRefundCredit,
  useSetLegacyBalance
} from '../hooks/useCustomers';
import CustomerMeasurementsTab from '../components/CustomerMeasurementsTab';
import CustomerOrdersTab from '../components/CustomerOrdersTab';
import CustomerKhataLedgerTab from '../components/CustomerKhataLedgerTab';
import CustomerEditProfileModal from '../components/CustomerEditProfileModal';
import CustomerMeasurementFormModal from '../components/CustomerMeasurementFormModal';
import CustomerSettleKhataModal from '../components/CustomerSettleKhataModal';
import CustomerStitchingPreferencesModal from '../components/CustomerStitchingPreferencesModal';
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiShoppingBag,
  FiTrendingUp,
  FiCreditCard,
  FiScissors,
  FiClock,
  FiEdit,
  FiPlus,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiBook,
  FiPrinter,
  FiLayers,
  FiCalendar,
  FiCheck,
  FiX,
  FiTrash2,
  FiExternalLink,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiAward
} from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: profileData, isLoading, refetch } = useGetCustomerProfile(id);
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();
  const { data: shopSettings } = useGetShopSettings();
  const shopName = shopSettings?.shopName || 'Balouch Tailors';

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'measurements' | 'orders' | 'khata'
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditPreferencesOpen, setIsEditPreferencesOpen] = useState(false);

  // State for measurement recording modal
  // modalMode: 'new' (fresh blank form) | 'update' (updating an existing category)
  const [measurementModalConfig, setMeasurementModalConfig] = useState(null); // null or { mode: 'new' | 'update', category: '...' }

  const [isSettleKhataModalOpen, setIsSettleKhataModalOpen] = useState(false);
  const [settleOrderId, setSettleOrderId] = useState(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('Cash');
  const [refundNote, setRefundNote] = useState('');
  const [isLegacyModalOpen, setIsLegacyModalOpen] = useState(false);
  const [legacyAmount, setLegacyAmount] = useState('');
  const [legacyReason, setLegacyReason] = useState('');

  const { mutate: refundCredit, isPending: isRefunding } = useRefundCredit();
  const { mutate: setLegacyBalance, isPending: isUpdatingLegacy } = useSetLegacyBalance();

  // State for measurement category viewer
  const [selectedCategory, setSelectedCategory] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white p-6">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#DFAC43] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-bold text-sm tracking-wide">Loading Customer Profile...</p>
      </div>
    );
  }

  if (!profileData?.customer) {
    return (
      <div className="bg-white p-12 text-center max-w-xl mx-auto my-12 rounded border border-gray-200 shadow-sm">
        <FiUser className="text-5xl text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Customer Not Found</h2>
        <p className="text-gray-500 mb-6 text-sm">The requested customer record could not be found or has been deleted.</p>
        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-2 bg-[#0F172A] text-[#DFAC43] hover:bg-[#DFAC43] hover:text-[#0F172A] px-6 py-2.5 rounded font-black text-sm transition"
        >
          <FiArrowLeft /> Back to Customers Directory
        </Link>
      </div>
    );
  }

  const { customer, orders = [], ledger = [] } = profileData;
  const metrics = profileData.metrics || profileData.stats || {};

  // 100% Robust metric calculations (from metrics object or directly aggregated from orders & customer)
  const totalOrdersCount = metrics.totalOrders ?? metrics.totalOrdersCount ?? orders.length ?? 0;

  const totalSpent = metrics.totalSpent !== undefined
    ? Number(metrics.totalSpent)
    : orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const khataBal = Number(metrics.khataBalance ?? customer.khataBalance ?? 0);

  const activeOrdersCount = metrics.activeOrdersCount !== undefined
    ? Number(metrics.activeOrdersCount)
    : orders.filter(o => o.orderStatus !== 'Completed' && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

  const latestOrderStatus = metrics.latestOrderStatus || metrics.latestActiveStatus || (
    orders.find(o => o.orderStatus !== 'Completed' && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled')?.orderStatus || 'No running work'
  );

  let latestMeasurementDate = metrics.latestMeasurementDate;
  if (!latestMeasurementDate && customer.measurements?.length > 0) {
    const dates = customer.measurements.map(m => new Date(m.lastUpdated).getTime()).filter(d => !isNaN(d));
    if (dates.length > 0) {
      latestMeasurementDate = new Date(Math.max(...dates));
    }
  }

  const duesBalance = Number(profileData.account?.duesBalance ?? customer.duesBalance ?? (khataBal > 0 ? khataBal : 0));
  const creditBalance = Number(profileData.account?.creditBalance ?? customer.creditBalance ?? (khataBal < 0 ? Math.abs(khataBal) : 0));
  const netKhata = Number(profileData.account?.khataBalance ?? customer.khataBalance ?? (duesBalance - creditBalance));
  const legacyBalance = Number(profileData.account?.legacyBalance ?? customer.legacyBalance ?? 0);
  const openOrders = profileData.openOrders || [];

  const handleRefundSubmit = (e) => {
    e.preventDefault();
    const num = Number(refundAmount);
    if (!num || num <= 0) return toast.error('Please enter a valid refund amount.');
    refundCredit({
      customerId: customer._id,
      data: {
        amount: num,
        method: refundMethod,
        note: refundNote
      }
    }, {
      onSuccess: () => {
        setIsRefundModalOpen(false);
        setRefundAmount('');
        setRefundNote('');
        refetch();
      }
    });
  };

  const handleLegacySubmit = (e) => {
    e.preventDefault();
    if (legacyAmount === '') return toast.error('Please enter a legacy balance.');
    if (!legacyReason.trim()) return toast.error('A reason is required to adjust legacy balance.');
    setLegacyBalance({
      customerId: customer._id,
      data: {
        legacyBalance: Number(legacyAmount),
        reason: legacyReason
      }
    }, {
      onSuccess: () => {
        setIsLegacyModalOpen(false);
        setLegacyAmount('');
        setLegacyReason('');
        refetch();
      }
    });
  };

  const formattedCustomerId = customer.customerNumber ? `#C-${customer.customerNumber}` : `#C-${customer._id.slice(-4).toUpperCase()}`;

  // Direct WhatsApp chat handler
  const handleOpenWhatsApp = () => {
    const rawNum = customer.whatsapp || customer.phone;
    if (!rawNum) {
      toast.warning('No phone or WhatsApp number available.');
      return;
    }
    const cleanPhone = rawNum.toString().replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone;

    const text = `Assalam-o-Alaikum ${customer.name} Sahab,\nThis message is from *${shopName}*.\n\nYour Customer ID: *${formattedCustomerId}*`;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDeleteProfile = () => {
    deleteCustomer(customer._id, {
      onSuccess: () => {
        navigate('/admin/customers');
      }
    });
  };

  return (
    <div className="bg-white min-h-[90vh] p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">

      {/* 1. TOP NAVIGATION & BREADCRUMB */}
      <div className="flex flex-wrap justify-between items-center gap-3 pb-2 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/admin/customers')}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition flex items-center gap-1.5 text-xs font-bold"
          >
            <FiArrowLeft className="text-base" /> Customers Directory
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Profile</span>
          <span className="bg-black text-[#DFAC43] text-xs font-black px-2.5 py-0.5 rounded">
            {formattedCustomerId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* <button
            onClick={() => refetch()}
            title="Refresh Data"
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded border border-gray-200 transition text-sm"
          >
            <FiRefreshCw />
          </button> */}
          <button
            onClick={handleDeleteProfile}
            disabled={isDeleting}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white rounded text-xs font-bold transition flex items-center gap-1 border border-red-200"
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>

      {/* 2. TOP EXECUTIVE INFORMATION CARD */}
      <div className="bg-gradient-to-br from-white to-gray-50/70 border border-gray-200 rounded p-4 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 sm:gap-6">

          {/* Avatar & Contact Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full lg:w-auto">
            {customer.profileImage?.url ? (
              <img
                src={customer.profileImage.url}
                alt={customer.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#DFAC43] shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0F172A] text-[#DFAC43] flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md shrink-0 border-2 border-[#DFAC43]/40">
                {customer.name?.[0]?.toUpperCase() || 'C'}
              </div>
            )}

            <div className="space-y-1.5 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight break-words">{customer.name}</h1>
                <span className="bg-black text-[#DFAC43] text-xs font-black px-2.5 py-1 rounded">
                  {formattedCustomerId}
                </span>
                {customer.city && (
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded flex items-center gap-1">
                    <FiMapPin className="text-gray-400 text-xs shrink-0" />
                    <span>{customer.city}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-600 font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <FiPhone className="text-[#DFAC43] shrink-0" />
                  <span className="font-semibold text-gray-900">{formatPhone(customer.phone)}</span>
                </div>

                {customer.whatsapp && (
                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex items-center gap-1.5 text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-0.5 rounded font-bold transition border border-green-200"
                    title="Send WhatsApp Message"
                  >
                    <FaWhatsapp className="text-green-600 text-sm" />
                    <span>{customer.whatsapp}</span>
                    <FiExternalLink className="text-[10px]" />
                  </button>
                )}

                {customer.cnic && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">CNIC:</span>
                    <span className="font-semibold">{customer.cnic}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-0.5">
                <FiMapPin className="text-gray-400 shrink-0" />
                <span className="break-words">{customer.address || 'No street address recorded'}</span>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex-1 sm:flex-none justify-center px-3.5 sm:px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded transition flex items-center gap-2 border border-gray-200 whitespace-nowrap"
            >
              <FiEdit /> Edit Profile
            </button>
            <button
              onClick={() => setMeasurementModalConfig({ mode: 'new' })}
              className="flex-1 sm:flex-none justify-center px-3.5 sm:px-4 py-2.5 bg-amber-50 hover:bg-[#DFAC43] text-[#0F172A] hover:text-black font-black text-xs rounded transition flex items-center gap-2 border border-amber-200 shadow-sm whitespace-nowrap"
            >
              <FiScissors /> Record Measurement
            </button>
            <button
              onClick={() => navigate(`/admin/orders/create?customerId=${customer._id}`)}
              className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black text-xs rounded transition flex items-center gap-2 shadow-md whitespace-nowrap"
            >
              <FiPlus className="text-base" /> New Order
            </button>
          </div>

        </div>
      </div>

      {/* 3. 5 HIGHLIGHT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">

        {/* Metric 1: Total Orders Count */}
        <div className="bg-white border border-gray-200 rounded p-4 sm:p-5 shadow-sm hover:border-[#DFAC43] transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Total Orders</span>
            <div className="w-8 h-8 rounded bg-gray-100 text-gray-800 flex items-center justify-center text-base">
              <FiShoppingBag />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{totalOrdersCount}</p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Lifetime Orders Placed</p>
        </div>

        {/* Metric 2: Total Spent */}
        <div className="bg-white border border-gray-200 rounded p-4 sm:p-5 shadow-sm hover:border-[#DFAC43] transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Total Spent</span>
            <div className="w-8 h-8 rounded bg-amber-50 text-[#DFAC43] flex items-center justify-center text-base">
              <FiTrendingUp />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 font-sans">
            Rs {totalSpent.toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Sum of all customer bills</p>
        </div>

        {/* Metric 3: Total Outstanding Dues */}
        <div className={`border rounded p-4 sm:p-5 shadow-sm transition ${duesBalance > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Total Dues</span>
            <div className={`w-8 h-8 rounded flex items-center justify-center text-base ${duesBalance > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
              <FiCreditCard />
            </div>
          </div>
          <p className={`text-2xl font-black font-sans ${duesBalance > 0 ? 'text-red-700' : 'text-gray-900'}`}>
            Rs {duesBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Unpaid balance on orders</p>
        </div>

        {/* Metric 4: Available Advance Credit */}
        <div className={`border rounded p-4 sm:p-5 shadow-sm transition ${creditBalance > 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Advance Credit</span>
            <div className={`w-8 h-8 rounded flex items-center justify-center text-base ${creditBalance > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
              <FiCheckCircle />
            </div>
          </div>
          <p className={`text-2xl font-black font-sans ${creditBalance > 0 ? 'text-emerald-700' : 'text-gray-900'}`}>
            Rs {creditBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Prepaid balance available</p>
        </div>

        {/* Metric 5: Net Khata Balance */}
        <div className={`border rounded p-4 sm:p-5 shadow-sm transition ${netKhata > 0 ? 'bg-amber-50/50 border-amber-300' : netKhata < 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Net Khata</span>
            <div className={`w-8 h-8 rounded flex items-center justify-center text-base ${netKhata > 0 ? 'bg-amber-100 text-amber-800' : netKhata < 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
              <FiClock />
            </div>
          </div>
          <p className={`text-2xl font-black font-sans ${netKhata > 0 ? 'text-amber-800' : netKhata < 0 ? 'text-emerald-700' : 'text-gray-900'}`}>
            Rs {Math.abs(netKhata).toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            {netKhata > 0 ? 'Receivable (Udhar)' : netKhata < 0 ? 'Customer Credit' : 'Nill (Balanced)'}
          </p>
        </div>

      </div>

      {/* 4. TAB HEADERS (EQUAL SIZE GRID ON MOBILE & DESKTOP) */}
      <div className="border-b border-gray-200 pb-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: FiUser },
            { id: 'measurements', label: `Measurements (${customer.measurements?.length || 0})`, icon: FiScissors },
            { id: 'orders', label: `Orders (${orders.length})`, icon: FiShoppingBag },
            { id: 'khata', label: 'Payments', icon: FiBook },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 sm:py-3 px-2 sm:px-4 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border transition cursor-pointer text-center ${
                  isActive
                    ? 'border-[#DFAC43] text-[#0F172A] bg-amber-50 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <Icon className={`text-sm shrink-0 ${isActive ? 'text-[#DFAC43]' : 'text-gray-400'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. TAB CONTENT PANELS */}
      <div className="space-y-4 sm:space-y-6">

        {/* ============================================================ */}
        {/* TAB 1: PURE PROFILE OVERVIEW */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white border border-gray-200 rounded p-6 sm:p-8 shadow-sm space-y-6">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <FiUser className="text-[#DFAC43]" /> Customer Profile Dossier
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Complete registered contact information and identity details.</p>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] text-xs font-black rounded transition flex items-center gap-1.5 shadow"
                >
                  <FiEdit /> Edit Information
                </button>
              </div>

              {/* Grid of Profile Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

                <div className="space-y-4">
                  <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Full Legal Name</span>
                    <p className="text-base font-black text-gray-900">{customer.name}</p>
                  </div>

                  <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">System Customer ID</span>
                    <p className="text-base font-black text-gray-900 font-sans">{formattedCustomerId}</p>
                  </div>

                  <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Primary Mobile Contact</span>
                    <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <FiPhone className="text-gray-500 text-sm" />
                      <span>{formatPhone(customer.phone)}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">WhatsApp Number</span>
                    <p className="text-base font-bold text-gray-900">
                      {customer.whatsapp ? (
                        <button
                          onClick={handleOpenWhatsApp}
                          className="text-green-700 font-bold flex items-center gap-1.5 hover:underline"
                        >
                          <FaWhatsapp className="text-green-600 text-base" />
                          <span>{customer.whatsapp}</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 font-normal italic text-sm">Not specified</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">City / Region</span>
                    <p className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                      <FiMapPin className="text-gray-400 text-sm" />
                      <span>{customer.city || 'Not specified'}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">CNIC / ID Card</span>
                    <p className="text-base font-bold text-gray-900">{customer.cnic || 'Not specified'}</p>
                  </div>

                  <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Street / Delivery Address</span>
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">{customer.address || 'No street address provided'}</p>
                  </div>

                  <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Registration Date</span>
                    <p className="text-base font-bold text-gray-700 flex items-center gap-1.5">
                      <FiCalendar className="text-gray-400 text-sm" />
                      <span>{new Date(customer.createdAt).toLocaleDateString()} ({new Date(customer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* STITCHING & STYLE PREFERENCES DOSSIER */}
            <div className="bg-white border border-gray-200 rounded p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <FiSliders className="text-[#DFAC43]" /> Permanent Stitching Preferences
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Default tailoring style and personal preferences recorded for this customer.</p>
                </div>
                <button
                  onClick={() => setIsEditPreferencesOpen(true)}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] text-xs font-black rounded transition flex items-center gap-1.5 shadow whitespace-nowrap"
                >
                  <FiEdit /> Edit Preferences
                </button>
              </div>

              {/* Preferences Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">

                {/* Collar / Bain */}
                <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Collar / Bain</span>
                  <p className="text-sm font-black text-gray-900">
                    {customer.stitchingPreferences?.collar || <span className="text-gray-400 font-normal italic">Default / Standard</span>}
                  </p>
                </div>

                {/* Sleeves / Bazu */}
                <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Sleeves</span>
                  <p className="text-sm font-black text-gray-900">
                    {customer.stitchingPreferences?.sleeves || <span className="text-gray-400 font-normal italic">Default / Standard</span>}
                  </p>
                </div>

                {/* Daman */}
                <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Daman</span>
                  <p className="text-sm font-black text-gray-900">
                    {customer.stitchingPreferences?.daman || <span className="text-gray-400 font-normal italic">Default / Standard</span>}
                  </p>
                </div>

                {/* Front Pocket */}
                <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Front Pocket</span>
                  <p className="text-sm font-black text-gray-900">
                    {customer.stitchingPreferences?.frontPocket || <span className="text-gray-400 font-normal italic">Default / Standard</span>}
                  </p>
                </div>

                {/* Side Pockets */}
                <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Side Pockets </span>
                  <p className="text-sm font-black text-gray-900">
                    {customer.stitchingPreferences?.sidePockets || <span className="text-gray-400 font-normal italic">Default / Standard</span>}
                  </p>
                </div>

                {/* Shalwar Pocket */}
                <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Shalwar Pocket </span>
                  <p className="text-sm font-black text-gray-900">
                    {customer.stitchingPreferences?.shalwarPocket || <span className="text-gray-400 font-normal italic">Default / Standard</span>}
                  </p>
                </div>

                {/* Button Patti */}
                <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Patti / Buttons </span>
                  <p className="text-sm font-black text-gray-900">
                    {customer.stitchingPreferences?.patti || <span className="text-gray-400 font-normal italic">Default / Standard</span>}
                  </p>
                </div>

                {/* Stitching Style */}
                <div className="p-4 rounded bg-gray-50 border border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Stitching Style </span>
                  <p className="text-sm font-black text-gray-900">
                    {customer.stitchingPreferences?.stitchingStyle || <span className="text-gray-400 font-normal italic">Default / Standard</span>}
                  </p>
                </div>

                {/* Other / Custom Preference */}
                <div className="p-4 rounded bg-amber-50/60 border border-amber-200 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-900 block tracking-wider">Other / Custom</span>
                  <p className="text-sm font-black text-gray-900">
                    {customer.stitchingPreferences?.otherPreferences || <span className="text-gray-400 font-normal italic">None</span>}
                  </p>
                </div>

              </div>

              {/* Special Fitting Notes */}
              {customer.stitchingPreferences?.customNotes && (
                <div className="p-4 rounded bg-gray-50 border border-gray-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Special Fitting / Tailor Notes</span>
                  <p className="text-xs font-medium text-gray-800 leading-relaxed">{customer.stitchingPreferences.customNotes}</p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MEASUREMENTS */}
        {/* ============================================================ */}
        {activeTab === 'measurements' && (
          <CustomerMeasurementsTab
            customer={customer}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            openRecordModal={() => setMeasurementModalConfig({ mode: 'new' })}
            openUpdateModal={(catName) => setMeasurementModalConfig({ mode: 'update', category: catName })}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 3: ORDERS HISTORY */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (
          <CustomerOrdersTab
            orders={orders}
            customer={customer}
            newOrderUrl={`/admin/orders/create?customerId=${customer._id}`}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 4: KHATA LEDGER & STATEMENTS */}
        {/* ============================================================ */}
        {activeTab === 'khata' && (
          <CustomerKhataLedgerTab
            customer={customer}
            ledger={ledger}
            khataBalance={netKhata}
            duesBalance={duesBalance}
            creditBalance={creditBalance}
            legacyBalance={legacyBalance}
            openOrders={openOrders}
            openSettleModal={(orderId = null) => {
              setSettleOrderId(orderId);
              setIsSettleKhataModalOpen(true);
            }}
            openRefundModal={() => setIsRefundModalOpen(true)}
            openLegacyModal={() => {
              setLegacyAmount(String(legacyBalance));
              setIsLegacyModalOpen(true);
            }}
          />
        )}

      </div>

      {/* 6. MODALS */}
      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <CustomerEditProfileModal
          customer={customer}
          closeModal={() => setIsEditProfileOpen(false)}
        />
      )}

      {/* Edit Stitching Preferences Modal */}
      {isEditPreferencesOpen && (
        <CustomerStitchingPreferencesModal
          customer={customer}
          closeModal={() => setIsEditPreferencesOpen(false)}
        />
      )}

      {/* Record / Update Measurements Modal */}
      {measurementModalConfig && (
        <CustomerMeasurementFormModal
          customer={customer}
          config={measurementModalConfig}
          closeModal={() => setMeasurementModalConfig(null)}
        />
      )}

      {/* Settle Khata Modal */}
      {isSettleKhataModalOpen && (
        <CustomerSettleKhataModal
          customer={customer}
          initialOrderId={settleOrderId}
          closeModal={() => {
            setIsSettleKhataModalOpen(false);
            setSettleOrderId(null);
            refetch();
          }}
        />
      )}

      {/* Refund Credit Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white rounded shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-black text-sm text-gray-900">Refund Advance Credit</h3>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-gray-400 hover:text-black">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleRefundSubmit} className="space-y-3 text-xs">
              <p className="text-gray-600">
                Available credit: <strong className="text-emerald-700">Rs {creditBalance.toLocaleString()}</strong>
              </p>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Refund Amount (Rs) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={creditBalance}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`Max ${creditBalance}`}
                  className="w-full h-9 px-3 border border-gray-300 rounded font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Method</label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full h-9 px-3 border border-gray-300 rounded font-bold bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  placeholder="e.g. Returned to customer"
                  className="w-full h-9 px-3 border border-gray-300 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRefunding}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded disabled:opacity-50"
                >
                  {isRefunding ? 'Refunding...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Legacy Opening Balance Modal */}
      {isLegacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white rounded shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-black text-sm text-gray-900">Adjust Legacy Opening Balance</h3>
              <button onClick={() => setIsLegacyModalOpen(false)} className="text-gray-400 hover:text-black">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleLegacySubmit} className="space-y-3 text-xs">
              <p className="text-gray-500 text-[11px]">
                Pre-system opening khata balance. Changes are audited.
              </p>
              <div>
                <label className="block text-gray-700 font-bold mb-1">New Legacy Balance (Rs) *</label>
                <input
                  type="number"
                  required
                  value={legacyAmount}
                  onChange={(e) => setLegacyAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-9 px-3 border border-gray-300 rounded font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Reason for Adjustment *</label>
                <input
                  type="text"
                  required
                  value={legacyReason}
                  onChange={(e) => setLegacyReason(e.target.value)}
                  placeholder="e.g. Correcting paper khata discrepancy"
                  className="w-full h-9 px-3 border border-gray-300 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsLegacyModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingLegacy}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-bold rounded disabled:opacity-50"
                >
                  {isUpdatingLegacy ? 'Saving...' : 'Update Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerProfile;
