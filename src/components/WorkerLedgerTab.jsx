import React from 'react';
import Pagination from './Pagination';

const WorkerLedgerTab = ({
  loadingLedger,
  pendingLedger = [],
  paginatedLedger = [],
  loadingPayments,
  paymentsData = [],
  paginatedPayments = [],
  currentPage = 1,
  setCurrentPage,
  PAGE_SIZE = 10,
  setViewingPayment
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Active Ledger table */}
      <div className="bg-white border border-gray-200 rounded p-5 shadow-sm space-y-4">
        <h3 className="font-black text-black text-sm uppercase tracking-wider border-b border-gray-100 pb-2">Active Ledger (Pending Settle)</h3>
        {loadingLedger ? (
          <div className="text-center py-4 text-xs text-gray-500">Loading ledger entries...</div>
        ) : pendingLedger.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No pending entries. Your account is fully settled!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-600 font-bold uppercase border-b border-gray-200 text-[10px]">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Details</th>
                  <th className="p-2.5 text-right">Wages (+)</th>
                  <th className="p-2.5 text-right">Advance (-)</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedLedger.map(entry => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="p-2.5 text-gray-500 font-semibold">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="p-2.5 font-bold text-gray-800">{entry.description}</td>
                    <td className="p-2.5 text-right font-black text-green-600 font-sans">
                      {entry.type === 'suit' ? `+ Rs ${entry.amount}` : '-'}
                    </td>
                    <td className="p-2.5 text-right font-black text-red-600 font-sans">
                      {entry.type === 'advance' ? `${entry.amount > 0 ? '-' : '+'} Rs ${Math.abs(entry.amount)}` : '-'}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination 
              currentPage={currentPage}
              totalItems={pendingLedger.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Settle/Payment logs */}
      <div className="bg-white border border-gray-200 rounded p-5 shadow-sm space-y-4">
        <h3 className="font-black text-black text-sm uppercase tracking-wider border-b border-gray-100 pb-2">Paid Salary History</h3>
        {loadingPayments ? (
          <div className="text-center py-4 text-xs text-gray-500">Loading payment history...</div>
        ) : paymentsData.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No paid salary records found.</p>
        ) : (
          <div className="space-y-3">
            {paginatedPayments.map(p => (
              <div key={p._id} className="border border-gray-150 rounded-xl p-3 bg-gray-50/50 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-gray-900">Period: {new Date(p.startDate).toLocaleDateString()} to {new Date(p.endDate).toLocaleDateString()}</p>
                  {p.notes && <p className="text-gray-500 text-[11px] mt-0.5">Notes: {p.notes}</p>}
                  <p className="text-[9px] text-gray-400 mt-1">Paid on: {new Date(p.paymentDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3 items-center justify-between sm:justify-end shrink-0">
                  <div className="text-right text-[11px]">
                    <span className="text-gray-450 block font-semibold text-[9px] uppercase text-gray-400">Earned / Advance</span>
                    <span className="font-bold text-gray-750 font-sans">Rs {p.totalEarned} / Rs {p.totalAdvance}</span>
                  </div>
                  <div className="bg-green-105 border border-green-200 text-green-800 px-3 py-1 rounded-lg font-black text-xs font-sans">
                    Net Paid: Rs {p.netPaid}
                  </div>
                  <button
                    onClick={() => setViewingPayment(p)}
                    className="bg-black hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black px-3.5 py-1.5 rounded text-xs transition border border-black uppercase cursor-pointer"
                  >
                    View Detail
                  </button>
                </div>
              </div>
            ))}
            <Pagination 
              currentPage={currentPage}
              totalItems={paymentsData.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerLedgerTab;
