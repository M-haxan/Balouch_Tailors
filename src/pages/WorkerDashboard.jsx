import React, { useState } from 'react';
import { useGetWorkerDashboard, useSubmitSuitForInspection, useGetWorkerLedger, useGetWorkerPayments } from '../hooks/useWorkers';
import useAuthStore from '../Store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  FiScissors, 
  FiCheckCircle, 
  FiDollarSign, 
  FiLogOut, 
  FiCalendar, 
  FiUser, 
  FiImage, 
  FiBox, 
  FiInfo, 
  FiPhone, 
  FiAlertTriangle,
  FiClock
} from 'react-icons/fi';
import Preloader from '../components/Preloader';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const workerId = user?.id || user?._id;
  
  const { data: dashboardData, isLoading, refetch } = useGetWorkerDashboard();
  const { mutate: submitForQC, isPending: isSubmitting } = useSubmitSuitForInspection();
  const { data: ledgerData = [], isLoading: loadingLedger } = useGetWorkerLedger(workerId);
  const { data: paymentsData = [], isLoading: loadingPayments } = useGetWorkerPayments(workerId);
  
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned', 'inspection', 'rework', 'completed', or 'ledger'
  const [viewingPayment, setViewingPayment] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleSubmitForQC = (orderId, suitId) => {
    if (window.confirm('Kya aapne yeh suit mukammal sil liya hai aur Admin Inspection ke liye submit karna chahte hain?')) {
      submitForQC({ orderId, suitId }, {
        onSuccess: () => {
          refetch();
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Preloader />
      </div>
    );
  }

  const { 
    worker = {}, 
    stats = {}, 
    assignedSuits = [], 
    underInspectionSuits = [], 
    reworkSuits = [], 
    stitchedSuits = [] 
  } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      
      {/* MOBILE-FRIENDLY HEADER */}
      <header className="bg-black text-[#D4AF37] sticky top-0 z-40 px-6 py-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          {worker.profileImage?.url ? (
            <img 
              src={worker.profileImage.url} 
              alt={worker.name} 
              className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]"
            />
          ) : (
            <div className="w-10 h-10 bg-[#D4AF37] text-black rounded-full flex items-center justify-center font-black text-lg">
              {worker.name ? worker.name[0].toUpperCase() : 'K'}
            </div>
          )}
          <div>
            <h1 className="text-base font-black text-white">{worker.name}</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{worker.specialization || 'Karigar Portal'}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="bg-red-950/40 hover:bg-red-900/50 text-red-400 p-2.5 rounded-lg border border-red-900/40 transition-colors flex items-center gap-1 text-xs font-bold"
          title="Logout"
        >
          <FiLogOut /> Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* FINANCIAL & WORK STATUS CARDS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Earnings Card */}
          <div className="bg-black text-white p-4 rounded-2xl shadow-sm border border-gray-900 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approved Earnings</span>
              <span className="text-[#D4AF37] text-xs font-black select-none">PKR</span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-[#D4AF37]">Rs {stats.totalEarnings}</p>
              <p className="text-[9px] text-gray-500 font-bold mt-1">QC Approved Wages</p>
            </div>
          </div>

          {/* Stitched Count Card */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approved Suits</span>
              <FiCheckCircle className="text-green-500 text-lg" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-black">{stats.totalStitched}</p>
              <p className="text-[9px] text-gray-400 font-bold mt-1">Completed & Passed</p>
            </div>
          </div>

          {/* Advance Taken Card */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Advance Taken</span>
              <span className="text-red-500 font-black text-lg">Rs</span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-red-600">Rs {stats.advanceTaken}</p>
              <p className="text-[9px] text-gray-400 font-bold mt-1">Paid in advance</p>
            </div>
          </div>

          {/* Balance Due Card */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remaining Due</span>
              <span className="text-blue-500 font-black text-lg">Rs</span>
            </div>
            <div className="mt-2">
              <p className={`text-2xl font-black ${stats.balanceDue >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                Rs {stats.balanceDue}
              </p>
              <p className="text-[9px] text-gray-400 font-bold mt-1">Ready for Settle</p>
            </div>
          </div>

        </section>

        {/* PROFILE WAGE INFO (MOBILE TIGHT CARD) */}
        <section className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-wrap gap-4 items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FiScissors className="text-[#D4AF37]" />
            <span className="text-gray-500 font-semibold">Stitching Wage:</span>
            <span className="font-extrabold text-black">Rs {worker.perSuitWage} per suit</span>
          </div>
          {worker.phone && (
            <div className="flex items-center gap-2">
              <FiPhone className="text-gray-400" />
              <span className="text-gray-500 font-semibold">Phone:</span>
              <span className="font-bold text-gray-700">{worker.phone}</span>
            </div>
          )}
          {worker.address && (
            <div className="w-full mt-2 pt-2 border-t border-gray-100 text-gray-500 flex items-center gap-2">
              <span className="font-semibold">Address:</span>
              <span className="font-medium text-gray-700">{worker.address}</span>
            </div>
          )}
        </section>

        {/* SUIT WORK LIST SECTION */}
        <section className="space-y-4">
          
          {/* TAB SELECTORS */}
          <div className="flex overflow-x-auto bg-gray-200/80 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 min-w-[100px] py-2.5 px-3 text-xs md:text-sm font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'assigned' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Assigned ({assignedSuits.length})
            </button>
            <button
              onClick={() => setActiveTab('inspection')}
              className={`flex-1 min-w-[110px] py-2.5 px-3 text-xs md:text-sm font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'inspection' ? 'bg-amber-400 text-black shadow-sm font-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              <FiClock /> In QC ({underInspectionSuits.length})
            </button>
            {reworkSuits.length > 0 && (
              <button
                onClick={() => setActiveTab('rework')}
                className={`flex-1 min-w-[110px] py-2.5 px-3 text-xs md:text-sm font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'rework' ? 'bg-red-600 text-white shadow-sm font-black animate-pulse' : 'text-red-600 hover:bg-red-100'
                }`}
              >
                <FiAlertTriangle /> Rework ({reworkSuits.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 min-w-[100px] py-2.5 px-3 text-xs md:text-sm font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'completed' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Approved ({stitchedSuits.length})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex-1 min-w-[90px] py-2.5 px-3 text-xs md:text-sm font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ledger' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Ledger
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="space-y-4">
            
            {/* 1. ASSIGNED TAB */}
            {activeTab === 'assigned' && (
              assignedSuits.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <FiBox className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 font-bold text-sm">Abhi koi pending suit assign nahi hai.</p>
                  <p className="text-xs text-gray-400 mt-0.5">Admin se assignments ke liye rabta karein.</p>
                </div>
              ) : (
                assignedSuits.map((item, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col md:flex-row md:items-start gap-5">
                    
                    {/* Fabric Image Container */}
                    <div className="w-full md:w-40 h-40 bg-gray-50 rounded-xl border border-gray-150 overflow-hidden flex items-center justify-center shrink-0 relative">
                      {item.fabricImage?.url ? (
                        <img 
                          src={item.fabricImage.url} 
                          alt="Suit Fabric" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <FiImage className="text-2xl mb-1" />
                          <span className="text-[10px] font-bold uppercase">No Image</span>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-black text-[#D4AF37] text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                        #BT-{item.orderNumber}
                      </span>
                    </div>

                    {/* Specs Details */}
                    <div className="flex-1 flex flex-col justify-between h-full min-h-[160px] space-y-3">
                      
                      <div className="space-y-2">
                        {/* Title & Vol */}
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-black text-black text-base uppercase leading-tight">{item.fabricDetails}</h4>
                          <span className="bg-gray-100 text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 border border-gray-200">
                            VOL: {item.volumeNo}
                          </span>
                        </div>

                        {/* Customer & Wearer */}
                        <div className="grid grid-cols-2 gap-x-4 text-xs font-semibold text-gray-650">
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase block">Wearer Name</span>
                            <span className="text-gray-900 font-bold">{item.wearerName}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase block">Delivery Due</span>
                            <span className="text-red-600 font-black">{new Date(item.deliveryDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Styling Tags */}
                        {item.staticTags && item.staticTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.staticTags.map(tag => (
                              <span key={tag} className="bg-gray-100 border border-gray-200 text-black px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Custom instructions */}
                        {item.customDesign && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-right" dir="rtl">
                            <span className="block text-[9px] font-bold text-amber-800 uppercase tracking-wider mb-1 text-left" dir="ltr">Special Tailor Notes</span>
                            <p className="text-xs font-bold text-gray-800 leading-relaxed font-sans">{item.customDesign}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Submit for QC */}
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center gap-3">
                        <span className="text-xs font-bold text-gray-400">
                          Expected Wage: <span className="text-black font-black">Rs {worker.perSuitWage}</span>
                        </span>
                        <button
                          onClick={() => handleSubmitForQC(item.orderId, item.suitId)}
                          disabled={isSubmitting}
                          className="bg-black hover:bg-[#D4AF37] hover:text-black text-white text-xs font-black px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5"
                        >
                          <FiCheckCircle /> Submit for QC Inspection
                        </button>
                      </div>

                    </div>

                  </div>
                ))
              )
            )}

            {/* 2. UNDER INSPECTION TAB */}
            {activeTab === 'inspection' && (
              underInspectionSuits.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <FiClock className="text-4xl text-amber-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-bold text-sm">Abhi koi suit Admin Inspection mein nahi hai.</p>
                </div>
              ) : (
                underInspectionSuits.map((item, idx) => (
                  <div key={idx} className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3 border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1">
                          <FiClock /> Waiting for Admin Quality Approval
                        </span>
                        <h4 className="font-black text-base text-gray-900 mt-2 uppercase">{item.fabricDetails}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Order #BT-{item.orderNumber} | Wearer: <span className="font-bold">{item.wearerName}</span></p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-700 block">Rs {worker.perSuitWage}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Wage On Hold</span>
                      </div>
                    </div>
                    <p className="text-xs text-amber-800 bg-amber-50/70 p-2.5 rounded-xl border border-amber-100 font-medium">
                      ℹ️ Yeh suit aapne complete kar diya hai. Jaise hi Admin physically check karke approve karega, aapke ledger me Rs {worker.perSuitWage} add ho jayenge.
                    </p>
                  </div>
                ))
              )
            )}

            {/* 3. REWORK REQUIRED TAB */}
            {activeTab === 'rework' && (
              reworkSuits.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500 font-bold text-sm">Koi alteration ya rework pending nahi hai!</p>
                </div>
              ) : (
                reworkSuits.map((item, idx) => (
                  <div key={idx} className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm space-y-4 border-l-4 border-l-red-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-red-100 text-red-900 border border-red-200 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1">
                          <FiAlertTriangle /> Alteration / Rework Needed
                        </span>
                        <h4 className="font-black text-base text-gray-900 mt-2 uppercase">{item.fabricDetails}</h4>
                        <p className="text-xs text-gray-500">Order #BT-{item.orderNumber} | Wearer: <span className="font-bold">{item.wearerName}</span></p>
                      </div>
                    </div>

                    {/* Admin rework instruction notes */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 space-y-1">
                      <span className="text-[10px] font-black text-red-700 uppercase tracking-wider block">Admin Alteration Instructions:</span>
                      <p className="text-xs font-bold text-red-900">{item.reworkNotes || 'Silayi theek karein aur dobara submit karein.'}</p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleSubmitForQC(item.orderId, item.suitId)}
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-5 py-2 rounded-xl transition shadow flex items-center gap-1.5"
                      >
                        <FiCheckCircle /> Alteration Done - Re-Submit for QC
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* 4. COMPLETED & APPROVED TAB */}
            {activeTab === 'completed' && (
              stitchedSuits.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <FiCheckCircle className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 font-bold text-sm">Abhi tak koi suit approved nahi hua.</p>
                </div>
              ) : (
                stitchedSuits.map((item, idx) => (
                  <div key={idx} className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 border-l-4 border-l-green-500">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Order #BT-{item.orderNumber}</span>
                      <h4 className="font-bold text-gray-900 text-sm">{item.fabricDetails}</h4>
                      <p className="text-xs text-gray-500">Stitched for: <span className="font-bold">{item.wearerName}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-green-600">+ Rs {worker.perSuitWage}</p>
                      <p className="text-[10px] text-green-700 font-bold uppercase">QC Passed & Credited</p>
                    </div>
                  </div>
                ))
              )
            )}

            {/* 5. LEDGER TAB */}
            {activeTab === 'ledger' && (
              <div className="space-y-6 animate-fade-in">
                {/* Active Ledger table */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-black text-black text-sm uppercase tracking-wider border-b border-gray-100 pb-2">Active Ledger (Pending Settle)</h3>
                  {loadingLedger ? (
                    <div className="text-center py-4 text-xs text-gray-500">Loading ledger entries...</div>
                  ) : ledgerData.filter(e => e.status === 'Pending').length === 0 ? (
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
                          {ledgerData.filter(e => e.status === 'Pending').map(entry => (
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
                    </div>
                  )}
                </div>

                {/* Settle/Payment logs */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-black text-black text-sm uppercase tracking-wider border-b border-gray-100 pb-2">Paid Salary History</h3>
                  {loadingPayments ? (
                    <div className="text-center py-4 text-xs text-gray-500">Loading payment history...</div>
                  ) : paymentsData.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No paid salary records found.</p>
                  ) : (
                    <div className="space-y-3">
                      {paymentsData.map(p => (
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
                              className="bg-black hover:bg-[#D4AF37] text-white hover:text-black font-bold px-3 py-1.5 rounded-lg text-[10px] transition border border-black uppercase"
                            >
                              Receipt
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </section>

      </main>

      {/* Receipt Slip Modal */}
      {viewingPayment && (
        <PaymentReceiptModal
          payment={viewingPayment}
          worker={worker}
          closeModal={() => setViewingPayment(null)}
        />
      )}

    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT: PAYMENT INVOICE RECEIPT MODAL (PRINT FRIENDLY)
// -------------------------------------------------------------
const PaymentReceiptModal = ({ payment, worker, closeModal }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-area').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-150 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xs font-black text-black uppercase tracking-wider">Salary Payment Receipt</h3>
          <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-200">
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 font-sans bg-gray-55" id="receipt-print-area">
          <div className="border-4 border-double border-black p-5 space-y-5 bg-white text-black rounded-lg shadow-sm">
            <div className="text-center space-y-0.5">
              <h1 className="text-xl font-black tracking-widest uppercase font-serif text-black">Balouch Tailors</h1>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Premium Stitching & Bridal Wear</p>
              <div className="w-16 h-0.5 bg-black mx-auto my-1.5"></div>
              <p className="text-[11px] font-black tracking-wider uppercase bg-black text-white px-2 py-0.5 inline-block rounded">
                Karigar Salary Slip (Raseed)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] border-b border-dashed border-gray-400 pb-3 font-semibold text-gray-700">
              <div className="space-y-1">
                <p>Receipt No: <span className="font-black text-black">#SR-{payment._id.substring(18).toUpperCase()}</span></p>
                <p>Date: <span className="font-bold text-black">{new Date(payment.paymentDate).toLocaleDateString()}</span></p>
              </div>
              <div className="space-y-1 text-right">
                <p>Period Start: <span className="font-bold text-black">{new Date(payment.startDate).toLocaleDateString()}</span></p>
                <p>Period End: <span className="font-bold text-black">{new Date(payment.endDate).toLocaleDateString()}</span></p>
              </div>
            </div>

            <div className="text-[10px] space-y-1 bg-gray-55 p-2.5 rounded border border-gray-150 bg-gray-50">
              <span className="font-black uppercase tracking-wider text-[8px] text-gray-450 block mb-1">Karigar Info</span>
              <div className="flex justify-between font-semibold">
                <p>Name: <span className="font-black text-black">{worker.name}</span></p>
                <p>Specialization: <span className="font-bold text-black">{worker.specialization}</span></p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-black text-[8px] uppercase text-gray-450 tracking-wider block">Wages & Deductions Summary</span>
              <table className="w-full text-[10px] text-left border-collapse font-medium">
                <thead>
                  <tr className="border-b border-black font-bold uppercase text-[8px] text-gray-500">
                    <th className="py-1">Description</th>
                    <th className="py-1 text-right">Amount (Rs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 text-gray-700">Total Stitching Wages Earned (Wages Credit)</td>
                    <td className="py-2 text-right font-bold text-green-700 font-sans">+ Rs {payment.totalEarned}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">Total Advances Taken Deducted (Deductions Debit)</td>
                    <td className="py-2 text-right font-bold text-red-600 font-sans">- Rs {payment.totalAdvance}</td>
                  </tr>
                  <tr className="border-t-2 border-black font-black text-xs bg-gray-50">
                    <td className="py-2 pl-1.5 uppercase font-black">Net Cash Paid Out</td>
                    <td className="py-2 pr-1.5 text-right font-black font-sans">Rs {payment.netPaid}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {payment.notes && (
              <div className="text-[9px] bg-amber-50/20 border border-amber-100 p-2 rounded">
                <span className="font-bold block uppercase text-amber-800 tracking-wider">Notes</span>
                <p className="font-medium text-gray-650 italic leading-relaxed">{payment.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-8 text-[9px] font-bold text-center">
              <div className="space-y-1">
                <div className="border-b border-black w-28 mx-auto"></div>
                <p className="uppercase text-gray-500">Karigar Signature</p>
              </div>
              <div className="space-y-1">
                <div className="border-b border-black w-28 mx-auto"></div>
                <p className="uppercase text-gray-500">Shop Stamp & Sig</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase hover:bg-gray-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1"
          >
            Print Slip
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
