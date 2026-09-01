import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetOrders } from '../hooks/useOrder';
import { useGetWorkers, useGetFinancialSummary } from '../hooks/useWorkers';
import { useGetCustomers } from '../hooks/useCustomers';
import { 
  FiBox, 
  FiDollarSign, 
  FiScissors, 
  FiUsers, 
  FiTrendingUp, 
  FiClock, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiCalendar, 
  FiPlus, 
  FiArrowRight, 
  FiPrinter, 
  FiEye,
  FiShoppingBag,
  FiAward,
  FiCreditCard
} from 'react-icons/fi';
import Preloader from '../components/Preloader';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const { data: orders = [], isLoading: loadingOrders } = useGetOrders();
  const { data: workers = [], isLoading: loadingWorkers } = useGetWorkers();
  const { data: customers = [], isLoading: loadingCustomers } = useGetCustomers();
  const { data: financialData = {}, isLoading: loadingFinancial } = useGetFinancialSummary();

  const isLoading = loadingOrders || loadingWorkers || loadingCustomers || loadingFinancial;

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Preloader />
      </div>
    );
  }

  const {
    totalRevenue = 0,
    totalAdvanceReceived = 0,
    totalBalanceReceivable = 0,
    totalSuitsCount = 0,
    workerExpenses = {},
    ownerLabor = {},
    counts = {},
    netShopBusinessProfit = 0
  } = financialData;

  // Pipeline calculations
  let cuttingPendingCount = 0;
  let stitchingActiveCount = 0;
  let readySuitsCount = 0;

  orders.forEach(ord => {
    ord.suits?.forEach(s => {
      if (s.stitchingStatus === 'Stitched') {
        readySuitsCount++;
      } else if (s.stitchingStatus === 'Assigned') {
        stitchingActiveCount++;
      } else if (s.stitchingStatus === 'Pending') {
        cuttingPendingCount++;
      }
    });
  });

  const activeOrdersCount = orders.filter(o => o.orderStatus !== 'Completed' && o.orderStatus !== 'Cancelled').length;
  const completedOrdersCount = orders.filter(o => o.orderStatus === 'Completed').length;

  // Urgent Orders (Sorted by delivery date)
  const urgentOrders = [...orders]
    .filter(o => o.orderStatus !== 'Completed' && o.orderStatus !== 'Cancelled')
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
    .slice(0, 6);

  return (
    <div className="space-y-8 pb-12 font-sans">
      
      {/* 1. EXECUTIVE WELCOME BANNER & QUICK ACTIONS */}
      <section className="bg-gradient-to-r from-gray-950 via-black to-gray-900 text-white rounded-3xl p-6 md:p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                Shop Executive Control
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Balouch Tailors <span className="text-[#D4AF37]">Command Center</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl font-medium">
              Real-time oversight of tailoring stages, QC approvals, Karigar wages, customer pipeline, and pure business profit.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => navigate('/admin/orders/create')}
              className="bg-[#D4AF37] hover:bg-white text-black font-black px-4 py-2.5 rounded-xl text-xs transition shadow-lg flex items-center gap-1.5"
            >
              <FiPlus className="text-base" /> New Order
            </button>
            <button
              onClick={() => navigate('/admin/allorders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition border flex items-center gap-1.5 ${
                counts.pendingInspectionCount > 0 
                  ? 'bg-amber-400 text-black border-amber-500 shadow-lg animate-pulse' 
                  : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
              }`}
            >
              <FiClock className="text-sm" /> 
              QC Approvals ({counts.pendingInspectionCount || 0})
            </button>
            <button
              onClick={() => navigate('/admin/customers')}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold px-4 py-2.5 rounded-xl text-xs transition border border-gray-700 flex items-center gap-1.5"
            >
              <FiUsers className="text-sm" /> Customers
            </button>
            <button
              onClick={() => navigate('/admin/workers')}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold px-4 py-2.5 rounded-xl text-xs transition border border-gray-700 flex items-center gap-1.5"
            >
              <FiScissors className="text-sm" /> Workers
            </button>
          </div>
        </div>
      </section>

      {/* 2. CORE FINANCIAL & PROFIT MATRIX (4 PRIMARY CARDS) */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider flex items-center gap-2">
            <FiDollarSign className="text-[#D4AF37]" /> Financial & Profit Summary
          </h2>
          <span className="text-xs text-gray-400 font-bold">Live Auto-Calculated</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Gross Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Shop Revenue</span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl text-sm"><FiCreditCard /></span>
            </div>
            <div>
              <p className="text-2xl font-black text-black font-sans">Rs {totalRevenue.toLocaleString()}</p>
              <div className="flex justify-between text-[11px] font-bold text-gray-500 mt-2 pt-2 border-t border-gray-100">
                <span className="text-green-600">Recv: Rs {totalAdvanceReceived.toLocaleString()}</span>
                <span className="text-red-500">Due: Rs {totalBalanceReceivable.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 2. Worker Labor Expense */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Worker Wage Expenses</span>
              <span className="p-2 bg-red-50 text-red-600 rounded-xl text-sm"><FiScissors /></span>
            </div>
            <div>
              <p className="text-2xl font-black text-red-600 font-sans">
                Rs {(workerExpenses.totalWorkerWagesIncurred || 0).toLocaleString()}
              </p>
              <div className="flex justify-between text-[11px] font-bold text-gray-500 mt-2 pt-2 border-t border-gray-100">
                <span className="text-gray-600">Settled: Rs {(workerExpenses.totalWorkerWagesPaid || 0).toLocaleString()}</span>
                <span className="text-red-600 font-extrabold">Pending: Rs {(workerExpenses.totalWorkerWagesPending || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 3. Owner Self-Work Worth */}
          <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-3 hover:shadow-md transition bg-gradient-to-br from-white to-amber-50/20">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <FiAward className="text-[#D4AF37]" /> Owner Personal Labor
              </span>
              <span className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl text-sm"><FiAward /></span>
            </div>
            <div>
              <p className="text-2xl font-black text-[#D4AF37] font-sans">
                Rs {(ownerLabor.totalOwnerLaborEarnings || 0).toLocaleString()}
              </p>
              <p className="text-[11px] font-bold text-gray-600 mt-2 pt-2 border-t border-amber-100">
                {counts.ownerStitchedCount || 0} Suits Stitched | {counts.ownerCuttingCount || 0} Cuts Done
              </p>
            </div>
          </div>

          {/* 4. Pure Net Business Profit */}
          <div className="bg-black text-white p-5 rounded-2xl border border-green-900/40 shadow-sm space-y-3 hover:shadow-md transition relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-green-400 uppercase tracking-wider">Net Business Profit</span>
              <span className="p-2 bg-green-950 text-green-400 border border-green-800 rounded-xl text-sm"><FiTrendingUp /></span>
            </div>
            <div>
              <p className="text-2xl font-black text-green-400 font-sans">
                Rs {netShopBusinessProfit.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-2 pt-2 border-t border-gray-800">
                Gross Revenue minus Worker Wages
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SUIT WORKFLOW & STAGE PIPELINE (6 STAGE CARDS) */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-black uppercase text-gray-700 tracking-wider flex items-center gap-2">
            <FiBox className="text-[#D4AF37]" /> Suits Workflow & Stage Breakdown
          </h2>
          <span className="text-xs text-gray-500 font-bold">Total {totalSuitsCount} Suits Booked</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Stage 1: Booked Total */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center space-y-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Total Booked</span>
            <p className="text-2xl font-black text-black">{totalSuitsCount}</p>
            <span className="text-[10px] text-gray-500 font-semibold">{orders.length} Orders</span>
          </div>

          {/* Stage 2: Cutting */}
          <div className="bg-white p-4 rounded-2xl border border-blue-200 text-center space-y-1 bg-blue-50/20">
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block">In Cutting</span>
            <p className="text-2xl font-black text-blue-700">{cuttingPendingCount}</p>
            <span className="text-[10px] text-blue-600 font-semibold">Pending Cut</span>
          </div>

          {/* Stage 3: In Stitching */}
          <div className="bg-white p-4 rounded-2xl border border-indigo-200 text-center space-y-1 bg-indigo-50/20">
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">In Stitching</span>
            <p className="text-2xl font-black text-indigo-700">{stitchingActiveCount}</p>
            <span className="text-[10px] text-indigo-600 font-semibold">With Karigars</span>
          </div>

          {/* Stage 4: In QC Inspection */}
          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            counts.pendingInspectionCount > 0 
              ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-md animate-pulse' 
              : 'bg-white border-gray-200'
          }`}>
            <span className="text-[10px] font-black uppercase tracking-wider block">Waiting QC Pass</span>
            <p className="text-2xl font-black text-amber-900">{counts.pendingInspectionCount || 0}</p>
            <span className="text-[10px] font-bold text-amber-800">Admin Approval</span>
          </div>

          {/* Stage 5: Rework / Alteration */}
          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            counts.reworkCount > 0 
              ? 'bg-red-50 border-red-300 text-red-900' 
              : 'bg-white border-gray-200'
          }`}>
            <span className="text-[10px] font-black uppercase tracking-wider block text-red-700">In Rework</span>
            <p className="text-2xl font-black text-red-600">{counts.reworkCount || 0}</p>
            <span className="text-[10px] font-bold text-red-500">Alterations</span>
          </div>

          {/* Stage 6: Stitched & Ready */}
          <div className="bg-white p-4 rounded-2xl border border-green-200 text-center space-y-1 bg-green-50/20">
            <span className="text-[10px] font-black text-green-700 uppercase tracking-wider block">Completed</span>
            <p className="text-2xl font-black text-green-600">{readySuitsCount}</p>
            <span className="text-[10px] text-green-700 font-semibold">QC Passed</span>
          </div>

        </div>
      </section>

      {/* 4. PEOPLE & DIRECTORY HIGHLIGHTS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Customers card */}
        <div 
          onClick={() => navigate('/admin/customers')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-black transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-black group-hover:scale-110 transition">
              <FiUsers />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Total Customers</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{customers.length}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Registered clients & naap</p>
            </div>
          </div>
          <FiArrowRight className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition" />
        </div>

        {/* Karigars card */}
        <div 
          onClick={() => navigate('/admin/workers')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-black transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D4AF37] flex items-center justify-center text-xl font-black group-hover:scale-110 transition">
              <FiScissors />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Active Karigars</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{workers.filter(w => w.isActive).length}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Wages & advances tracked</p>
            </div>
          </div>
          <FiArrowRight className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition" />
        </div>

        {/* Order completion rate */}
        <div 
          onClick={() => navigate('/admin/allorders')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-black transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-black group-hover:scale-110 transition">
              <FiCheckCircle />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Active / Completed</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                {activeOrdersCount} <span className="text-xs font-semibold text-gray-400">/ {completedOrdersCount} done</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold">Manage full orders directory</p>
            </div>
          </div>
          <FiArrowRight className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition" />
        </div>

      </section>

      {/* 5. URGENT DELIVERY DEADLINES TABLE */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-black text-black uppercase tracking-wider flex items-center gap-2">
              <FiCalendar className="text-red-500" /> Approaching Delivery Deadlines (Urgent Orders)
            </h3>
            <p className="text-xs text-gray-500 font-medium">Orders sorted by upcoming delivery date to ensure timely handovers.</p>
          </div>
          <button
            onClick={() => navigate('/admin/allorders')}
            className="text-xs font-black text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            View All Orders <FiArrowRight />
          </button>
        </div>

        {urgentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs font-bold">
            🎉 No pending urgent orders! All scheduled orders are on track.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-600 font-black uppercase text-[10px] border-b border-gray-200">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Delivery Due Date</th>
                  <th className="p-3 text-center">Suits</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Balance Due</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {urgentOrders.map((ord) => {
                  const isOverdue = new Date(ord.deliveryDate) < new Date();
                  return (
                    <tr key={ord._id} className="hover:bg-gray-50/80 transition font-medium">
                      <td className="p-3 font-black text-black">#BT-{ord.orderNumber}</td>
                      <td className="p-3 font-bold text-gray-800">
                        {ord.customer?.name || 'Customer'}
                        <span className="block text-[10px] text-gray-400 font-normal">{ord.customer?.phone || '-'}</span>
                      </td>
                      <td className="p-3">
                        <span className={`font-black ${isOverdue ? 'text-red-600 animate-pulse' : 'text-amber-700'}`}>
                          {new Date(ord.deliveryDate).toLocaleDateString()}
                          {isOverdue && <span className="ml-1 text-[9px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-black uppercase">Overdue</span>}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold">{ord.suits?.length || 0}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          ord.orderStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          ord.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-red-500 font-sans">
                        {ord.balanceAmount > 0 ? `Rs ${ord.balanceAmount}` : <span className="text-green-600">Paid</span>}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate('/admin/allorders')}
                          className="bg-black hover:bg-[#D4AF37] text-white hover:text-black font-black px-3 py-1.5 rounded-lg text-[10px] uppercase transition shadow-sm"
                        >
                          View & QC
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};

export default AdminDashboard;
