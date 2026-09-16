import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetFinancialSummary } from '../hooks/useWorkers';
import { useGetOrders } from '../hooks/useOrder';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiScissors, 
  FiCreditCard, 
  FiUsers, 
  FiShoppingBag, 
  FiArrowRight, 
  FiCalendar,
  FiPieChart,
  FiFileText
} from 'react-icons/fi';
import Preloader from '../components/Preloader';

const AdminFinancialReports = () => {
  const navigate = useNavigate();
  const { data: financialData = {}, isLoading: loadingFinancial } = useGetFinancialSummary();
  const { data: orders = [], isLoading: loadingOrders } = useGetOrders();

  const isLoading = loadingFinancial || loadingOrders;

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
    totalKharcha = 0,
    totalShopExpenses = 0,
    workerExpenses = {},
    supplierExpenses = {},
    ownerLabor = {},
    counts = {},
    netShopBusinessProfit = 0
  } = financialData;

  return (
    <div className="space-y-8 pb-12 font-sans">
      
      {/* 1. EXECUTIVE FINANCIAL HEADER */}
      <section className="bg-[#0F172A] text-white rounded p-6 md:p-8 border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#DFAC43] animate-pulse"></span>
              <span className="text-xs text-gray-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <FiDollarSign className="text-[#DFAC43]" /> Financial Reports & Accounting
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl font-medium">
              Live automated financial matrix, net business profit, cash flow collections, receivables, and Karigar & material liabilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => navigate('/admin/expenses')}
              className="bg-[#DFAC43] hover:bg-white text-[#0F172A] font-black px-4 py-2.5 rounded text-xs transition shadow-lg flex items-center gap-2"
            >
              <FiCreditCard /> Manage Shop Expenses
            </button>
            <button
              onClick={() => navigate('/admin/workers')}
              className="bg-[#1E293B] hover:bg-gray-800 text-white font-bold px-4 py-2.5 rounded text-xs transition border border-gray-700 flex items-center gap-2"
            >
              <FiUsers /> Karigar Wages
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRIMARY 3-METRIC FINANCIAL ROW */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-black uppercase text-gray-800 tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#DFAC43] rounded-sm"></span>
            Primary Financial Matrix
          </h2>
          <span className="text-xs text-gray-400 font-bold">Live Auto-Calculated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Total Kaam (Sales / Revenue) */}
          <div className="bg-white p-5 rounded border border-gray-200 shadow-sm space-y-3 hover:border-[#DFAC43]/40 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Work / Sales</span>
              <span className="p-2 bg-amber-50 text-[#DFAC43] rounded text-sm"><FiCreditCard /></span>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-[#0F172A] font-sans">Rs {totalRevenue.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-gray-500 mt-2 pt-2 border-t border-gray-100">
                Sum of all customer bills ({orders.length} orders booked)
              </p>
            </div>
          </div>

          {/* 2. Total Kharcha */}
          <div className="bg-white p-5 rounded border border-gray-200 shadow-sm space-y-3 hover:border-gray-400 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Expenses</span>
              <span className="p-2 bg-gray-100 text-gray-700 rounded text-sm"><FiScissors /></span>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-gray-900 font-sans">
                Rs {((workerExpenses.totalWorkerWagesIncurred || 0) + (totalShopExpenses || 0)).toLocaleString()}
              </p>
              <div className="flex justify-between text-[11px] font-bold text-gray-500 mt-2 pt-2 border-t border-gray-100">
                <span>Karigar: Rs {(workerExpenses.totalWorkerWagesIncurred || 0).toLocaleString()}</span>
                <span>Shop Exp: Rs {(totalShopExpenses || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 3. Pure Net Business Profit */}
          <div className="bg-[#0F172A] text-white p-5 rounded border border-gray-800 shadow-sm space-y-3 hover:border-[#DFAC43]/40 transition relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-wider">Net Business Profit</span>
              <span className="p-2 bg-[#DFAC43]/10 text-[#DFAC43] border border-[#DFAC43]/20 rounded text-sm"><FiTrendingUp /></span>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-[#DFAC43] font-sans">
                Rs {netShopBusinessProfit.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-2 pt-2 border-t border-gray-800">
                Total Sales minus Total Shop & Labor Expenses
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CASH FLOW & BALANCE RECEIVABLE / PAYABLE MATRIX */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-black uppercase text-gray-800 tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#DFAC43] rounded-sm"></span>
            Cash Flow & Debts Breakdown
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 4. Total Advance / Cash Collected */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm space-y-2 hover:border-gray-300 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Receiving</span>
              <span className="text-xs text-green-600 font-black">Cash In-Hand</span>
            </div>
            <p className="text-xl font-black text-gray-900 font-sans">Rs {totalAdvanceReceived.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 font-medium">Customer advances & settlements collected</p>
          </div>

          {/* 5. Customer Balance Receivable (Udhar) */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm space-y-2 hover:border-amber-300 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">Amount Receivable</span>
              <span className="text-[10px] bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded font-black border border-amber-200">Customer Credits</span>
            </div>
            <p className="text-xl font-black text-[#DFAC43] font-sans">Rs {totalBalanceReceivable.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 font-medium">Remaining balance to collect from clients</p>
          </div>

          {/* 6. Karigar Wages Payable */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm space-y-2 hover:border-gray-300 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Amount Payable</span>
              <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-black">Karigar Wages</span>
            </div>
            <p className="text-xl font-black text-gray-900 font-sans">Rs {(workerExpenses.totalWorkerWagesPending || 0).toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 font-medium">Unsettled Karigar wages earned</p>
          </div>

          {/* 7. Material Supplier Payable */}
          <div className="bg-white p-4 rounded border border-[#DFAC43]/30 shadow-sm space-y-2 hover:border-[#DFAC43] transition bg-gradient-to-br from-white to-amber-50/20">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">Amount Payable</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-black border border-amber-300">Material</span>
            </div>
            <p className="text-xl font-black text-[#DFAC43] font-sans">
              Rs {(supplierExpenses.totalSupplierPayable || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 font-medium">Bukram, Kaj, Button & Thread dues</p>
          </div>

        </div>
      </section>

      {/* 4. QUICK ACCESS LINKS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => navigate('/admin/expenses')}
          className="bg-white p-5 rounded border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#DFAC43] transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-amber-50 text-[#DFAC43] flex items-center justify-center text-xl font-black group-hover:scale-105 transition">
              <FiCreditCard />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Daily Expenses Ledger</p>
              <h3 className="text-lg font-black text-gray-900 mt-0.5">Shop Expenses & Material Bills</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Record rent, bills, supplies & kharcha</p>
            </div>
          </div>
          <FiArrowRight className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition" />
        </div>

        <div 
          onClick={() => navigate('/admin/workers')}
          className="bg-white p-5 rounded border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#0F172A] transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-gray-100 text-gray-800 flex items-center justify-center text-xl font-black group-hover:scale-105 transition">
              <FiUsers />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Worker Payouts & Advances</p>
              <h3 className="text-lg font-black text-gray-900 mt-0.5">Karigar Khata & Wage Settlements</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Manage per-suit rates, payments & advances</p>
            </div>
          </div>
          <FiArrowRight className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition" />
        </div>
      </section>

    </div>
  );
};

export default AdminFinancialReports;
