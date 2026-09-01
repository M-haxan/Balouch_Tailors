import React, { useState } from 'react';
import { 
  useGetWorkers, 
  useAddWorker, 
  useUpdateWorker, 
  useDeleteWorker,
  useGetWorkerLedger,
  useAddWorkerAdvance,
  useCalculateSalary,
  usePaySalary,
  useGetWorkerPayments,
  useGetWorkerDetails,
  useUpdateLedgerEntry,
  useDeleteLedgerEntry
} from '../hooks/useWorkers';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiX, 
  FiUser, 
  FiPhone, 
  FiDollarSign, 
  FiBriefcase, 
  FiUnlock, 
  FiMapPin,
  FiBook,
  FiTrendingUp,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminWorkers = () => {
  const { data: workers = [], isLoading } = useGetWorkers();
  const { mutate: deleteWorker, isPending: isDeleting } = useDeleteWorker();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  
  // State for recording advance money separately
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [targetWorker, setTargetWorker] = useState(null);

  // State for worker ledger modal
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerWorker, setLedgerWorker] = useState(null);

  // Search Logic
  const filteredWorkers = workers.filter(w => {
    const phoneStr = w.phone ? w.phone.toString() : '';
    const nameStr = w.name ? w.name.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    return phoneStr.includes(search) || nameStr.includes(search);
  });

  const openFormModal = (worker = null) => {
    setEditingWorker(worker);
    setIsModalOpen(true);
  };

  const openAdvanceModal = (worker) => {
    setTargetWorker(worker);
    setIsAdvanceModalOpen(true);
  };

  const openLedgerModal = (worker) => {
    setLedgerWorker(worker);
    setIsLedgerModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Kya aap waqai is Karigar ko hamesha ke liye delete karna chahte hain?')) {
      deleteWorker(id);
    }
  };

  return (
    <div className="bg-white shadow-sm p-6 relative min-h-[80vh]">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Manage Karigar (Workers)</h2>
          <p className="text-sm text-gray-500 mt-1">Add, update, and manage tailor wages, specialization and advance logs.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by phone or name..." 
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 focus:border-black rounded-lg outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openFormModal()}
            className="bg-[#D4AF37] text-black hover:bg-black hover:text-[#D4AF37] px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <FiPlus className="text-lg" /> Add Worker
          </button>
        </div>
      </div>

      {/* WORKERS TABLE */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Loading workers...</div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-2">No workers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-[#D4AF37] text-sm uppercase tracking-wider whitespace-nowrap">
                <th className="p-4 rounded-tl-md">Karigar Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Stitching Wage</th>
                <th className="p-4">Advance Taken</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">Address</th>
                <th className="p-4 rounded-tr-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWorkers.map((worker) => (
                <tr key={worker._id} className="hover:bg-gray-50 transition text-sm">
                  <td className="p-4 font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {worker.profileImage?.url ? (
                        <img
                          src={worker.profileImage.url} 
                          alt={worker.name} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-150 text-black flex items-center justify-center text-sm font-black uppercase shadow-sm">
                          {worker.name[0]}
                        </div>
                      )}
                      <div>
                        <span>{worker.name}</span>
                        {!worker.isActive && (
                          <span className="ml-2 bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-gray-600 font-medium whitespace-nowrap">{worker.phone}</td>
                  <td className="p-4 text-black font-extrabold whitespace-nowrap">Rs {worker.perSuitWage} <span className="text-xs text-gray-400 font-medium">/ suit</span></td>
                  <td className="p-4 text-red-600 font-extrabold whitespace-nowrap">Rs {worker.advanceAmount}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md border border-blue-100 font-bold uppercase tracking-wider">
                      {worker.specialization || 'Complete Suit Stitcher'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-650 text-sm max-w-xs truncate">{worker.address || '-'}</td>
                  <td className="p-4 flex justify-end gap-1.5 items-center whitespace-nowrap">
                    {/* Ledger & Salary button */}
                    <button 
                      onClick={() => openLedgerModal(worker)} 
                      className="bg-black hover:bg-[#D4AF37] text-white hover:text-black font-bold px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-black whitespace-nowrap"
                      title="Ledger & Salary Manager"
                    >
                      Ledger & Salary
                    </button>
                    {/* Advance Manage button */}
                    <button 
                      onClick={() => openAdvanceModal(worker)} 
                      className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-red-100 whitespace-nowrap"
                      title="Manage Advance Amount"
                    >
                      ± Advance
                    </button>
                    <button 
                      onClick={() => openFormModal(worker)} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-lg" 
                      title="Edit Profile"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(worker._id)} 
                      disabled={isDeleting} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition text-lg" 
                      title="Delete Worker"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD/EDIT FORM MODAL */}
      {isModalOpen && (
        <WorkerFormModal 
          worker={editingWorker} 
          closeModal={() => setIsModalOpen(false)} 
        />
      )}

      {/* MANAGE ADVANCE MODAL */}
      {isAdvanceModalOpen && (
        <WorkerAdvanceModal 
          worker={targetWorker}
          closeModal={() => setIsAdvanceModalOpen(false)}
        />
      )}

      {/* LEDGER & SALARY MODAL */}
      {isLedgerModalOpen && (
        <WorkerLedgerModal 
          worker={ledgerWorker}
          closeModal={() => setIsLedgerModalOpen(false)}
        />
      )}

    </div>
  );
};
// -------------------------------------------------------------
// COMPONENT: WORKER FORM MODAL (ADD / EDIT)
// -------------------------------------------------------------
const WorkerFormModal = ({ worker, closeModal }) => {
  const { mutate: addWorker, isPending: isAdding } = useAddWorker();
  const { mutate: updateWorker, isPending: isUpdating } = useUpdateWorker();
  
  const isEditMode = Boolean(worker);
  const isPending = isAdding || isUpdating;

  const [formData, setFormData] = useState({
    name: worker?.name || '',
    phone: worker?.phone || '',
    password: '', // Password is required on create, optional on edit
    perSuitWage: worker?.perSuitWage || '',
    advanceAmount: worker?.advanceAmount || '0',
    address: worker?.address || '',
    specialization: worker?.specialization || 'Complete Suit Stitcher',
    isActive: worker?.isActive !== undefined ? worker.isActive : true
  });

  const [profileImage, setProfileImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isEditMode && !formData.password) {
      toast.error('Password is required for new workers');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('phone', formData.phone);
    if (formData.password) {
      payload.append('password', formData.password);
    }
    payload.append('perSuitWage', formData.perSuitWage);
    payload.append('advanceAmount', formData.advanceAmount);
    payload.append('address', formData.address);
    payload.append('specialization', formData.specialization);
    payload.append('isActive', formData.isActive);

    if (profileImage) {
      payload.append('profileImage', profileImage);
    }

    if (isEditMode) {
      updateWorker({ id: worker._id, data: payload }, {
        onSuccess: () => closeModal()
      });
    } else {
      addWorker(payload, {
        onSuccess: () => closeModal()
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl relative flex flex-col max-h-[90vh] overflow-hidden border border-gray-150">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-black text-black">
            {isEditMode ? `Edit Karigar: ${worker.name}` : 'Create Karigar Profile'}
          </h2>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-200">
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="workerForm" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required 
                    type="text" 
                    name="name" 
                    className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-semibold text-sm" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number (Login ID)</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required 
                    type="tel" 
                    name="phone" 
                    placeholder="e.g. 03001234567"
                    className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-semibold text-sm" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </div>

            {/* Password & Photo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  {isEditMode ? 'Change Password (Optional)' : 'Set Password'}
                </label>
                <div className="relative">
                  <FiUnlock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required={!isEditMode}
                    type="text" 
                    name="password" 
                    placeholder="Set simple login pin/pass"
                    className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-semibold text-sm" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Profile Photo (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="w-full px-2 py-1 border-2 border-gray-200 rounded-lg outline-none text-xs file:mr-4 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:bg-gray-100 hover:file:bg-gray-200" 
                  onChange={handleFileChange} 
                />
              </div>
            </div>
            {/* Financial Details */}
            <div className="bg-gray-55 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Stitching Wage (Rs/Suit)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px] select-none">PKR</span>
                  <input 
                    required 
                    type="number" 
                    name="perSuitWage" 
                    min="0"
                    placeholder="e.g. 800"
                    className="w-full pl-12 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-bold text-sm" 
                    value={formData.perSuitWage} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </div>

            {/* Specialization & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Specialization</label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    name="specialization" 
                    required
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-bold text-xs bg-white" 
                    value={formData.specialization} 
                    onChange={handleInputChange} 
                  >
                    <option value="Complete Suit Stitcher">Complete Suit Stitcher</option>
                    <option value="Kameez Stitcher">Kameez Stitcher</option>
                    <option value="Cutter">Cutter</option>
                    <option value="Helper">Helper</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Residential Address</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required
                    type="text" 
                    name="address" 
                    placeholder="Residential Address"
                    className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-semibold text-sm" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </div>

            {isEditMode && (
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  id="isActive"
                  className="w-4 h-4 accent-black cursor-pointer" 
                  checked={formData.isActive}
                  onChange={handleInputChange} 
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-800 cursor-pointer">
                  Worker Active (Azafi logins and assignments allowed)
                </label>
              </div>
            )}

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex justify-end gap-3">
          <button 
            type="button" 
            onClick={closeModal} 
            className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="workerForm" 
            disabled={isPending} 
            className="bg-[#D4AF37] hover:bg-black text-black hover:text-[#D4AF37] px-8 py-2.5 font-black rounded-lg transition shadow-md text-sm"
          >
            {isPending ? 'Saving...' : 'Save Karigar'}
          </button>
        </div>

      </div>
    </div>
  );
};
// -------------------------------------------------------------
// COMPONENT: WORKER ADVANCE PAYMENTS MODAL
// -------------------------------------------------------------
const WorkerAdvanceModal = ({ worker, closeModal }) => {
  const { mutate: addAdvance, isPending } = useAddWorkerAdvance();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Valid amount enter karein');
      return;
    }

    addAdvance({
      id: worker._id,
      data: {
        amount: Number(amount),
        operation: 'add',
        description: description || 'Advance Taken (Kharcha)',
        date
      }
    }, {
      onSuccess: () => {
        closeModal();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-150 overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-black text-black">Record Advance (Kharcha): {worker.name}</h2>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Current Advance Balance: Rs {worker.advanceAmount}</p>
          </div>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-200">
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Enter Amount (Rs)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[11px] select-none">PKR</span>
              <input 
                required 
                type="number" 
                min="1"
                placeholder="e.g. 500"
                className="w-full pl-12 pr-3 py-3 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-black text-lg" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
            <input 
              required
              type="date"
              className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-bold text-sm bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description / Notes (Optional)</label>
            <input 
              type="text"
              placeholder="e.g. Daily kharcha, emergency cash"
              className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-semibold text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-4 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-bold transition text-xs"
            >
              {isPending ? 'Logging Kharcha...' : 'Save Advance'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT: WORKER DETAIL, LEDGER & SALARY MANAGER MODAL
// -------------------------------------------------------------
const WorkerLedgerModal = ({ worker, closeModal }) => {
  const [activeSubTab, setActiveSubTab] = useState('assigned'); // 'assigned', 'ledger', 'calculator', 'history'
  
  // Queries
  const { data: detailsData, isLoading: loadingDetails, refetch: refetchDetails } = useGetWorkerDetails(worker._id);
  const { data: ledgerData = [], isLoading: loadingLedger, refetch: refetchLedger } = useGetWorkerLedger(worker._id);
  const { data: paymentsData = [], isLoading: loadingPayments } = useGetWorkerPayments(worker._id);

  // Mutations
  const calculateSalaryMutation = useCalculateSalary();
  const paySalaryMutation = usePaySalary();
  const deleteLedgerMutation = useDeleteLedgerEntry();

  // Modal / Inner Edit States
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);

  // Calculator State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [calcResult, setCalcResult] = useState(null);
  const [paymentNotes, setPaymentNotes] = useState('');

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Dono dates select karein');
      return;
    }
    calculateSalaryMutation.mutate({
      id: worker._id,
      startDate,
      endDate
    }, {
      onSuccess: (data) => {
        setCalcResult(data);
      }
    });
  };

  const handlePaySalary = () => {
    if (!calcResult) return;
    if (calcResult.suits.length === 0 && calcResult.advances.length === 0) {
      toast.error('Is date range mein koi pending suit ya advance nahi hai!');
      return;
    }
    if (window.confirm(`Kya aap is range (${new Date(startDate).toLocaleDateString()} se ${new Date(endDate).toLocaleDateString()}) ki salary Rs ${calcResult.netPaid} pay kar ke ledger settle karna chahte hain?`)) {
      paySalaryMutation.mutate({
        id: worker._id,
        data: {
          startDate,
          endDate,
          notes: paymentNotes
        }
      }, {
        onSuccess: () => {
          setCalcResult(null);
          setPaymentNotes('');
          refetchLedger();
          refetchDetails();
        }
      });
    }
  };

  const handleDeleteEntry = (ledgerId) => {
    if (window.confirm('Kya aap waqai is entry ko delete karna chahte hain? Is se worker ka advance balance ya stitching record theek ho jayega.')) {
      deleteLedgerMutation.mutate(ledgerId, {
        onSuccess: () => {
          refetchLedger();
          refetchDetails();
        }
      });
    }
  };

  const { assignedSuits = [], stitchedSuits = [] } = detailsData || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative flex flex-col max-h-[90vh] overflow-hidden border border-gray-150">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-black">Karigar Ledger & Salary Manager</h2>
            <p className="text-xs text-gray-505 font-bold text-gray-500 mt-0.5">Worker Name: {worker.name} | Specialization: {worker.specialization}</p>
          </div>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-200">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-2">
          <button
            onClick={() => setActiveSubTab('assigned')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === 'assigned' ? 'border-black text-black font-extrabold' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            Assigned Suits ({assignedSuits.length + stitchedSuits.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === 'ledger' ? 'border-black text-black font-extrabold' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            Ledger / Khata
          </button>
          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === 'calculator' ? 'border-black text-black font-extrabold' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            Calculate & Pay Salary
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === 'history' ? 'border-black text-black font-extrabold' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            Payment History
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 min-h-[50vh]">
          
          {/* ASSIGNED SUITS TAB */}
          {activeSubTab === 'assigned' && (
            loadingDetails ? (
              <div className="text-center py-10 text-gray-500 font-bold">Loading assignments...</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-black text-sm text-gray-800 uppercase tracking-wider mb-3">Pending Stitching ({assignedSuits.length})</h3>
                  {assignedSuits.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No suits currently assigned for stitching.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignedSuits.map(suit => (
                        <div key={suit.suitId} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="bg-black text-[#D4AF37] text-[10px] font-black px-2 py-0.5 rounded uppercase">#BT-{suit.orderNumber}</span>
                              <span className="bg-yellow-100 text-yellow-855 border border-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Assigned</span>
                            </div>
                            <h4 className="font-extrabold text-sm text-gray-900 mt-2 uppercase">{suit.fabricDetails}</h4>
                            <p className="text-xs text-gray-550 font-bold mt-1">Wearer: <span className="font-bold text-black">{suit.wearerName}</span></p>
                          </div>
                          <div className="border-t border-gray-150 pt-2 mt-3 flex justify-between items-center text-xs">
                            <span className="text-gray-405 font-bold">Wage: Rs {worker.perSuitWage}</span>
                            <span className="text-gray-400">Due: {new Date(suit.deliveryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-black text-sm text-gray-800 uppercase tracking-wider mb-3">Stitched / Completed ({stitchedSuits.length})</h3>
                  {stitchedSuits.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No suits marked as completed in current cycle.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stitchedSuits.map(suit => (
                        <div key={suit.suitId} className="border border-green-150 bg-green-50/20 rounded-xl p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="bg-black text-[#D4AF37] text-[10px] font-black px-2 py-0.5 rounded uppercase">#BT-{suit.orderNumber}</span>
                              <span className="bg-green-100 text-green-800 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Stitched</span>
                            </div>
                            <h4 className="font-extrabold text-sm text-gray-900 mt-2 uppercase">{suit.fabricDetails}</h4>
                            <p className="text-xs text-gray-550 font-bold mt-1">Wearer: <span className="font-bold text-black">{suit.wearerName}</span></p>
                          </div>
                          <div className="border-t border-green-100 pt-2 mt-3 flex justify-between items-center text-xs">
                            <span className="text-green-600 font-bold">Earned: Rs {worker.perSuitWage}</span>
                            <span className="text-gray-400">Finished</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {/* LEDGER TAB */}
          {activeSubTab === 'ledger' && (
            loadingLedger ? (
              <div className="text-center py-10 text-gray-500 font-bold">Loading ledger entries...</div>
            ) : ledgerData.length === 0 ? (
              <div className="text-center py-16 text-gray-400 font-bold">Ledger is clean. No entries found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-xs font-bold uppercase border-b border-gray-200">
                      <th className="p-3">Date</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Credit (Stitching +)</th>
                      <th className="p-3 text-right">Debit (Advance -)</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {ledgerData.map(entry => (
                      <tr key={entry._id} className="hover:bg-gray-55 text-xs">
                        <td className="p-3 font-semibold text-gray-500">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="p-3 font-bold text-gray-900">{entry.description}</td>
                        <td className="p-3 text-right font-black text-green-600 font-sans">
                          {entry.type === 'suit' ? `+ Rs ${entry.amount}` : '-'}
                        </td>
                        <td className="p-3 text-right font-black text-red-650 font-sans">
                          {entry.type === 'advance' ? `${entry.amount > 0 ? '-' : '+'} Rs ${Math.abs(entry.amount)}` : '-'}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            entry.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="p-3 text-right flex justify-end gap-2">
                          {entry.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => setEditingEntry(entry)}
                                className="text-blue-600 hover:text-blue-850 font-bold"
                                title="Edit Entry"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteEntry(entry._id)}
                                className="text-red-600 hover:text-red-800 font-bold"
                                title="Delete Entry"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* CALCULATOR TAB */}
          {activeSubTab === 'calculator' && (
            <div className="space-y-6">
              <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 items-end gap-4 bg-gray-55 p-4 rounded-xl border border-gray-150 bg-gray-50">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-bold text-xs"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-bold text-xs"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={calculateSalaryMutation.isPending}
                  className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider shadow"
                >
                  {calculateSalaryMutation.isPending ? 'Calculating...' : 'Calculate Wages'}
                </button>
              </form>

              {calcResult && (
                <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center animate-fade-in">
                    <div className="bg-green-50 p-4 border border-green-100 rounded-xl">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Stitching Credit</span>
                      <span className="text-xl font-black text-green-700 font-sans">Rs {calcResult.totalEarned}</span>
                    </div>
                    <div className="bg-red-50 p-4 border border-red-100 rounded-xl">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Advances Deductible</span>
                      <span className="text-xl font-black text-red-700 font-sans">Rs {calcResult.totalAdvance}</span>
                    </div>
                    <div className="bg-blue-50 p-4 border border-blue-100 rounded-xl">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Net Salary Payout</span>
                      <span className="text-xl font-black text-blue-700 font-sans">Rs {calcResult.netPaid}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div>
                      <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-2">Suits Stitched ({calcResult.suits.length})</h4>
                      {calcResult.suits.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No suits pending payment in range.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 text-xs">
                          {calcResult.suits.map(s => (
                            <div key={s._id} className="flex justify-between bg-gray-55 p-2 rounded border border-gray-100 bg-gray-50">
                              <span className="font-bold text-gray-800">{s.description}</span>
                              <span className="font-black text-green-600 font-sans">+ Rs {s.amount}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-2">Advances Taken ({calcResult.advances.length})</h4>
                      {calcResult.advances.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No advances pending recovery in range.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 text-xs">
                          {calcResult.advances.map(a => (
                            <div key={a._id} className="flex justify-between bg-gray-55 p-2 rounded border border-gray-100 bg-gray-50">
                              <span className="font-bold text-gray-800">{a.description}</span>
                              <span className="font-black text-red-650 font-sans">- Rs {a.amount}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-end justify-between">
                    <div className="w-full md:w-2/3">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Payment Notes / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Settle wages for June first fortnight"
                        className="w-full px-3 py-2 border border-gray-200 focus:border-black rounded-lg outline-none text-xs"
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handlePaySalary}
                      disabled={paySalaryMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white font-black py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider shadow whitespace-nowrap"
                    >
                      {paySalaryMutation.isPending ? 'Processing...' : 'Mark Paid & Archive'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAYMENT HISTORY TAB */}
          {activeSubTab === 'history' && (
            loadingPayments ? (
              <div className="text-center py-10 text-gray-500 font-bold">Loading payment logs...</div>
            ) : paymentsData.length === 0 ? (
              <div className="text-center py-16 text-gray-400 font-bold">No paid salary records found.</div>
            ) : (
              <div className="space-y-4">
                {paymentsData.map(payment => (
                  <div key={payment._id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs hover:shadow-sm transition">
                    <div className="space-y-1">
                      <p className="font-black text-black">
                        Period: {new Date(payment.startDate).toLocaleDateString()} to {new Date(payment.endDate).toLocaleDateString()}
                      </p>
                      {payment.notes && <p className="text-gray-550 font-bold text-gray-600">Notes: {payment.notes}</p>}
                      <p className="text-[10px] text-gray-400">Processed on: {new Date(payment.paymentDate).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-3 items-center shrink-0 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Earned / Advance</span>
                        <span className="font-bold text-gray-750 font-sans">Rs {payment.totalEarned} / Rs {payment.totalAdvance}</span>
                      </div>
                      <div className="bg-green-50 border border-green-200 text-green-800 px-3.5 py-1.5 rounded-lg text-center font-black font-sans">
                        Net Paid: Rs {payment.netPaid}
                      </div>
                      <button
                        onClick={() => setViewingPayment(payment)}
                        className="bg-black hover:bg-[#D4AF37] text-white hover:text-black font-bold px-3 py-1.5 rounded-lg text-xs transition border border-black"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={closeModal}
            className="bg-black text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black border border-black px-6 py-2 rounded-lg text-xs font-black uppercase transition"
          >
            Close
          </button>
        </div>

        {/* Sub-modals inside Ledger view */}
        {editingEntry && (
          <EditLedgerModal
            entry={editingEntry}
            closeModal={() => setEditingEntry(null)}
            refetchLedger={refetchLedger}
            refetchDetails={refetchDetails}
          />
        )}

        {viewingPayment && (
          <PaymentReceiptModal
            payment={viewingPayment}
            worker={worker}
            closeModal={() => setViewingPayment(null)}
          />
        )}

      </div>
    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT: LEDGER ENTRY EDIT MODAL (ADMIN ONLY)
// -------------------------------------------------------------
const EditLedgerModal = ({ entry, closeModal, refetchLedger, refetchDetails }) => {
  const { mutate: updateLedger, isPending } = useUpdateLedgerEntry();
  const [amount, setAmount] = useState(entry.amount);
  const [date, setDate] = useState(new Date(entry.date).toISOString().substring(0, 10));
  const [description, setDescription] = useState(entry.description);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount === undefined || isNaN(amount) || Number(amount) < 0) {
      toast.error('Enter valid amount');
      return;
    }

    updateLedger({
      ledgerId: entry._id,
      data: {
        amount: Number(amount),
        date,
        description
      }
    }, {
      onSuccess: () => {
        refetchLedger();
        refetchDetails();
        closeModal();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-150 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-black text-black uppercase tracking-wider">Edit Ledger Entry</h3>
          <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-200">
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount (Rs)</label>
            <input
              required
              type="number"
              min="0"
              className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-bold text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
            <input
              required
              type="date"
              className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-bold text-sm bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description / Notes</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black rounded-lg outline-none font-semibold text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-bold transition text-xs"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
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
    
    // Inject printable HTML and trigger print dialog
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Quick state refresh to restore React events
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

        {/* Printable Section */}
        <div className="p-6 overflow-y-auto flex-1 font-sans bg-gray-50" id="receipt-print-area">
          <div className="border-4 border-double border-black p-5 space-y-5 bg-white text-black rounded-lg shadow-sm">
            {/* Invoice Header */}
            <div className="text-center space-y-0.5">
              <h1 className="text-xl font-black tracking-widest uppercase font-serif text-black">Balouch Tailors</h1>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Premium Stitching & Bridal Wear</p>
              <div className="w-16 h-0.5 bg-black mx-auto my-1.5"></div>
              <p className="text-[11px] font-black tracking-wider uppercase bg-black text-white px-2 py-0.5 inline-block rounded">
                Karigar Salary Slip (Raseed)
              </p>
            </div>

            {/* Invoice Metadata */}
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

            {/* Worker metadata */}
            <div className="text-[10px] space-y-1 bg-gray-50 p-2.5 rounded border border-gray-150">
              <span className="font-black uppercase tracking-wider text-[8px] text-gray-450 block mb-1">Karigar Info</span>
              <div className="flex justify-between font-semibold">
                <p>Name: <span className="font-black text-black">{worker.name}</span></p>
                <p>Specialization: <span className="font-bold text-black">{worker.specialization}</span></p>
              </div>
            </div>

            {/* Detailed Ledger Summary */}
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

            {/* Notes if any */}
            {payment.notes && (
              <div className="text-[9px] bg-amber-50/20 border border-amber-100 p-2 rounded">
                <span className="font-bold block uppercase text-amber-800 tracking-wider">Notes</span>
                <p className="font-medium text-gray-650 italic leading-relaxed">{payment.notes}</p>
              </div>
            )}

            {/* Signature fields */}
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

export default AdminWorkers;
