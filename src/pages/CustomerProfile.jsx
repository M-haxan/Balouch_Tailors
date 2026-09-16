import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useGetCustomerProfile,
  useUpdateCustomer,
  useUpdateMeasurements,
  useDeleteMeasurementCategory,
  useSettleCustomerKhata,
  useDeleteCustomer
} from '../hooks/useCustomers';
import { useGetTemplates } from '../hooks/useTemplates';
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
  FiDollarSign,
  FiPrinter,
  FiLayers,
  FiCalendar,
  FiCheck,
  FiX,
  FiTrash2,
  FiExternalLink,
  FiRefreshCw,
  FiSearch,
  FiSliders
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: profileData, isLoading, refetch } = useGetCustomerProfile(id);
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'measurements' | 'orders' | 'khata'
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditPreferencesOpen, setIsEditPreferencesOpen] = useState(false);

  // State for measurement recording modal
  // modalMode: 'new' (fresh blank form) | 'update' (updating an existing category)
  const [measurementModalConfig, setMeasurementModalConfig] = useState(null); // null or { mode: 'new' | 'update', category: '...' }

  const [isSettleKhataModalOpen, setIsSettleKhataModalOpen] = useState(false);

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
      <div className="bg-white p-12 text-center max-w-xl mx-auto my-12 rounded-2xl border border-gray-200 shadow-sm">
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

    const text = `Assalam-o-Alaikum ${customer.name} Sahab,\nThis message is from *Balouch Tailors*.\n\nYour Customer ID: *${formattedCustomerId}*`;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDeleteProfile = () => {
    if (window.confirm(`Are you sure you want to permanently delete customer "${customer.name}"? This will remove their profile and records.`)) {
      deleteCustomer(customer._id, {
        onSuccess: () => {
          navigate('/admin/customers');
        }
      });
    }
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
                  <span className="font-semibold text-gray-900">{customer.phone}</span>
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

        {/* Metric 3: Outstanding Khata Balance */}
        <div className={`border rounded p-4 sm:p-5 shadow-sm transition ${khataBal > 0
            ? 'bg-red-50/50 border-red-200'
            : khataBal < 0
              ? 'bg-green-50/50 border-green-200'
              : 'bg-white border-gray-200'
          }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Khata Balance</span>
            <div className={`w-8 h-8 rounded flex items-center justify-center text-base ${khataBal > 0 ? 'bg-red-100 text-red-600' : khataBal < 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
              <FiCreditCard />
            </div>
          </div>
          <p className={`text-2xl font-black font-sans ${khataBal > 0 ? 'text-red-700' : khataBal < 0 ? 'text-green-700' : 'text-gray-900'
            }`}>
            Rs {Math.abs(khataBal).toLocaleString()}
          </p>
          <div className="mt-1">
            {khataBal > 0 ? (
              <span className="text-[10px] font-black uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                <FiAlertCircle className="text-red-600 text-xs" /> Udhar (Receivable)
              </span>
            ) : khataBal < 0 ? (
              <span className="text-[10px] font-black uppercase bg-green-100 text-green-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                <FiCheckCircle className="text-green-600 text-xs" /> Advance Credit
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded inline-flex items-center gap-1">
                <FiCheck className="text-gray-500 text-xs" /> Clear (Rs 0)
              </span>
            )}
          </div>
        </div>

        {/* Metric 4: Latest Measurement Date */}
        <div className="bg-white border border-gray-200 rounded p-4 sm:p-5 shadow-sm hover:border-[#DFAC43] transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Measurements</span>
            <div className="w-8 h-8 rounded bg-amber-50 text-black flex items-center justify-center text-base">
              <FiScissors />
            </div>
          </div>
          <p className="text-base font-black text-gray-900 truncate">
            {latestMeasurementDate ? new Date(latestMeasurementDate).toLocaleDateString() : 'No Sizes'}
          </p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            {customer.measurements?.length ? `${customer.measurements.length} category saved` : 'Needs sizing'}
          </p>
        </div>

        {/* Metric 5: Active Orders & Status */}
        <div className="bg-white border border-gray-200 rounded p-4 sm:p-5 shadow-sm hover:border-[#DFAC43] transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Active Orders</span>
            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-base">
              <FiClock />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {activeOrdersCount}
          </p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            {latestOrderStatus}
          </p>
        </div>

      </div>

      {/* 4. TAB HEADERS */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2 sm:gap-6 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Profile Overview', icon: FiUser },
            { id: 'measurements', label: `Measurements (${customer.measurements?.length || 0})`, icon: FiScissors },
            { id: 'orders', label: `Orders History (${orders.length})`, icon: FiShoppingBag },
            { id: 'khata', label: 'Payments', icon: FiBook },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-3.5 px-3 sm:px-4 font-black text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${isActive
                    ? 'border-[#DFAC43] text-[#0F172A] bg-amber-50/40 rounded-t'
                    : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                  }`}
              >
                <Icon className={isActive ? 'text-[#DFAC43]' : 'text-gray-400'} />
                {tab.label}
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
                      <span>{customer.phone}</span>
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
          <MeasurementsTab
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
          <OrdersTab
            orders={orders}
            customer={customer}
            newOrderUrl={`/admin/orders/create?customerId=${customer._id}`}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 4: KHATA LEDGER & STATEMENTS */}
        {/* ============================================================ */}
        {activeTab === 'khata' && (
          <KhataLedgerTab
            customer={customer}
            ledger={ledger}
            khataBalance={khataBal}
            openSettleModal={() => setIsSettleKhataModalOpen(true)}
          />
        )}

      </div>

      {/* 6. MODALS */}
      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <EditProfileModal
          customer={customer}
          closeModal={() => setIsEditProfileOpen(false)}
        />
      )}

      {/* Edit Stitching Preferences Modal */}
      {isEditPreferencesOpen && (
        <StitchingPreferencesModal
          customer={customer}
          closeModal={() => setIsEditPreferencesOpen(false)}
        />
      )}

      {/* Record / Update Measurements Modal */}
      {measurementModalConfig && (
        <MeasurementFormModal
          customer={customer}
          config={measurementModalConfig}
          closeModal={() => setMeasurementModalConfig(null)}
        />
      )}

      {/* Settle Khata Modal */}
      {isSettleKhataModalOpen && (
        <SettleKhataModal
          customer={customer}
          closeModal={() => setIsSettleKhataModalOpen(false)}
        />
      )}

    </div>
  );
};

// ====================================================================
// ====================================================================
// SUB-COMPONENT: MEASUREMENTS TAB (TABLE FORMAT)
// ====================================================================
const MeasurementsTab = ({
  customer,
  selectedCategory,
  setSelectedCategory,
  openRecordModal,
  openUpdateModal
}) => {
  const { mutate: deleteMeasurementCategory, isPending: isDeletingMeasurement } = useDeleteMeasurementCategory();
  const measurements = customer.measurements || [];

  // Set default category if not selected
  const activeCategory = selectedCategory || (measurements.length > 0 ? measurements[0].category : '');
  const currentMeas = measurements.find(m => m.category && m.category.toLowerCase() === activeCategory.toLowerCase());

  const handleDeleteCategory = (catName) => {
    if (window.confirm(`Are you sure you want to delete measurements for "${catName}"? This cannot be undone.`)) {
      deleteMeasurementCategory({ id: customer._id, category: catName }, {
        onSuccess: () => {
          setSelectedCategory('');
        }
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">

      {/* Category Selection Bar & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-gray-900">Custom Size Profiles</h3>
          <p className="text-xs text-gray-500 mt-0.5">Customer tailored measurement parameters and fitting details.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {measurements.map(m => (
            <button
              key={m.category}
              onClick={() => setSelectedCategory(m.category)}
              className={`px-3 sm:px-4 py-2 rounded text-xs font-black transition ${activeCategory.toLowerCase() === m.category.toLowerCase()
                  ? 'bg-[#0F172A] text-[#DFAC43] shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
            >
              {m.category}
            </button>
          ))}
          <button
            onClick={openRecordModal}
            className="px-3.5 sm:px-4 py-2 bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] font-black text-xs rounded transition flex items-center gap-1.5 shadow-sm ml-auto sm:ml-2 whitespace-nowrap"
          >
            <FiPlus /> Record New Size
          </button>
        </div>
      </div>

      {!currentMeas ? (
        <div className="text-center py-12 sm:py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded p-4">
          <FiScissors className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-bold text-sm">No measurements recorded for this customer yet.</p>
          <button
            onClick={openRecordModal}
            className="mt-4 px-6 py-2.5 bg-[#0F172A] text-[#DFAC43] rounded font-black text-xs hover:bg-[#DFAC43] hover:text-[#0F172A] transition"
          >
            + Add First Measurement
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">

          {/* Active Category Header, Delete & Update Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 p-3.5 sm:p-4 rounded border border-gray-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Garment Category</span>
              <h4 className="text-base sm:text-lg font-black text-gray-900">{currentMeas.category}</h4>
              {currentMeas.lastUpdated && (
                <p className="text-[11px] text-gray-500 font-medium">
                  Last updated: {new Date(currentMeas.lastUpdated).toLocaleDateString()} at {new Date(currentMeas.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleDeleteCategory(currentMeas.category)}
                disabled={isDeletingMeasurement}
                className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold rounded border border-red-200 transition flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                title="Delete this measurement category"
              >
                <FiTrash2 /> {isDeletingMeasurement ? 'Deleting...' : 'Delete Size'}
              </button>
              <button
                onClick={() => openUpdateModal(currentMeas.category)}
                className="flex-1 sm:flex-none justify-center px-4 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] text-xs font-black rounded border border-gray-200 transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <FiEdit /> Update Size
              </button>
            </div>
          </div>

          {/* Measurements Table View */}
          <div className="border border-gray-200 rounded overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs min-w-[320px]">
              <thead>
                <tr className="bg-[#0F172A] text-[#DFAC43] font-black uppercase text-[10px]">
                  <th className="p-3.5 w-16 text-center">#</th>
                  <th className="p-3.5">Measurement Parameter (ناپ / تفصیل)</th>
                  <th className="p-3.5 text-right pr-6">Size Value (Inches)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.keys(currentMeas.data || {}).map((field, idx) => (
                  <tr key={field} className="hover:bg-gray-50 transition">
                    <td className="p-3.5 text-center text-gray-400 font-bold">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-gray-800 uppercase tracking-wide">
                      {field}
                    </td>
                    <td className="p-3.5 text-right pr-6 font-black text-gray-900 text-sm font-sans">
                      {currentMeas.data[field] || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Custom Notes / Fitting Instructions */}
          {currentMeas.notes && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded">
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block mb-1">Special Fitting Notes / Instructions</span>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">{currentMeas.notes}</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

// ====================================================================
// SUB-COMPONENT: ORDERS TAB
// ====================================================================
const OrdersTab = ({ orders = [], customer, newOrderUrl }) => {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'all') return true;
    return (o.orderStatus || '').toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="bg-white border border-gray-200 rounded p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">

      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-gray-900">Orders & Stitching History</h3>
          <p className="text-xs text-gray-500 mt-0.5">Complete record of suits, invoices, and delivery statuses.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 sm:flex-none border border-gray-200 focus:border-black rounded px-3 py-2 text-xs font-bold outline-none bg-white"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="pending">Pending</option>
            <option value="cutting">In Cutting</option>
            <option value="stitching">In Stitching</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>

          <Link
            to={newOrderUrl}
            className="flex-1 sm:flex-none justify-center px-4 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black text-xs rounded transition flex items-center gap-1.5 shadow whitespace-nowrap"
          >
            <FiPlus /> + New Order
          </Link>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded p-4">
          <FiShoppingBag className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-bold text-sm">No orders matching selected filter.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-[#0F172A] text-[#DFAC43] font-black uppercase text-[10px]">
                <th className="p-3.5 rounded-l">Order #</th>
                <th className="p-3.5">Booking Date</th>
                <th className="p-3.5">Delivery Date</th>
                <th className="p-3.5">Suits & Fabric</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Total Bill</th>
                <th className="p-3.5 text-right">Advance</th>
                <th className="p-3.5 text-right">Balance</th>
                <th className="p-3.5 rounded-r text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const bal = Number(order.balanceAmount) || 0;
                return (
                  <tr key={order._id} className="hover:bg-gray-50/80 transition">
                    <td className="p-3.5 font-black text-gray-900">
                      <span className="bg-gray-100 px-2 py-1 rounded font-sans whitespace-nowrap">
                        #BT-{order.orderNumber}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500 font-medium whitespace-nowrap">
                      {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-gray-800 font-bold whitespace-nowrap">
                      {order.deliveryDate ? (
                        <span className="flex items-center gap-1 text-gray-900">
                          <FiCalendar className="text-[#DFAC43]" /> {new Date(order.deliveryDate).toLocaleDateString()}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-3.5 text-gray-600 max-w-xs truncate">
                      {order.suits?.length || 0} suits
                      {order.suits?.[0]?.fabricDetails && ` (${order.suits[0].fabricDetails})`}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'Ready' ? 'bg-amber-100 text-amber-900' :
                            'bg-blue-50 text-blue-800'
                        }`}>
                        {order.orderStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-gray-900 font-sans whitespace-nowrap">
                      Rs {order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-medium text-green-600 font-sans whitespace-nowrap">
                      Rs {(order.advancePaid || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-black font-sans whitespace-nowrap">
                      <span className={bal > 0 ? 'text-red-600' : 'text-gray-600'}>
                        Rs {bal.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/print/${order._id}`}
                        className="inline-flex items-center gap-1 bg-gray-100 hover:bg-[#0F172A] hover:text-[#DFAC43] text-gray-800 px-3 py-1.5 rounded text-xs font-bold transition border border-gray-200"
                        title="Print / View Invoice"
                      >
                        <FiPrinter /> Print
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

// ====================================================================
// SUB-COMPONENT: KHATA LEDGER TAB
// ====================================================================
const KhataLedgerTab = ({ customer, ledger = [], khataBalance = 0, openSettleModal }) => {

  const handleShareWhatsAppStatement = () => {
    const rawNum = customer.whatsapp || customer.phone;
    if (!rawNum) {
      toast.warning('No contact number available.');
      return;
    }
    const cleanPhone = rawNum.toString().replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone;

    let balanceText = '';
    if (khataBalance > 0) {
      balanceText = `*Baqiya Udhar (Payable):* Rs ${khataBalance.toLocaleString()}`;
    } else if (khataBalance < 0) {
      balanceText = `*Jama Advance (Credit):* Rs ${Math.abs(khataBalance).toLocaleString()}`;
    } else {
      balanceText = `*Status:* Khata Clear (Rs 0)`;
    }

    const message = `*BALOUCH TAILORS - KHATA STATEMENT*\n` +
      `Mohtaram *${customer.name}* Sahab (ID: #C-${customer.customerNumber || customer._id.slice(-4)}),\n\n` +
      `${balanceText}\n\n` +
      `Date: ${new Date().toLocaleDateString()}\n` +
      `Shukriya!\n*Balouch Tailors*`;

    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">

      {/* Running Balance Banner */}
      <div className={`p-4 sm:p-6 rounded border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${khataBalance > 0
          ? 'bg-red-50/70 border-red-200 text-red-900'
          : khataBalance < 0
            ? 'bg-green-50/70 border-green-200 text-green-900'
            : 'bg-gray-50 border-gray-200 text-gray-800'
        }`}>
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider block opacity-75">
            Current Account Balance
          </span>
          <p className="text-2xl sm:text-3xl font-black font-sans mt-1">
            {khataBalance > 0 ? (
              <span className="text-red-700 inline-flex items-center gap-1.5">
                <FiAlertCircle className="text-red-600 text-xl" /> Customer Owes: Rs {khataBalance.toLocaleString()} (Udhar)
              </span>
            ) : khataBalance < 0 ? (
              <span className="text-green-700 inline-flex items-center gap-1.5">
                <FiCheckCircle className="text-green-600 text-xl" /> Customer Credit: Rs {Math.abs(khataBalance).toLocaleString()} (Advance Jama)
              </span>
            ) : (
              <span className="text-gray-700 inline-flex items-center gap-1.5">
                <FiCheck className="text-gray-500 text-xl" /> Clear Balance (Rs 0)
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleShareWhatsAppStatement}
            className="flex-1 sm:flex-none justify-center bg-green-600 hover:bg-green-700 text-white text-xs font-black px-4 py-2.5 rounded transition flex items-center gap-1.5 shadow whitespace-nowrap"
          >
            <FaWhatsapp className="text-base" /> Send WhatsApp Statement
          </button>
          <button
            onClick={openSettleModal}
            className="flex-1 sm:flex-none justify-center bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] text-xs font-black px-4 py-2.5 rounded transition flex items-center gap-1.5 shadow whitespace-nowrap"
          >
            Settle / Post Entry
          </button>
        </div>
      </div>

      {/* Transaction Statement Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-gray-800">
          Account Transaction History ({ledger.length} entries)
        </h3>

        {ledger.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded text-xs text-gray-400">
            No khata transactions or settlements recorded yet for this customer.
          </div>
        ) : (
          <div className="border border-gray-200 rounded overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Description & Reference</th>
                  <th className="p-3.5 text-right">Debit (+)</th>
                  <th className="p-3.5 text-right">Credit (-)</th>
                  <th className="p-3.5 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ledger.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50/80 transition font-medium">
                    <td className="p-3.5 text-gray-500 whitespace-nowrap">
                      {new Date(entry.date || entry.createdAt).toLocaleDateString()} {new Date(entry.date || entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800">
                      {entry.description}
                      {entry.orderNumber && (
                        <span className="ml-2 bg-[#0F172A] text-[#DFAC43] px-2 py-0.5 rounded text-[10px] font-black whitespace-nowrap">
                          #BT-{entry.orderNumber}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-black text-red-600 font-sans whitespace-nowrap">
                      {entry.type === 'debit' ? `+ Rs ${entry.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-3.5 text-right font-black text-green-600 font-sans whitespace-nowrap">
                      {entry.type === 'credit' || entry.type === 'payment' ? `- Rs ${entry.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-3.5 text-right font-black font-sans whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded text-xs ${entry.runningBalance > 0 ? 'text-red-700 bg-red-50' :
                          entry.runningBalance < 0 ? 'text-green-700 bg-green-50' :
                            'text-gray-700 bg-gray-100'
                        }`}>
                        Rs {entry.runningBalance.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

// ====================================================================
// MODAL: EDIT CUSTOMER PROFILE
// ====================================================================
const EditProfileModal = ({ customer, closeModal }) => {
  const { mutate: updateCustomer, isPending } = useUpdateCustomer();

  const [formData, setFormData] = useState({
    name: customer.name || '',
    phone: customer.phone || '',
    whatsapp: customer.whatsapp || '',
    city: customer.city || '',
    cnic: customer.cnic || '',
    address: customer.address || '',
  });

  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('whatsapp', formData.whatsapp);
    data.append('city', formData.city);
    data.append('cnic', formData.cnic);
    data.append('address', formData.address);
    if (imageFile) {
      data.append('profileImage', imageFile);
    }

    updateCustomer({ id: customer._id, data }, {
      onSuccess: () => closeModal()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 animate-fade-in">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-black text-gray-900">Edit Customer Information</h2>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black rounded">
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">WhatsApp Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 03001234567"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">City / Town</label>
              <input
                type="text"
                placeholder="e.g. Quetta, Karachi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">CNIC (Optional)</label>
              <input
                type="text"
                placeholder="xxxxx-xxxxxxx-x"
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Update Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full border-2 border-gray-200 rounded p-1 text-xs outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Street Address</label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-medium outline-none"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black rounded text-xs transition shadow"
            >
              {isPending ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ====================================================================
// MODAL: MEASUREMENT RECORD & UPDATE
// ====================================================================
const MeasurementFormModal = ({ customer, config, closeModal }) => {
  const { data: templates = [] } = useGetTemplates();
  const { mutate: updateMeasurements, isPending } = useUpdateMeasurements();

  const [categoriesList, setCategoriesList] = useState(() => {
    if (config?.mode === 'update' && config?.category) {
      const existing = (customer.measurements || []).find(
        m => m.category && m.category.toLowerCase() === config.category.toLowerCase()
      );
      if (existing) {
        return [{ category: existing.category, data: { ...(existing.data || {}) }, notes: existing.notes || '' }];
      }
    }
    return [];
  });

  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleAddCategory = () => {
    if (!selectedTemplate) {
      toast.warning("Pehle koi template select karein.");
      return;
    }

    if (categoriesList.some(c => c.category.toLowerCase() === selectedTemplate.toLowerCase())) {
      toast.warning("Yeh category form mein pehle se shamil hai!");
      return;
    }

    const tpl = templates.find(t => t.categoryname === selectedTemplate);
    const emptyData = {};
    if (tpl?.fields) {
      tpl.fields.forEach(field => { emptyData[field] = ''; });
    }

    setCategoriesList([...categoriesList, { category: selectedTemplate, data: emptyData, notes: '' }]);
    setSelectedTemplate('');
  };

  const handleRemoveCategory = (indexToRemove) => {
    setCategoriesList(categoriesList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFieldChange = (catIndex, field, value) => {
    const copy = [...categoriesList];
    copy[catIndex].data[field] = value;
    setCategoriesList(copy);
  };

  const handleNotesChange = (catIndex, value) => {
    const copy = [...categoriesList];
    copy[catIndex].notes = value;
    setCategoriesList(copy);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (categoriesList.length === 0) {
      toast.warning("Kam az kam ek measurement category add karein.");
      return;
    }

    // Prepare payload
    updateMeasurements({
      id: customer._id,
      data: { measurements: categoriesList }
    }, {
      onSuccess: () => {
        closeModal();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 animate-fade-in">

        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              {config?.mode === 'update' ? `Update Size: ${config.category}` : `Record New Size (${customer.name})`}
            </h2>
            <p className="text-xs text-gray-500">
              {config?.mode === 'update'
                ? 'Sizes updated here will automatically archive the previous size into history.'
                : 'Select garment templates to record fresh measurements for this client.'}
            </p>
          </div>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black rounded">
            <FiX className="text-lg" />
          </button>
        </div>

        <form id="measForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Garment Template Selector Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-amber-50/70 p-4 rounded border border-amber-200">
            <span className="text-xs font-black text-amber-900 uppercase">Select Garment Category:</span>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="border border-gray-300 focus:border-black rounded px-3 py-2 text-xs font-bold outline-none bg-white min-w-[200px]"
            >
              <option value="">-- Choose Template --</option>
              {templates.map(t => (
                <option key={t._id} value={t.categoryname}>{t.categoryname}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] text-xs font-black rounded transition shadow-sm"
            >
              + Add to Form
            </button>
          </div>

          {categoriesList.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded bg-gray-50/50 space-y-2">
              <FiScissors className="text-3xl text-gray-300 mx-auto" />
              <p className="text-gray-500 text-xs font-bold">No garment category added in this form yet.</p>
              <p className="text-gray-400 text-[11px]">Select a garment template from above dropdown and click "Add to Form".</p>
            </div>
          ) : (
            <div className="space-y-6">
              {categoriesList.map((meas, catIndex) => (
                <div key={catIndex} className="bg-gray-50 border border-gray-200 p-5 rounded space-y-4 relative group">

                  {/* Category Header with Prominent Remove / Close Button */}
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FiScissors className="text-[#DFAC43]" />
                      <h4 className="font-black text-sm text-gray-900 uppercase tracking-wide">{meas.category}</h4>
                    </div>

                    {/* CLOSE / REMOVE CATEGORY BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(catIndex)}
                      className="text-red-500 hover:text-white hover:bg-red-600 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 border border-red-200"
                      title="Remove this category"
                    >
                      <FiTrash2 className="text-xs" /> Remove
                    </button>
                  </div>

                  {/* Measurement Inputs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Object.keys(meas.data || {}).map((field) => (
                      <div key={field}>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{field}</label>
                        <input
                          type="text"
                          value={meas.data[field] || ''}
                          onChange={(e) => handleFieldChange(catIndex, field, e.target.value)}
                          placeholder="e.g. 40"
                          className="w-full bg-white border border-gray-300 focus:border-black rounded px-2.5 py-1.5 text-xs font-bold outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Notes / Special Instructions */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Fitting Instructions / Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 inch loose fitting, round collar"
                      value={meas.notes || ''}
                      onChange={(e) => handleNotesChange(catIndex, e.target.value)}
                      className="w-full bg-white border border-gray-300 focus:border-black rounded px-2.5 py-1.5 text-xs outline-none font-medium"
                    />
                  </div>

                </div>
              ))}
            </div>
          )}

        </form>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded text-xs transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="measForm"
            disabled={isPending || categoriesList.length === 0}
            className="px-6 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black rounded text-xs transition shadow disabled:opacity-50"
          >
            {isPending ? 'Saving Size...' : 'Save & Archive Size'}
          </button>
        </div>

      </div>
    </div>
  );
};

// ====================================================================
// MODAL: SETTLE KHATA / CASH TRANSACTION
// ====================================================================
const SettleKhataModal = ({ customer, closeModal }) => {
  const { mutate: settleKhata, isPending } = useSettleCustomerKhata();

  const [form, setForm] = useState({
    type: 'payment',
    amount: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    settleKhata({
      customerId: customer._id,
      data: {
        type: form.type,
        amount: Number(form.amount),
        description: form.description || (form.type === 'payment' ? 'Counter Cash Received' : 'Khata Settlement')
      }
    }, {
      onSuccess: () => closeModal()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-fade-in">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-900 text-white">
          <div className="flex items-center gap-2">
            <FiDollarSign className="text-[#DFAC43] text-lg" />
            <h2 className="text-base font-black">Khata Settlement ({customer.name})</h2>
          </div>
          <button onClick={closeModal} className="text-gray-400 hover:text-white"><FiX className="text-lg" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Transaction Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
            >
              <option value="payment">Payment Received (کیش وصولی)</option>
              <option value="refund">Refund Given (رقم واپسی)</option>
              <option value="debit">Add Manual Debt (ادھار شامل کریں)</option>
              <option value="credit">Add Manual Credit (رعایت / جمع)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (Rs) *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 1500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description / Notes</label>
            <input
              type="text"
              placeholder="e.g. Cash received at shop counter"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-medium outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black rounded text-xs transition shadow"
            >
              {isPending ? 'Posting...' : 'Post Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ====================================================================
// MODAL: EDIT PERMANENT STITCHING PREFERENCES
// ====================================================================
const StitchingPreferencesModal = ({ customer, closeModal }) => {
  const { mutate: updateCustomer, isPending } = useUpdateCustomer();

  const [form, setForm] = useState({
    collar: customer.stitchingPreferences?.collar || '',
    sleeves: customer.stitchingPreferences?.sleeves || '',
    daman: customer.stitchingPreferences?.daman || '',
    frontPocket: customer.stitchingPreferences?.frontPocket || '',
    sidePockets: customer.stitchingPreferences?.sidePockets || '',
    shalwarPocket: customer.stitchingPreferences?.shalwarPocket || '',
    patti: customer.stitchingPreferences?.patti || '',
    stitchingStyle: customer.stitchingPreferences?.stitchingStyle || '',
    otherPreferences: customer.stitchingPreferences?.otherPreferences || '',
    customNotes: customer.stitchingPreferences?.customNotes || '',
  });

  const PRESETS = [
    {
      key: 'collar',
      label: 'Collar / Bain',
      options: ['Half Bain', 'Full Bain', 'Shirt Collar', 'Cut Bain', 'Gol Gala / No Collar']
    },
    {
      key: 'sleeves',
      label: 'Sleeves ',
      options: ['Gol Bazu', 'Single Cuff', 'Double Cuff', 'Gol Kaf', 'Chor Kaf']
    },
    {
      key: 'daman',
      label: 'Daman ',
      options: ['Gol Daman', 'Choras Daman']
    },
    {
      key: 'frontPocket',
      label: 'Front Pocket ',
      options: ['1 Front Pocket', '2 Front Pockets', 'No Front Pocket']
    },
    {
      key: 'sidePockets',
      label: 'Side Pockets ',
      options: ['1 Side Pocket (Right)', '2 Side Pockets', '1 Side Pocket (Left)', 'No Side Pocket']
    },
    {
      key: 'shalwarPocket',
      label: 'Shalwar Pocket ',
      options: ['1 Shalwar Pocket',  'No Shalwar Pocket']
    },
    {
      key: 'patti',
      label: 'Button Patti ',
      options: ['small Patti','Half Patti',]
    },
    {
      key: 'stitchingStyle',
      label: 'Stitching Style ',
      options: ['Single Silai', 'Double Silai']
    }
  ];

  const handleSelectOption = (key, val) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key] === val ? '' : val
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const tags = [
      form.collar,
      form.sleeves,
      form.daman,
      form.frontPocket,
      form.sidePockets,
      form.shalwarPocket,
      form.patti,
      form.stitchingStyle,
      form.otherPreferences
    ].filter(Boolean);

    const payload = {
      ...form,
      tags
    };

    updateCustomer({
      id: customer._id,
      data: { stitchingPreferences: payload }
    }, {
      onSuccess: () => {
        closeModal();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 animate-fade-in">

        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <FiSliders className="text-[#DFAC43]" /> Permanent Stitching Preferences
            </h2>
            <p className="text-xs text-gray-500">Set default tailor options, pockets, sleeves & personal habits for {customer.name}.</p>
          </div>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black rounded">
            <FiX className="text-lg" />
          </button>
        </div>

        <form id="prefForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">

          {PRESETS.map((group) => (
            <div key={group.key} className="space-y-2 bg-gray-50/70 p-3.5 rounded border border-gray-100">
              <label className="block font-black text-gray-700 uppercase tracking-wider text-[11px]">
                {group.label}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {group.options.map((opt) => {
                  const isSelected = form[group.key] === opt;
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handleSelectOption(group.key, opt)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition border ${isSelected
                          ? 'bg-[#0F172A] text-[#DFAC43] border-[#0F172A] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Other / Custom Preference Input */}
          <div className="space-y-1.5 bg-amber-50/50 p-4 rounded border border-amber-200">
            <label className="block font-black text-amber-900 uppercase tracking-wider text-[11px]">
              Other / Custom Preferences
            </label>
            <input
              type="text"
              placeholder="e.g. Mobile pocket deep banayein, Collar button loose, Pant style shalwar"
              value={form.otherPreferences}
              onChange={(e) => setForm({ ...form, otherPreferences: e.target.value })}
              className="w-full bg-white border border-amber-300 focus:border-black rounded p-2.5 text-xs font-bold outline-none"
            />
            <p className="text-[10px] text-amber-700">Type any additional habit or custom preference not listed above.</p>
          </div>

          {/* Special Fitting Notes */}
          <div className="space-y-1.5">
            <label className="block font-black text-gray-700 uppercase tracking-wider text-[11px]">
              Special Fitting / Tailor Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Always double check shoulder fall, customer prefers light press"
              value={form.customNotes}
              onChange={(e) => setForm({ ...form, customNotes: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-black rounded p-2.5 text-xs font-medium outline-none"
            ></textarea>
          </div>

        </form>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded text-xs transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="prefForm"
            disabled={isPending}
            className="px-6 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black rounded text-xs transition shadow"
          >
            {isPending ? 'Saving Preferences...' : 'Save Preferences'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerProfile;
