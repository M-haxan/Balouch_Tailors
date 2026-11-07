import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
// import { useGetOrderById, useGetOrders, useUpdateOrder } from '../hooks/useOrder';
import { useGetWorkers, useAssignSuitStage, useApproveSuit, useRejectSuit } from '../hooks/useWorkers';
import { formatPhone } from '../utils/formatters';
// import { getStatusColor } from '../utils/orderStatus';
import { toast } from 'react-toastify';
import { useGetOrderById, useGetOrders, useUpdateOrderStatus } from '../hooks/useOrder';
import { getStatusColor, ORDER_STATUS_OPTIONS, ORDER_STATUS_FLOW } from '../utils/orderStatus';
import { 
  FiUser, 
  FiPhone, 
  FiCalendar, 
  FiCreditCard, 
  FiUserCheck, 
  FiPrinter, 
  FiImage, 
  FiBox, 
  FiEdit, 
  FiStar, 
  FiClock, 
  FiScissors, 
  FiCheck, 
  FiAlertTriangle, 
  FiX,
  FiCheckCircle
} from 'react-icons/fi';
import SuitJobCardPrintModal from './SuitJobCardPrintModal';

// Helper: Map measurement keys to Urdu labels
export const MEASUREMENT_URDU_MAP = {
  length: 'لمبائی',
  lambai: 'لمبائی',
  kameezLength: 'قمیض لمبائی',
  kameez_length: 'قمیض لمبائی',
  sleeves: 'بازو',
  bazu: 'بازو',
  collar: 'گلہ / بین',
  neck: 'گلہ',
  gala: 'گلہ',
  chest: 'چھاتی',
  chati: 'چھاتی',
  ghera: 'گھیرا',
  daman: 'دامن / گھیرا',
  shoulder: 'تیرا',
  tera: 'تیرا',
  teera: 'تیرا',
  shalwar: 'شلوار',
  shalwarLength: 'شلوار لمبائی',
  trouser: 'شلوار',
  paincha: 'پانچہ',
  paicha: 'پانچہ',
  bottom: 'پانچہ',
  waist: 'کمر',
  kamar: 'کمر',
  hip: 'کولہے',
  thigh: 'تھائی / ران',
  frontPatti: 'سامنے پٹی',
  cuff: 'کف',
  armhole: 'موڈھا',
  modha: 'موڈھا'
};

export const formatMeasurementsForParchi = (measurements) => {
  if (!measurements || measurements.length === 0) return [];
  
  const merged = {};
  measurements.forEach(m => {
    const dataObj = m.data instanceof Map ? Object.fromEntries(m.data) : (m.data || {});
    Object.entries(dataObj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        merged[k] = v;
      }
    });
  });

  const standardKeys = [
    { keys: ['length', 'lambai', 'kameezLength', 'kameez_length', 'لمبائی'], label: 'لمبائی' },
    { keys: ['sleeves', 'bazu', 'بازو'], label: 'بازو' },
    { keys: ['collar', 'neck', 'gala', 'گلہ', 'بین', 'گلہ / بین'], label: 'گلہ' },
    { keys: ['chest', 'chati', 'چھاتی'], label: 'چھاتی' },
    { keys: ['ghera', 'daman', 'گھیرا', 'دامن'], label: 'گھیرا' },
    { keys: ['shoulder', 'tera', 'teera', 'تیرا'], label: 'تیرا' },
    { keys: ['shalwar', 'shalwarLength', 'trouser', 'شلوار', 'شلوار لمبائی'], label: 'شلوار' },
    { keys: ['paincha', 'paicha', 'bottom', 'پانچہ'], label: 'پانچہ' },
  ];

  const rows = [];
  const handledKeys = new Set();

  standardKeys.forEach(std => {
    for (const k of std.keys) {
      if (merged[k] !== undefined) {
        rows.push({ label: std.label, val: merged[k] });
        handledKeys.add(k);
        break;
      }
    }
  });

  Object.entries(merged).forEach(([k, v]) => {
    if (!handledKeys.has(k)) {
      const urduLabel = MEASUREMENT_URDU_MAP[k] || k;
      rows.push({ label: urduLabel, val: v });
    }
  });

  return rows;
};

// -------------------------------------------------------------
// COMPONENT: ORDER DETAILS, SPECS, NAAP & QC INSPECTION MODAL
// -------------------------------------------------------------
const OrderDetailsModal = ({ orderId, closeModal, onOpenDelivery }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isWorker = user?.role === 'worker';

  const { data: orderByIdData, isLoading: isLoadingOrder } = useGetOrderById(orderId);
  const { data: ordersResponse = [] } = useGetOrders();
  const { data: workers = [] } = useGetWorkers();
  const { mutate: assignStage, isPending: isAssigningStage } = useAssignSuitStage();
  const { mutate: approveSuit, isPending: isApproving } = useApproveSuit();
  const { mutate: rejectSuit, isPending: isRejecting } = useRejectSuit();
  const { mutate: changeOrderStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus();
  

  const [selectedSuitIndex, setSelectedSuitIndex] = useState(0);
  const [reworkModalSuit, setReworkModalSuit] = useState(null);
  const [reworkNotes, setReworkNotes] = useState('');
  
  // Track selected worker draft per suit (suitId -> workerId | 'self')
  const [workerDrafts, setWorkerDrafts] = useState({});
  // State for printing individual suit job card / parchi
  const [printJobSuit, setPrintJobSuit] = useState(null);

  const ordersList = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.data || []);
  const order = orderByIdData || ordersList.find(o => o._id === orderId);

  if (!order) {
    if (isLoadingOrder) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white rounded-xl p-8 text-center space-y-3 max-w-sm w-full shadow-2xl border border-gray-200">
            <div className="w-9 h-9 border-4 border-[#0F172A] border-t-[#DFAC43] rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-800">Loading Order Details...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  const suitsList = order.suits || [];
  const activeSuit = suitsList[selectedSuitIndex] || suitsList[0] || {};
  const suitKey = activeSuit._id || `suit-${selectedSuitIndex}`;
  const suitIdBadge = activeSuit.suitNumber || `BT-${order.orderNumber}-${selectedSuitIndex + 1}`;

  const isUnderInspection = activeSuit.stitchingStatus === 'Submitted for Inspection';
  const isRework = activeSuit.stitchingStatus === 'Rework Required';
  const isStitched = activeSuit.stitchingStatus === 'Stitched';
  
  const wearer = activeSuit.wearer || {};
  const measurements = (activeSuit.measurements && activeSuit.measurements.length > 0)
    ? activeSuit.measurements
    : (wearer.measurements || order.customer?.measurements || []);
  const measurementRows = formatMeasurementsForParchi(measurements);

  const prefs = activeSuit.stitchingPreferences || wearer.stitchingPreferences || order.customer?.stitchingPreferences || {};
  
  const prefValuesFromObj = [
    prefs.collar,
    prefs.sleeves,
    prefs.daman,
    prefs.frontPocket,
    prefs.sidePockets,
    prefs.shalwarPocket,
    prefs.patti,
    prefs.stitchingStyle,
    prefs.otherPreferences
  ].filter(Boolean);

  const rawTags = [
    ...(Array.isArray(prefs.tags) ? prefs.tags : []),
    ...(Array.isArray(activeSuit.staticTags) ? activeSuit.staticTags : [])
  ];

  const prefValues = Array.from(new Set([...prefValuesFromObj, ...rawTags])).filter(Boolean);

  // Current assigned worker ID or 'self'
  const currentAssignedId = activeSuit.stitching?.isSelf 
    ? 'self' 
    : (activeSuit.assignedWorker?._id || activeSuit.assignedWorker || '');
  
  // Draft selection
  const draftValue = workerDrafts[suitKey] !== undefined ? workerDrafts[suitKey] : currentAssignedId;

  // Active assigned worker object
  const activeWorkerObj = workers.find(w => w._id === currentAssignedId) || (typeof activeSuit.assignedWorker === 'object' ? activeSuit.assignedWorker : null);

    // ---- Assign button state (prevents repeated / useless assign requests) ----
  const orderLocked = ['Delivered', 'Cancelled'].includes(order.orderStatus);
  const isStitchLocked = isStitched || isUnderInspection;          // QC / stitched suits cannot be re-assigned
  const assignmentChanged = draftValue !== currentAssignedId;       // nothing new selected => nothing to send
  const canAssign = !orderLocked && !isStitchLocked && !isAssigningStage && assignmentChanged;

  const assignButtonLabel = isAssigningStage
    ? 'Assigning...'
    : isStitched
      ? 'Stitched'
      : isUnderInspection
        ? 'Under QC'
        : !assignmentChanged && currentAssignedId !== ''
          ? 'Assigned'
          : draftValue === '' && currentAssignedId !== ''
            ? 'Unassign'
            : currentAssignedId !== ''
              ? 'Re-assign'
              : 'Assign';

  // ---- Order status dropdown state ----
  const statusDropdownDisabled = isWorker || orderLocked || isUpdatingStatus; // only admin can change status
  const allSuitsStitched = suitsList.length > 0 && suitsList.every((s) => s.stitchingStatus === 'Stitched');
  const allowedNextStatuses = ORDER_STATUS_FLOW[order.orderStatus] || [];

  const getStatusOptionState = (opt) => {
    if (opt.value === order.orderStatus) return { disabled: false, hint: '' };
    if (opt.value === 'Delivered') {
      return { disabled: !onOpenDelivery || order.orderStatus === 'Cancelled', hint: '' };
    }
    if (!allowedNextStatuses.includes(opt.value)) return { disabled: true, hint: '' };
    if (opt.value === 'Completed' && !allSuitsStitched) {
      return { disabled: true, hint: ' (stitch all suits first)' };
    }
    return { disabled: false, hint: '' };
  };

  const handleWorkerDraftChange = (sId, value) => {
    setWorkerDrafts(prev => ({
      ...prev,
      [sId]: value
    }));
  };

  const handleAssignWorker = (suitId) => {
    if (!canAssign) return; // double-click / stale state protection

    const data =
      draftValue === 'self'
        ? { stage: 'stitching', isSelf: true, workerId: null }
        : draftValue === ''
          ? { stage: 'stitching', isSelf: false, workerId: null }
          : { stage: 'stitching', isSelf: false, workerId: draftValue };

    assignStage(
      { orderId: order._id, suitId, data },
      {
        onSuccess: () => {
          // forget the draft: the select now follows the saved (refetched) assignment
          setWorkerDrafts(prev => {
            const next = { ...prev };
            delete next[suitKey];
            return next;
          });
        }
      }
    );
  };

  const handleModalStatusChange = (newStatus) => {
    if (newStatus === order.orderStatus) return;

    if (newStatus === 'Delivered') {
      closeModal();
      if (onOpenDelivery) onOpenDelivery(order);
      return;
    }

    if (newStatus === 'Completed' && !allSuitsStitched) {
      toast.error('Please stitch / approve all suits first, then mark the order Completed.');
      return;
    }

    if (newStatus === 'Cancelled') {
      const ok = window.confirm(
        `Cancel order #BT-${order.orderNumber}? A cancelled order is locked and cannot be edited or assigned again.`
      );
      if (!ok) return;
    }

    changeOrderStatus({ id: order._id, orderStatus: newStatus });
  };

  const handleApprove = (suitId) => {
    approveSuit({ orderId: order._id, suitId });
  };

  const handleOpenReworkModal = (suit) => {
    setReworkModalSuit(suit);
    setReworkNotes('');
  };

  const handleSubmitRework = () => {
    if (!reworkNotes.trim()) {
      toast.error('Please specify the reason for alteration / rework.');
      return;
    }
    rejectSuit({ 
      orderId: order._id, 
      suitId: reworkModalSuit._id, 
      reworkNotes 
    }, {
      onSuccess: () => {
        setReworkModalSuit(null);
      }
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-3 font-sans">
        <div className="bg-white rounded shadow-2xl w-full max-w-6xl relative flex flex-col max-h-[92vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center py-2.5 px-4 sm:px-5 border-b border-gray-100 bg-[#0F172A] text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 bg-[#DFAC43] rounded-sm"></span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-white">
                    Order Details & Specifications
                  </h2>
                  <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2 py-0.5 rounded shadow-2xs">
                    #BT-{order.orderNumber}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  Job Sheet, Full Naap Measurements, Specs & Direct Actions
                </p>
              </div>
            </div>
            <button 
              onClick={closeModal} 
              className="p-1 text-gray-400 hover:text-white transition rounded hover:bg-gray-800 cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-3 sm:p-4 space-y-3 flex-1 bg-gray-100/70">
            
            {/* 1. TOP 4 SUMMARY CARDS: Customer, Timeline, Financials, Staff Handling */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              
              {/* Customer Details Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiUser className="text-[#DFAC43]" /> Customer Information
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{order.customer?.name || 'Walk-in Customer'}</p>
                <p className="text-[11px] text-gray-600 font-semibold flex items-center gap-1 font-mono">
                  <FiPhone className="text-gray-400 text-[9px]" /> {formatPhone(order.customer?.phone)}
                </p>
                {order.customer?.address && (
                  <p className="text-[10px] text-gray-400 truncate">{order.customer.address}</p>
                )}
              </div>

              {/* Dates Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiCalendar className="text-[#DFAC43]" /> Timeline & Schedule
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Booked:</span>
                  <span className="text-gray-900">{new Date(order.bookingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Delivery Due:</span>
                  <span className="text-red-600 font-black">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Financial Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiCreditCard className="text-[#DFAC43]" /> Financial Summary
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Total Bill:</span>
                  <span className="text-black font-black font-sans">Rs {order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Advance / Bal:</span>
                  <span>
                    <span className="text-green-600 font-bold font-sans">Rs {order.advancePaid || 0}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-red-500 font-black font-sans">Rs {order.balanceAmount || 0}</span>
                  </span>
                </div>
              </div>

              {/* Staff Handling & Audit Card */}
              <div className="bg-white p-2.5 sm:p-3 rounded border border-gray-200 shadow-2xs space-y-1 hover:border-[#DFAC43] transition">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <FiUserCheck className="text-[#DFAC43]" /> Staff Audit
                </span>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Booked By:</span>
                  <span className="text-gray-900 font-bold truncate max-w-[110px]">{order.createdBy?.name || 'Admin'}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-gray-500">Delivered By:</span>
                  <span className={`font-bold truncate max-w-[110px] ${order.orderStatus === 'Delivered' ? 'text-emerald-700' : 'text-gray-400'}`}>
                    {order.orderStatus === 'Delivered' 
                      ? (order.deliveredBy?.name || order.receivedAtDelivery?.receivedBy || 'Admin')
                      : 'Not Delivered'}
                  </span>
                </div>
              </div>

            </div>

            {/* SUIT SELECTION TABS (If multiple suits in order) */}
            {suitsList.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase shrink-0">Suits:</span>
                {suitsList.map((s, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => setSelectedSuitIndex(sIdx)}
                    className={`py-1 px-2.5 rounded text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      selectedSuitIndex === sIdx
                        ? 'bg-[#0F172A] text-[#DFAC43] shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <span>Suit #{sIdx + 1} ({s.suitNumber || `BT-${order.orderNumber}-${sIdx + 1}`})</span>
                    {s.fabricDetails && <span className="text-[10px] opacity-75">[{s.fabricDetails}]</span>}
                  </button>
                ))}
              </div>
            )}

            {/* 2. MAIN SPLIT SECTION: LEFT SIDE (PARCHI DETAIL) & RIGHT SIDE (IMAGE, STATUS, EDIT, ASSIGN) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
              
              {/* LEFT SIDE (lg:col-span-7): AUTHENTIC JOB PARCHI / NAAP DETAIL CARD */}
              <div className="lg:col-span-7 bg-white rounded border-2 border-black overflow-hidden shadow-xs">
                
                {/* Parchi Top Header Bar */}
                <div className="bg-[#0F172A] text-white px-3.5 py-2 flex flex-wrap justify-between items-center gap-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#DFAC43] text-[#0F172A] font-mono text-xs font-black px-2 py-0.5 rounded shadow-2xs">
                      {suitIdBadge}
                    </span>
                    <span className="font-bold text-xs text-gray-200">
                      {activeSuit.serviceType || 'Shalwar Qameez'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-[#DFAC43]">
                      Stitching: Rs {activeSuit.price || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPrintJobSuit({ order, suit: activeSuit, suitIndex: selectedSuitIndex })}
                      className="bg-[#DFAC43] hover:bg-yellow-400 text-[#0F172A] font-black px-2.5 py-0.5 rounded text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                      title="Print Suit Job Parchi"
                    >
                      <FiPrinter className="text-xs" /> Print Parchi
                    </button>
                  </div>
                </div>

                {/* Split Parchi: Left (اضافی تفصیل) + Right (ناپ ٹیبل) */}
                <div className="grid grid-cols-1 sm:grid-cols-12">
                  
                  {/* Left Column: اضافی تفصیل + Fabric + Tags + Custom Notes */}
                  <div className="sm:col-span-7 p-3 sm:p-4 flex flex-col justify-between space-y-3 border-b sm:border-b-0 sm:border-r-2 border-black bg-white">
                    
                    <div className="space-y-2.5">
                      {/* Heading */}
                      <div className="text-center">
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-wide font-serif">
                          اضافی تفصیل
                        </h3>
                        <div className="w-20 h-0.5 bg-gray-300 mx-auto mt-0.5"></div>
                      </div>

                      {/* Fabric Details & Volume Badge (ONLY actual order data) */}
                      <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-1">
                        <span className="font-black text-sm sm:text-base text-gray-900 font-serif underline decoration-2">
                          {activeSuit.fabricDetails || 'کپڑا درج نہیں'}
                        </span>
                        {activeSuit.volumeNo && (
                          <span className="bg-black text-white font-mono font-black text-[11px] px-2 py-0.5 rounded">
                            VOL: {activeSuit.volumeNo}
                          </span>
                        )}
                      </div>

                      {/* Style / Design Preference Tags */}
                      {prefValues.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {prefValues.map((tag, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="border border-black text-black font-black text-[11px] px-2 py-0.5 rounded bg-white shadow-2xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Add-on Customizations (if any) */}
                      {activeSuit.customizations && activeSuit.customizations.length > 0 && (
                        <div className="pt-1.5 border-t border-dashed border-gray-300">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                            Add-on Customizations:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {activeSuit.customizations.map((c, cIdx) => (
                              <span key={cIdx} className="bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px] px-1.5 py-0.5 rounded">
                                + {c.name} {c.price ? `(+Rs ${c.price})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Special Tailor Instructions (خصوصی ہدایات) ONLY if present */}
                    {activeSuit.customDesign && activeSuit.customDesign.trim() !== '' && (
                      <div className="border-t-2 border-dashed border-gray-400 pt-2 mt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block text-right mb-0.5">خصوصی ہدایات:</span>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 text-right leading-relaxed font-sans" dir="rtl">
                          {activeSuit.customDesign}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Right Column: Complete Measurement Table */}
                  <div className="sm:col-span-5 bg-white flex flex-col justify-start">
                    {measurementRows.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 italic text-xs">
                        Is suit ke liye koi naap darj nahi hai.
                      </div>
                    ) : (
                      <table className="w-full text-center border-collapse">
                        <tbody>
                          {measurementRows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-black last:border-b-0">
                              <td className="p-1.5 font-sans font-black text-sm text-gray-900 border-r-2 border-black w-1/2 bg-gray-50/60">
                                {row.val || '-'}
                              </td>
                              <td className="p-1.5 font-bold text-xs text-gray-900 text-right pr-2.5 font-serif w-1/2">
                                {row.label}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                </div>

              </div>

              {/* RIGHT SIDE (lg:col-span-5): FABRIC IMAGE + LIVE STATUS CHANGER + EDIT FORM LINK + ASSIGN KARIGAR */}
              <div className="lg:col-span-5 space-y-3">
                
                {/* 1. FABRIC / SUIT IMAGE CARD (Compact) */}
                <div className="bg-white rounded border border-gray-200 p-2.5 sm:p-3 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <FiImage className="text-[#DFAC43]" /> Suit & Fabric Photo
                    </span>
                    {activeSuit.fabricImage?.url && (
                      <a 
                        href={activeSuit.fabricImage.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        Open Full Photo
                      </a>
                    )}
                  </div>
                  
                  <div className="w-full h-36 sm:h-40 bg-gray-100 rounded overflow-hidden border border-gray-200 flex items-center justify-center relative group">
                    {activeSuit.fabricImage?.url ? (
                      <img 
                        src={activeSuit.fabricImage.url} 
                        alt="Suit Fabric" 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="text-center p-3 text-gray-400 space-y-1">
                        <FiImage className="text-3xl mx-auto text-gray-300" />
                        <p className="text-[11px] font-bold text-gray-600">No Fabric Photo Attached</p>
                        <p className="text-[10px] text-gray-400">{activeSuit.fabricDetails || 'Standard Fabric'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. LIVE ORDER STATUS & FULL EDIT BUTTON */}
                <div className="bg-white rounded border border-gray-200 p-3 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      <FiBox className="text-[#DFAC43]" /> Order Status & Actions
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                                        <select
                      value={order.orderStatus}
                      onChange={(e) => handleModalStatusChange(e.target.value)}
                      disabled={statusDropdownDisabled}
                      title={isWorker ? 'Only admin can change the order status' : orderLocked ? `${order.orderStatus} orders are locked` : ''}
                      className="flex-1 border-2 border-gray-200 focus:border-black rounded py-2  text-xs font-bold outline-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {ORDER_STATUS_OPTIONS.map((opt) => {
                        const { disabled, hint } = getStatusOptionState(opt);
                        return (
                          <option key={opt.value} value={opt.value} disabled={disabled}>
                            {opt.label}{hint}
                          </option>
                        );
                      })}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        navigate(isWorker ? `/worker/orders/edit/${order._id}` : `/admin/orders/edit/${order._id}`);
                      }}
                      className="bg-[#DFAC43] hover:bg-yellow-400 text-[#0F172A] font-black px-2 py-2 rounded text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0 uppercase tracking-wider active:scale-98"
                      title="Open full order in order creation/edit form"
                    >
                      <FiEdit className="text-xs" /> Edit Order
                    </button>
                  </div>
                </div>

                {/* 3. STITCHER / KARIGAR ASSIGNMENT CARD (Compact) */}
                <div className="bg-slate-50 border border-gray-200 rounded p-3 shadow-2xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FiUserCheck className="text-[#DFAC43]" /> Karigar Assignment
                    </label>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                      isStitched ? 'bg-green-600 text-white' :
                      isUnderInspection ? 'bg-amber-400 text-black' :
                      isRework ? 'bg-red-600 text-white' :
                      activeSuit.stitchingStatus === 'Assigned' ? 'bg-blue-600 text-white' :
                      'bg-gray-700 text-gray-200'
                    }`}>
                      {activeSuit.stitchingStatus || 'Pending'}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-gray-600 bg-white p-2 rounded border border-gray-200">
                    <span className="text-[9px] text-gray-400 block uppercase mb-0.5">Current Assigned Status:</span>
                    {activeSuit.stitching?.isSelf ? (
                      <span className="text-purple-700 font-black inline-flex items-center gap-1">
                        <FiStar className="text-amber-500" /> Owner / Self Stitched
                      </span>
                    ) : activeWorkerObj ? (
                      <span className="text-blue-700 font-black inline-flex items-center gap-1 truncate">
                        <FiUser className="text-blue-600 shrink-0" /> {activeWorkerObj.name} (Rs {activeWorkerObj.perSuitWage})
                      </span>
                    ) : (
                      <span className="text-amber-800 font-black inline-flex items-center gap-1">
                        <FiClock className="text-amber-600" /> Unassigned (Pending)
                      </span>
                    )}
                  </div>

                                    <div className="space-y-1.5">
                    <select
                      value={draftValue}
                      disabled={orderLocked || isStitchLocked || isAssigningStage}
                      onChange={(e) => handleWorkerDraftChange(suitKey, e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-black rounded p-2 outline-none text-xs font-bold bg-white disabled:bg-gray-200 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <option value="">-- Select Karigar (Unassigned) --</option>
                      <option value="self">★ Owner / Self (In-House Stitched)</option>
                      <optgroup label="Registered Karigars">
                        {workers.filter(w => w.isActive).map(w => (
                          <option key={w._id} value={w._id}>{w.name} - Wage: Rs {w.perSuitWage}</option>
                        ))}
                      </optgroup>
                    </select>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAssignWorker(activeSuit._id)}
                        disabled={!canAssign}
                        className="flex-1 bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black py-1.5 px-2.5 rounded text-xs uppercase tracking-wider transition shadow-2xs flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0F172A] disabled:hover:text-white cursor-pointer"
                      >
                        <FiUserCheck /> {assignButtonLabel}
                      </button>

                      {!isStitched && !isUnderInspection && !orderLocked && (
                        <button
                          type="button"
                          onClick={() => handleApprove(activeSuit._id)}
                          disabled={isApproving}
                          className="bg-green-700 hover:bg-green-800 text-white font-black py-1.5 px-2.5 rounded text-xs uppercase tracking-wider transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Directly mark suit as QC Passed & Stitched"
                        >
                          <FiScissors /> Pass & Stitched
                        </button>
                      )}
                    </div>
                  </div>

                  {/* QC Approval / Rework Actions if under inspection */}
                  {isUnderInspection && (
                    <div className="bg-amber-100 border border-amber-300 rounded p-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-950 font-black text-xs">
                        <FiClock className="text-amber-800 text-sm shrink-0" />
                        <span>Submitted for QC Inspection!</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApprove(activeSuit._id)}
                          disabled={isApproving}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-xs py-1.5 px-2 rounded transition shadow flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FiCheck /> Approve (+ Rs {activeWorkerObj?.perSuitWage || 600})
                        </button>
                        <button
                          onClick={() => handleOpenReworkModal(activeSuit)}
                          disabled={isRejecting}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs py-1.5 px-2 rounded transition shadow flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FiAlertTriangle /> Rework
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Alterations if any */}
            {order.alterations && order.alterations.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1">
                  Alterations Details
                </h3>
                
                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs space-y-1.5">
                  {order.alterations.map((alt, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-gray-100 last:border-b-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{alt.description || 'Alteration'}</span>
                        {alt.wearer && (
                          <span className="text-[10px] text-gray-400 font-semibold">For Wearer ID: {alt.wearer}</span>
                        )}
                      </div>
                      <span className="font-black text-black">Rs {alt.price || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="py-2.5 px-4 border-t border-gray-200 bg-white flex justify-end gap-2.5 shrink-0">
            {order.orderStatus !== 'Delivered' && onOpenDelivery && (
              <button
                onClick={() => {
                  closeModal();
                  onOpenDelivery(order);
                }}
                className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] px-4 py-2 rounded-lg text-xs font-black transition shadow flex items-center gap-1.5 cursor-pointer"
              >
                <FiCheckCircle /> Deliver & Settle Payment
              </button>
            )}
            <button 
              onClick={closeModal} 
              className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-xs font-bold transition shadow cursor-pointer"
            >
              Close Details
            </button>
          </div>

        </div>

        {/* REWORK NOTES POPUP MODAL */}
        {reworkModalSuit && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-red-200 animate-scale-up">
              <div className="flex items-center gap-2 text-red-600">
                <FiAlertTriangle className="text-2xl" />
                <h3 className="text-base font-black uppercase tracking-wider">Send Suit for Rework / Alteration</h3>
              </div>
              
              <p className="text-xs text-gray-500 font-medium">
                Suit: <strong>{reworkModalSuit.fabricDetails}</strong> (Wearer: {reworkModalSuit.wearer?.name || 'Customer'})
              </p>

              <div className="space-y-1">
                <label className="block text-[11px] font-black text-gray-700 uppercase">
                  Alteration / Defect Reason:
                </label>
                <textarea
                  rows={3}
                  value={reworkNotes}
                  onChange={(e) => setReworkNotes(e.target.value)}
                  placeholder="e.g. Collar adjustment, shorten length by 1 inch, loosen sleeve..."
                  className="w-full border-2 border-gray-200 focus:border-red-500 rounded p-3 text-xs outline-none font-medium text-gray-800"
                />
              </div>

              <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded font-bold flex items-center gap-1">
                <FiAlertTriangle className="text-red-600 shrink-0" /> Note: Worker wage will remain on hold until alteration is completed and approved.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReworkModalSuit(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black rounded transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRework}
                  disabled={isRejecting}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-5 py-2 rounded transition shadow cursor-pointer"
                >
                  Submit Rework Request
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DEDICATED SUIT CUTTING & STITCHING JOB PARCHI PRINT MODAL */}
      {printJobSuit && (
        <SuitJobCardPrintModal
          order={printJobSuit.order}
          suit={printJobSuit.suit}
          suitIndex={printJobSuit.suitIndex}
          closeModal={() => setPrintJobSuit(null)}
        />
      )}
    </>
  );
};

export default OrderDetailsModal;
