import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetOrders, useDeliverOrder } from '../hooks/useOrder';
import { useGetShopSettings } from '../hooks/useShopSettings';
import { 
  FiCreditCard, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock, 
  FiPrinter, 
  FiSearch, 
  FiFilter, 
  FiPhone, 
  FiArrowRight,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import Preloader from '../components/Preloader';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;

const AdminPayments = () => {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetOrders();
  const { mutate: deliverOrder, isPending: isDelivering } = useDeliverOrder();
  const { data: shopSettings } = useGetShopSettings();
  const shopName = shopSettings?.shopName || 'Balouch Tailors';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'partial' | 'paid' | 'unpaid'
  const [currentPage, setCurrentPage] = useState(1);
  const [settleModalOrder, setSettleModalOrder] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Preloader />
      </div>
    );
  }

  // --- FINANCIAL CALCULATIONS ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let todayCollection = 0;
  let totalOutstandingBalance = 0;
  let partialPaidCount = 0;
  let partialPaidBalance = 0;
  let fullyPaidCount = 0;
  let unpaidCount = 0;

  orders.forEach(ord => {
    const total = Number(ord.totalAmount) || 0;
    const advance = Number(ord.advancePaid) || 0;
    const balance = Number(ord.balanceAmount) || 0;

    // Check if booked or paid today
    const bookingDate = new Date(ord.bookingDate || ord.createdAt);
    bookingDate.setHours(0, 0, 0, 0);
    if (bookingDate.getTime() === today.getTime()) {
      todayCollection += advance;
    }

    if (balance > 0) {
      totalOutstandingBalance += balance;
      if (advance > 0) {
        partialPaidCount++;
        partialPaidBalance += balance;
      } else {
        unpaidCount++;
      }
    } else {
      fullyPaidCount++;
    }
  });

  // Filter Orders List
  const filteredOrders = orders.filter(ord => {
    const total = Number(ord.totalAmount) || 0;
    const advance = Number(ord.advancePaid) || 0;
    const balance = Number(ord.balanceAmount) || 0;

    const isPaid = balance === 0;
    const isPartial = balance > 0 && advance > 0;
    const isUnpaid = balance > 0 && advance === 0;

    if (statusFilter === 'paid' && !isPaid) return false;
    if (statusFilter === 'partial' && !isPartial) return false;
    if (statusFilter === 'unpaid' && !isUnpaid) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const orderNum = (ord.orderNumber || '').toString().toLowerCase();
      const custName = (ord.customer?.name || '').toLowerCase();
      const custPhone = (ord.customer?.phone || '').toLowerCase();
      return orderNum.includes(q) || custName.includes(q) || custPhone.includes(q);
    }

    return true;
  }).sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));

  // Quick Settle Handler
  const handleOpenSettle = (order) => {
    setSettleModalOrder(order);
    setSettleAmount(order.balanceAmount || '');
  };

  const handleConfirmSettle = (e) => {
    e.preventDefault();
    if (!settleModalOrder) return;

    deliverOrder({
      id: settleModalOrder._id,
      data: {
        paymentReceived: Number(settleAmount) || 0,
        addRemainingToKhata: true
      }
    }, {
      onSuccess: () => {
        setSettleModalOrder(null);
      }
    });
  };

  // WhatsApp quick action
  const handleOpenWhatsApp = (customer) => {
    const rawNum = customer?.whatsapp || customer?.phone;
    if (!rawNum) return;
    const cleanPhone = rawNum.toString().replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone;
    const text = `Assalam-o-Alaikum ${customer.name || ''},\nThis is an update regarding your order payment from *${shopName}*.`;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* 1. EXECUTIVE HEADER */}
      <section className="bg-[#0F172A] text-white rounded p-5 md:p-7 border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DFAC43] animate-pulse"></span>
              <span className="text-xs text-gray-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <FiCreditCard className="text-[#DFAC43]" /> Order Payments & Invoices Ledger
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl font-medium">
              Track invoice payments, today's cash collections, partially paid orders, and outstanding customer balances.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/orders/create')}
              className="bg-[#DFAC43] hover:bg-white text-[#0F172A] font-black px-4 py-2.5 rounded-xl text-xs transition shadow-md whitespace-nowrap"
            >
              + Create New Order
            </button>
          </div>
        </div>
      </section>

      {/* 2. SUMMARY KPI CARDS (5 CARDS) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Today's Collection */}
        <div className="bg-white p-4 rounded border border-gray-200 shadow-xs space-y-1 hover:border-[#DFAC43] transition">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Today's Cash</span>
            <span className="p-1.5 bg-green-50 text-green-700 rounded-lg text-xs"><FaMoneyBillWave /></span>
          </div>
          <p className="text-xl font-black text-[#0F172A] font-sans">Rs {todayCollection.toLocaleString()}</p>
          <span className="text-[10px] text-green-700 font-bold block">Cash Collected Today</span>
        </div>

        {/* Card 2: Partially Paid Orders */}
        <div className="bg-white p-4 rounded border border-gray-200 shadow-xs space-y-1 hover:border-amber-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">Partially Paid</span>
            <span className="p-1.5 bg-amber-50 text-amber-900 rounded-lg text-xs"><FiClock /></span>
          </div>
          <p className="text-xl font-black text-[#DFAC43] font-sans">
            {partialPaidCount} <span className="text-xs text-gray-500 font-bold">orders</span>
          </p>
          <span className="text-[10px] text-gray-500 font-bold block">Rs {partialPaidBalance.toLocaleString()} remaining</span>
        </div>

        {/* Card 3: Total Outstanding Balance (Udhar) */}
        <div className="bg-[#0F172A] text-white p-4 rounded border border-gray-800 shadow-xs space-y-1 hover:border-[#DFAC43] transition">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-wider">Outstanding Udhar</span>
            <span className="p-1.5 bg-[#DFAC43]/10 text-[#DFAC43] rounded-lg text-xs"><FiAlertCircle /></span>
          </div>
          <p className="text-xl font-black text-[#DFAC43] font-sans">Rs {totalOutstandingBalance.toLocaleString()}</p>
          <span className="text-[10px] text-gray-400 font-medium block">Total Receivables</span>
        </div>

        {/* Card 4: Fully Paid Orders */}
        <div className="bg-white p-4 rounded border border-gray-200 shadow-xs space-y-1 hover:border-green-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Paid Orders</span>
            <span className="p-1.5 bg-green-50 text-green-700 rounded-lg text-xs"><FiCheckCircle /></span>
          </div>
          <p className="text-xl font-black text-green-700 font-sans">{fullyPaidCount}</p>
          <span className="text-[10px] text-gray-500 font-bold block">Zero Balance Due</span>
        </div>

        {/* Card 5: Unpaid Orders (Zero Advance) */}
        <div className="bg-white p-4 rounded border border-gray-200 shadow-xs space-y-1 hover:border-red-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Unpaid Orders</span>
            <span className="p-1.5 bg-red-50 text-red-700 rounded-lg text-xs"><FiAlertCircle /></span>
          </div>
          <p className="text-xl font-black text-red-600 font-sans">{unpaidCount}</p>
          <span className="text-[10px] text-gray-500 font-bold block">Full Payment Pending</span>
        </div>

      </section>

      {/* 3. SEARCH, FILTERS & TABLE */}
      <section className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden p-5 sm:p-6 space-y-4">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 pb-3 border-b border-gray-100">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by Invoice #BT-..., Customer Name or Phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 focus:border-[#DFAC43] rounded text-xs font-medium outline-none transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1 rounded border border-gray-200 text-xs font-bold">
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded transition ${
                statusFilter === 'all' 
                  ? 'bg-[#0F172A] text-[#DFAC43] font-black shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('partial');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded transition ${
                statusFilter === 'partial' 
                  ? 'bg-[#0F172A] text-[#DFAC43] font-black shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Partial ({partialPaidCount})
            </button>
            <button
              onClick={() => {
                setStatusFilter('paid');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded transition ${
                statusFilter === 'paid' 
                  ? 'bg-[#0F172A] text-[#DFAC43] font-black shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Paid ({fullyPaidCount})
            </button>
            <button
              onClick={() => {
                setStatusFilter('unpaid');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded transition ${
                statusFilter === 'unpaid' 
                  ? 'bg-[#0F172A] text-[#DFAC43] font-black shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unpaid ({unpaidCount})
            </button>
          </div>

        </div>

        {/* Invoices Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded p-6">
            <FiCreditCard className="text-3xl text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 text-xs font-bold">No orders found matching the filter.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 w-28">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Booking Date</th>
                    <th className="py-3 px-4 text-right">Total Bill</th>
                    <th className="py-3 px-4 text-right">Advance Paid</th>
                    <th className="py-3 px-4 text-right">Remaining Balance</th>
                    <th className="py-3 px-4 text-center">Payment Status</th>
                    <th className="py-3 px-4 text-center w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  {filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((ord) => {
                    const total = Number(ord.totalAmount) || 0;
                    const advance = Number(ord.advancePaid) || 0;
                    const balance = Number(ord.balanceAmount) || 0;
                    const isPaid = balance === 0;
                    const isPartial = balance > 0 && advance > 0;
                    const isUnpaid = balance > 0 && advance === 0;

                    return (
                      <tr key={ord._id} className="hover:bg-gray-50/80 transition">
                        
                        {/* Invoice # */}
                        <td className="py-3 px-4 font-black text-[#0F172A]">
                          #BT-{ord.orderNumber}
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <span className="font-bold text-gray-900 block">
                                {ord.customer?.name || 'Customer'}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {ord.customer?.phone || '-'}
                              </span>
                            </div>
                            {ord.customer?.phone && (
                              <button
                                onClick={() => handleOpenWhatsApp(ord.customer)}
                                title="Chat on WhatsApp"
                                className="p-1 text-green-600 hover:text-green-700 bg-green-50 rounded transition"
                              >
                                <FiPhone className="text-xs" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Booking Date */}
                        <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                          {new Date(ord.bookingDate || ord.createdAt).toLocaleDateString()}
                        </td>

                        {/* Total Bill */}
                        <td className="py-3 px-4 text-right font-black font-sans text-gray-900">
                          Rs {total.toLocaleString()}
                        </td>

                        {/* Advance Paid */}
                        <td className="py-3 px-4 text-right font-bold font-sans text-green-700">
                          Rs {advance.toLocaleString()}
                        </td>

                        {/* Remaining Balance */}
                        <td className="py-3 px-4 text-right font-black font-sans">
                          {balance > 0 ? (
                            <span className="text-red-700">Rs {balance.toLocaleString()}</span>
                          ) : (
                            <span className="text-green-700 font-bold">Rs 0</span>
                          )}
                        </td>

                        {/* Payment Status Badge */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            isPaid 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : isPartial 
                              ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {isPaid ? 'Fully Paid' : isPartial ? 'Partially Paid' : 'Unpaid'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => navigate(`/admin/print/${ord._id}`)}
                              title="Print Order Slip"
                              className="p-1.5 bg-gray-100 hover:bg-[#0F172A] text-gray-700 hover:text-[#DFAC43] rounded transition"
                            >
                              <FiPrinter className="text-xs" />
                            </button>

                            {balance > 0 && (
                              <button
                                onClick={() => handleOpenSettle(ord)}
                                title="Settle / Receive Payment"
                                className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] px-2 py-1 rounded text-[10px] font-black transition whitespace-nowrap shadow-xs"
                              >
                                Settle
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredOrders.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

      </section>

      {/* Settle Payment Modal */}
      {settleModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <FiCreditCard className="text-[#DFAC43]" /> Settle Payment (#BT-{settleModalOrder.orderNumber})
              </h2>
              <button 
                onClick={() => setSettleModalOrder(null)}
                className="text-gray-400 hover:text-black p-1 rounded hover:bg-gray-200 transition"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettle} className="p-5 sm:p-6 space-y-4">
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Customer:</span>
                  <span className="font-black text-gray-900">{settleModalOrder.customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Total Bill:</span>
                  <span className="font-sans font-bold">Rs {Number(settleModalOrder.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Outstanding Balance:</span>
                  <span className="font-sans font-black text-red-700 text-sm">Rs {Number(settleModalOrder.balanceAmount).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  Payment Amount Received (Rs) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">PKR</span>
                  <input
                    type="number"
                    required
                    min="1"
                    max={settleModalOrder.balanceAmount}
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-[#DFAC43] rounded-xl pl-14 pr-3 py-2.5 outline-none text-base font-black text-black transition"
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-medium block mt-1">
                  Receiving this will mark the order settled & deliverable.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSettleModalOrder(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDelivering}
                  className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] px-5 py-2 rounded-xl font-black text-xs transition shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  <FiCheck /> {isDelivering ? 'Saving...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPayments;
