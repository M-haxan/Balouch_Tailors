import React, { useState, useEffect } from 'react';
import defaultLogo from '../assets/BT_Logo.png';
import { useGetShopSettings } from '../hooks/useShopSettings';
import Pagination from '../components/Pagination';
import { formatPhone } from '../utils/formatters';
import { validatePassword } from '../utils/validators';
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
  FiBriefcase, 
  FiUnlock, 
  FiMapPin,
  FiBook,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiPrinter
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminWorkers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: workersResponse, isLoading } = useGetWorkers({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchTerm
  });
  const { mutate: deleteWorker, isPending: isDeleting } = useDeleteWorker();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);

  // State for viewing worker full profile
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileWorker, setProfileWorker] = useState(null);
  const [profileInitialEdit, setProfileInitialEdit] = useState(false);
  
  // State for recording advance money separately
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [targetWorker, setTargetWorker] = useState(null);

  // State for worker ledger modal
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerWorker, setLedgerWorker] = useState(null);

  const workers = Array.isArray(workersResponse) 
    ? workersResponse 
    : (workersResponse?.data || []);

  const pagination = workersResponse?.pagination || {
    totalRecords: workers.length,
    currentPage: 1,
    totalPages: 1,
    pageSize: PAGE_SIZE
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const paginatedWorkers = workers;
  const filteredWorkers = workers;

  const openFormModal = (worker = null) => {
    if (worker) {
      openProfileModal(worker, true);
    } else {
      setEditingWorker(null);
      setIsModalOpen(true);
    }
  };

  const openProfileModal = (worker, editMode = false) => {
    setProfileWorker(worker);
    setProfileInitialEdit(editMode);
    setIsProfileModalOpen(true);
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
              placeholder="Search by phone, name, skill..." 
              className="w-full pl-10 pr-8 py-2 border-2 border-gray-100 focus:border-black rounded-lg outline-none transition text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5 rounded-full"
                title="Clear search"
              >
                <FiX className="text-xs" />
              </button>
            )}
          </div>
          <button 
            onClick={() => openFormModal()}
            className="bg-[#DFAC43] text-[#0F172A] hover:bg-[#0F172A] hover:text-[#DFAC43] px-4 py-2 text-sm font-black rounded transition shadow-sm flex items-center gap-2 whitespace-nowrap"
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
        <div className="overflow-x-auto rounded border border-gray-200 shadow-2xs bg-white">
          <table className="w-full min-w-[1150px] text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-[#DFAC43] text-xs uppercase tracking-wider whitespace-nowrap">
                <th className="p-4 min-w-[240px] rounded-tl">Karigar Name</th>
                <th className="p-4 min-w-[150px]">Phone Number</th>
                <th className="p-4 min-w-[160px]">Stitching Wage</th>
                <th className="p-4 min-w-[150px]">Advance Taken</th>
                <th className="p-4 min-w-[180px]">Specialization</th>
                <th className="p-4 min-w-[180px]">Address</th>
                <th className="p-4 min-w-[320px] rounded-tr text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedWorkers.map((worker) => (
                <tr key={worker._id} className="hover:bg-gray-50/80 transition text-sm font-medium">
                  
                  {/* Karigar Name & Avatar */}
                  <td className="p-4 font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {worker.profileImage?.url ? (
                        <img
                          src={worker.profileImage.url} 
                          alt={worker.name} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#0F172A] text-[#DFAC43] flex items-center justify-center text-sm font-black uppercase shadow-xs shrink-0">
                          {worker.name ? worker.name[0] : 'W'}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block">{worker.name}</span>
                        {!worker.isActive ? (
                          <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-bold inline-block mt-0.5">
                            Inactive
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-bold inline-block mt-0.5">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Phone Number */}
                  <td className="p-4 text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <FiPhone className="text-gray-400 text-xs shrink-0" />
                      <span className="font-mono font-bold text-gray-800">{formatPhone(worker.phone)}</span>
                    </div>
                  </td>

                  {/* Stitching Wage */}
                  <td className="p-4 text-gray-900 font-extrabold whitespace-nowrap">
                    Rs {worker.perSuitWage} <span className="text-xs text-gray-400 font-medium">/ suit</span>
                  </td>

                  {/* Advance Taken */}
                  <td className="p-4 text-red-600 font-extrabold whitespace-nowrap">
                    Rs {(worker.advanceAmount || 0).toLocaleString()}
                  </td>

                  {/* Specialization & Permissions */}
                  <td className="p-4 whitespace-nowrap">
                    <div>
                      <span className="bg-slate-100 text-gray-800 text-xs px-2.5 py-1 rounded border border-gray-200 font-bold uppercase tracking-wider block w-fit">
                        {worker.specialization || 'Complete Suit Stitcher'}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {worker.canCreateOrder && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded" title="Allowed to Book / Create Orders">
                            📝 Book Order
                          </span>
                        )}
                        {worker.canDeliverOrder && (
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-1.5 py-0.2 rounded" title="Allowed to Deliver Orders & Receive Cash">
                            🚚 Deliver Order
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Address */}
                  <td className="p-4 text-gray-600 text-xs max-w-xs truncate">
                    {worker.address || '-'}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1.5 items-center whitespace-nowrap">
                      {/* View & Edit Profile Button */}
                      <button 
                        onClick={() => openProfileModal(worker, false)} 
                        className="bg-gray-100 hover:bg-[#0F172A] text-gray-800 hover:text-[#DFAC43] font-bold px-2.5 py-1.5 rounded text-xs transition border border-gray-300 flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                        title="View Full Profile"
                      >
                        <FiUser className="text-xs shrink-0" /> Profile
                      </button>

                      {/* Ledger & Salary button */}
                      <button 
                        onClick={() => openLedgerModal(worker)} 
                        className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black px-2.5 py-1.5 rounded text-xs transition border border-[#0F172A] flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
                        title="Ledger & Salary Manager"
                      >
                        <FiBook className="text-xs shrink-0" /> Ledger
                      </button>

                      {/* Advance Manage button */}
                      <button 
                        onClick={() => openAdvanceModal(worker)} 
                        className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-2 py-1.5 rounded text-xs transition border border-amber-200 whitespace-nowrap cursor-pointer"
                        title="Manage Advance Amount"
                      >
                        ± Advance
                      </button>

                      {/* Quick Edit button */}
                      <button 
                        onClick={() => openProfileModal(worker, true)} 
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition text-sm cursor-pointer" 
                        title="Edit Worker Profile"
                      >
                        <FiEdit />
                      </button>

                      {/* Delete button */}
                      <button 
                        onClick={() => handleDelete(worker._id)} 
                        disabled={isDeleting} 
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition text-sm cursor-pointer" 
                        title="Delete Worker"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination 
            currentPage={currentPage}
            totalItems={filteredWorkers.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* VIEW & EDIT WORKER PROFILE MODAL */}
      {isProfileModalOpen && (
        <WorkerProfileModal
          worker={profileWorker}
          initialEdit={profileInitialEdit}
          closeModal={() => setIsProfileModalOpen(false)}
          openLedgerModal={openLedgerModal}
          openAdvanceModal={openAdvanceModal}
        />
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
// COMPONENT: WORKER PROFILE VIEW & EDIT MODAL
// -------------------------------------------------------------
const WorkerProfileModal = ({ worker: initialWorker, initialEdit = false, closeModal, openLedgerModal, openAdvanceModal }) => {
  const [isEditing, setIsEditing] = useState(initialEdit);
  const [worker, setWorker] = useState(initialWorker);
  const { mutate: updateWorker, isPending: isUpdating } = useUpdateWorker();

  const [formData, setFormData] = useState({
    name: initialWorker?.name || '',
    phone: initialWorker?.phone ? formatPhone(initialWorker.phone) : '',
    password: '',
    perSuitWage: initialWorker?.perSuitWage || '',
    advanceAmount: initialWorker?.advanceAmount || '0',
    address: initialWorker?.address || '',
    specialization: initialWorker?.specialization || 'Complete Suit Stitcher',
    isActive: initialWorker?.isActive !== undefined ? initialWorker.isActive : true,
    canCreateOrder: Boolean(initialWorker?.canCreateOrder),
    canDeliverOrder: Boolean(initialWorker?.canDeliverOrder)
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(initialWorker?.profileImage?.url || '');

  useEffect(() => {
    if (initialWorker) {
      setWorker(initialWorker);
      setFormData({
        name: initialWorker.name || '',
        phone: initialWorker.phone ? formatPhone(initialWorker.phone) : '',
        password: '',
        perSuitWage: initialWorker.perSuitWage || '',
        advanceAmount: initialWorker.advanceAmount || '0',
        address: initialWorker.address || '',
        specialization: initialWorker.specialization || 'Complete Suit Stitcher',
        isActive: initialWorker.isActive !== undefined ? initialWorker.isActive : true,
        canCreateOrder: Boolean(initialWorker.canCreateOrder),
        canDeliverOrder: Boolean(initialWorker.canDeliverOrder)
      });
      setPreviewImage(initialWorker.profileImage?.url || '');
    }
  }, [initialWorker]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('phone', formData.phone);
    if (formData.password) {
      const passwordStatus = validatePassword(formData.password);
      if (!passwordStatus.isValid) {
        toast.error(passwordStatus.error);
        return;
      }
      payload.append('password', formData.password);
    }
    payload.append('perSuitWage', formData.perSuitWage);
    payload.append('advanceAmount', formData.advanceAmount);
    payload.append('address', formData.address);
    payload.append('specialization', formData.specialization);
    payload.append('isActive', formData.isActive);
    payload.append('canCreateOrder', Boolean(formData.canCreateOrder));
    payload.append('canDeliverOrder', Boolean(formData.canDeliverOrder));

    if (profileImage) {
      payload.append('profileImage', profileImage);
    }

    updateWorker({ id: worker._id, data: payload }, {
      onSuccess: (res) => {
        const updated = res?.data || res || {};
        const merged = {
          ...worker,
          name: formData.name,
          phone: formData.phone,
          perSuitWage: Number(formData.perSuitWage),
          advanceAmount: Number(formData.advanceAmount),
          address: formData.address,
          specialization: formData.specialization,
          isActive: formData.isActive,
          canCreateOrder: Boolean(formData.canCreateOrder),
          canDeliverOrder: Boolean(formData.canDeliverOrder),
          ...(updated._id ? updated : {})
        };
        setWorker(merged);
        setIsEditing(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[92vh] overflow-hidden border border-gray-150">
        
        {/* MODAL HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-gray-800 bg-[#0F172A] text-white gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#DFAC43] text-[#0F172A] flex items-center justify-center text-lg font-black shrink-0">
              <FiUser />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {worker.name}
              </h2>
              <p className="text-xs text-gray-400">
                Karigar Profile & Settings Management
              </p>
            </div>
          </div>

          {/* Sub Tab Switcher in Header */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-[#1E293B] p-1 rounded border border-gray-700 text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(false);
                }}
                className={`px-3 py-1 rounded font-bold transition cursor-pointer flex items-center gap-1 ${
                  !isEditing 
                    ? 'bg-[#DFAC43] text-[#0F172A] shadow-xs' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <FiUser className="text-xs" /> View
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className={`px-3 py-1 rounded font-bold transition cursor-pointer flex items-center gap-1 ${
                  isEditing 
                    ? 'bg-[#DFAC43] text-[#0F172A] shadow-xs' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <FiEdit className="text-xs" /> Edit
              </button>
            </div>

            <button 
              type="button"
              onClick={closeModal} 
              className="p-1.5 text-gray-400 hover:text-white transition rounded-full hover:bg-gray-800 cursor-pointer"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-6">
          
          {!isEditing ? (
            /* VIEW PROFILE MODE */
            <div className="space-y-6">
              
              {/* Profile Card Banner */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-5 rounded border border-gray-200 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  {worker.profileImage?.url ? (
                    <img
                      src={worker.profileImage.url} 
                      alt={worker.name} 
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#DFAC43] shadow-md" 
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#0F172A] text-[#DFAC43] flex items-center justify-center text-2xl font-black uppercase shadow-md border-2 border-[#DFAC43]">
                      {worker.name ? worker.name[0] : 'W'}
                    </div>
                  )}
                  <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    worker.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`} title={worker.isActive ? 'Active Worker' : 'Inactive Worker'} />
                </div>

                {/* Worker Identity */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-xl font-black text-gray-900">{worker.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider w-fit mx-auto sm:mx-0 ${
                      worker.isActive 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {worker.isActive ? 'Active Karigar' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                    <FiPhone className="text-gray-400" /> Phone (Login ID): <strong className="font-mono text-gray-800 font-bold">{formatPhone(worker.phone)}</strong>
                  </p>

                  <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                    <FiBriefcase className="text-gray-400" /> Role: <span className="bg-slate-200 text-gray-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{worker.specialization || 'Complete Suit Stitcher'}</span>
                  </p>
                </div>
              </div>

              {/* Metric Tiles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <div className="bg-white p-4 rounded border border-gray-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Stitching Wage Rate</span>
                  <p className="text-xl font-black text-[#0F172A] font-sans">
                    Rs {worker.perSuitWage} <span className="text-xs text-gray-500 font-medium">/ suit</span>
                  </p>
                  <span className="text-[10px] text-gray-400 block">Standard wage paid per completed suit</span>
                </div>

                <div className="bg-white p-4 rounded border border-gray-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Advance Balance Due</span>
                  <p className="text-xl font-black text-red-600 font-sans">
                    Rs {(worker.advanceAmount || 0).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-gray-400 block">Pending advance to be deducted from wage</span>
                </div>

              </div>

              {/* Details List */}
              <div className="bg-gray-50/70 p-4 rounded border border-gray-200 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-bold flex items-center gap-1.5">
                    <FiMapPin className="text-gray-400" /> Residential Address:
                  </span>
                  <span className="font-semibold text-gray-900">{worker.address || 'Not Provided'}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-bold flex items-center gap-1.5">
                    <FiUnlock className="text-gray-400" /> Login Access:
                  </span>
                  <span className="font-semibold text-gray-900">Configured (Phone: {formatPhone(worker.phone)})</span>
                </div>

                {/* Permissions Snapshot in Profile */}
                <div className="py-2 border-b border-gray-200/60">
                  <span className="text-gray-500 font-bold block mb-1.5">Special Portal Access Permissions:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className={`p-2 rounded border flex items-center gap-2 ${
                      worker.canCreateOrder 
                        ? 'bg-amber-50 border-amber-300 text-amber-900' 
                        : 'bg-gray-100 border-gray-200 text-gray-500'
                    }`}>
                      <span className="text-sm">📝</span>
                      <div>
                        <p className="font-bold text-[11px]">Book / Create Orders</p>
                        <p className="text-[9px] opacity-75">{worker.canCreateOrder ? 'Allowed on Portal' : 'No Permission'}</p>
                      </div>
                    </div>

                    <div className={`p-2 rounded border flex items-center gap-2 ${
                      worker.canDeliverOrder 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                        : 'bg-gray-100 border-gray-200 text-gray-500'
                    }`}>
                      <span className="text-sm">🚚</span>
                      <div>
                        <p className="font-bold text-[11px]">Deliver & Cash Collection</p>
                        <p className="text-[9px] opacity-75">{worker.canDeliverOrder ? 'Allowed on Portal' : 'No Permission'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {worker.createdAt && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 font-bold flex items-center gap-1.5">
                      <FiClock className="text-gray-400" /> Registered On:
                    </span>
                    <span className="font-semibold text-gray-900 font-mono">
                      {new Date(worker.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Shortcut Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    openLedgerModal(worker);
                  }}
                  className="bg-[#0F172A] hover:bg-gray-800 text-white font-bold p-2.5 rounded text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <FiBook className="text-[#DFAC43]" /> View Khata Statement & Salary
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    openAdvanceModal(worker);
                  }}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold p-2.5 rounded text-xs transition flex items-center justify-center gap-2 border border-amber-200 cursor-pointer"
                >
                  ± Manage Worker Advance
                </button>
              </div>

            </div>
          ) : (
            /* EDIT PROFILE MODE */
            <form id="profileEditForm" onSubmit={handleSave} className="space-y-4">
              
              {/* Photo Upload & Preview */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded border border-gray-200">
                {previewImage ? (
                  <img
                    src={previewImage} 
                    alt="Preview" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#DFAC43] shadow-xs shrink-0" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#0F172A] text-[#DFAC43] flex items-center justify-center text-xl font-black uppercase shrink-0">
                    {formData.name ? formData.name[0] : 'W'}
                  </div>
                )}
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Update Profile Photo</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#0F172A] file:text-[#DFAC43] hover:file:bg-black cursor-pointer" 
                    onChange={handleFileChange} 
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Full Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required 
                      type="text" 
                      name="name" 
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 focus:border-black rounded text-xs font-semibold outline-none" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number (Login ID) *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required 
                      type="tel" 
                      name="phone" 
                      placeholder="e.g. 03001234567"
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 focus:border-black rounded text-xs font-semibold outline-none font-mono" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Change Password (Leave blank to keep current)</label>
                  <div className="relative">
                    <FiUnlock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="password" 
                      placeholder="Enter new password/pin"
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 focus:border-black rounded text-xs font-semibold outline-none" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Stitching Wage (Rs/Suit) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">PKR</span>
                    <input 
                      required 
                      type="number" 
                      name="perSuitWage" 
                      min="0"
                      className="w-full pl-11 pr-3 py-2 border border-gray-200 focus:border-black rounded text-xs font-bold outline-none" 
                      value={formData.perSuitWage} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
              </div>

              {/* Specialization & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Specialization</label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                      name="specialization" 
                      required
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 focus:border-black rounded text-xs font-bold bg-white outline-none" 
                      value={formData.specialization} 
                      onChange={handleInputChange} 
                    >
                      <option value="Complete Suit Stitcher">Complete Suit Stitcher</option>
                      <option value="Kameez Stitcher">Kameez Stitcher</option>
                      <option value="Salwar Stitcher">Salwar Stitcher</option>
                      <option value="Coat Specialist">Coat Specialist</option>
                      <option value="Cutter">Cutter</option>
                      <option value="Helper">Helper</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Residential Address</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="address" 
                      placeholder="e.g. Street 4, Tailor Market"
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 focus:border-black rounded text-xs font-semibold outline-none" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle & Permissions */}
              <div className="space-y-3 bg-gray-50 p-3.5 rounded border border-gray-200">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    id="profileIsActive"
                    className="w-4 h-4 accent-black cursor-pointer" 
                    checked={formData.isActive}
                    onChange={handleInputChange} 
                  />
                  <label htmlFor="profileIsActive" className="text-xs font-bold text-gray-800 cursor-pointer">
                    Active Worker Status (Allows logging in and receiving suit assignments)
                  </label>
                </div>

                {/* Special Portal Permissions */}
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <p className="text-xs font-black text-gray-900">Extra Worker Portal Access (اختیارات):</p>
                  
                  <div className="flex items-start gap-2">
                    <input 
                      type="checkbox" 
                      name="canCreateOrder" 
                      id="profileCanCreateOrder"
                      className="w-4 h-4 accent-[#0F172A] mt-0.5 cursor-pointer" 
                      checked={formData.canCreateOrder}
                      onChange={handleInputChange} 
                    />
                    <label htmlFor="profileCanCreateOrder" className="text-xs text-gray-800 cursor-pointer">
                      <strong className="block text-gray-900">Allow Order Booking / Creation (نیا آرڈر بک کرنے کی اجازت)</strong>
                      <span className="text-[11px] text-gray-500">Worker can book customer orders directly from their dashboard.</span>
                    </label>
                  </div>

                  <div className="flex items-start gap-2">
                    <input 
                      type="checkbox" 
                      name="canDeliverOrder" 
                      id="profileCanDeliverOrder"
                      className="w-4 h-4 accent-[#0F172A] mt-0.5 cursor-pointer" 
                      checked={formData.canDeliverOrder}
                      onChange={handleInputChange} 
                    />
                    <label htmlFor="profileCanDeliverOrder" className="text-xs text-gray-800 cursor-pointer">
                      <strong className="block text-gray-900">Allow Order Delivery & Cash Collection (آرڈر ڈیلیوری و کیش کاؤنٹر کی اجازت)</strong>
                      <span className="text-[11px] text-gray-500">Worker can deliver completed suits, enter received cash, and print Receiving Slips.</span>
                    </label>
                  </div>
                </div>
              </div>

            </form>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          {!isEditing ? (
            <>
              <button 
                type="button" 
                onClick={closeModal} 
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded text-xs transition cursor-pointer"
              >
                Close
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(true);
                }} 
                className="bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] px-5 py-2 font-black rounded text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <FiEdit /> Edit Profile Details
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(false);
                }} 
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded text-xs transition cursor-pointer"
              >
                Cancel Editing
              </button>
              <button 
                type="submit" 
                form="profileEditForm" 
                disabled={isUpdating} 
                className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] px-6 py-2.5 font-black rounded text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </>
          )}
        </div>

      </div>
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
    phone: worker?.phone ? formatPhone(worker.phone) : '',
    password: '', // Password is required on create, optional on edit
    perSuitWage: worker?.perSuitWage || '',
    advanceAmount: worker?.advanceAmount || '0',
    address: worker?.address || '',
    specialization: worker?.specialization || 'Complete Suit Stitcher',
    isActive: worker?.isActive !== undefined ? worker.isActive : true,
    canCreateOrder: Boolean(worker?.canCreateOrder),
    canDeliverOrder: Boolean(worker?.canDeliverOrder)
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

    if (formData.password) {
      const passwordStatus = validatePassword(formData.password);
      if (!passwordStatus.isValid) {
        toast.error(passwordStatus.error);
        return;
      }
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
    payload.append('canCreateOrder', formData.canCreateOrder);
    payload.append('canDeliverOrder', formData.canDeliverOrder);

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
      <div className="bg-white rounded shadow-2xl w-full max-w-xl relative flex flex-col max-h-[90vh] overflow-hidden border border-gray-150">
        
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

            {/* Portal Permissions & Status */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <p className="text-xs font-black text-gray-900">Portal Permissions (اختیارات):</p>
              
              <div className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  name="canCreateOrder" 
                  id="formCanCreateOrder"
                  className="w-4 h-4 accent-[#0F172A] mt-0.5 cursor-pointer" 
                  checked={formData.canCreateOrder}
                  onChange={handleInputChange} 
                />
                <label htmlFor="formCanCreateOrder" className="text-xs text-gray-800 cursor-pointer">
                  <strong className="block text-gray-900">Allow Order Booking (نیا آرڈر بک کرنے کی اجازت)</strong>
                  <span className="text-[11px] text-gray-500">Allows worker to create new orders on their portal.</span>
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  name="canDeliverOrder" 
                  id="formCanDeliverOrder"
                  className="w-4 h-4 accent-[#0F172A] mt-0.5 cursor-pointer" 
                  checked={formData.canDeliverOrder}
                  onChange={handleInputChange} 
                />
                <label htmlFor="formCanDeliverOrder" className="text-xs text-gray-800 cursor-pointer">
                  <strong className="block text-gray-900">Allow Order Delivery & Cash Collection (آرڈر ڈیلیوری و کیش کاؤنٹر)</strong>
                  <span className="text-[11px] text-gray-500">Allows worker to settle cash and deliver ready orders.</span>
                </label>
              </div>

              {isEditMode && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    id="isActive"
                    className="w-4 h-4 accent-black cursor-pointer" 
                    checked={formData.isActive}
                    onChange={handleInputChange} 
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-gray-800 cursor-pointer">
                    Worker Active (Logins & suit assignments allowed)
                  </label>
                </div>
              )}
            </div>

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
      <div className="bg-white rounded shadow-2xl w-full max-w-md border border-gray-150 overflow-hidden">
        
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

  const [subTabCurrentPage, setSubTabCurrentPage] = useState(1);
  const SUBTAB_PAGE_SIZE = 10;

  useEffect(() => {
    setSubTabCurrentPage(1);
  }, [activeSubTab]);

  const paginatedAssignedSuits = assignedSuits.slice((subTabCurrentPage - 1) * SUBTAB_PAGE_SIZE, subTabCurrentPage * SUBTAB_PAGE_SIZE);
  const paginatedStitchedSuits = stitchedSuits.slice((subTabCurrentPage - 1) * SUBTAB_PAGE_SIZE, subTabCurrentPage * SUBTAB_PAGE_SIZE);
  const paginatedLedgerData = ledgerData.slice((subTabCurrentPage - 1) * SUBTAB_PAGE_SIZE, subTabCurrentPage * SUBTAB_PAGE_SIZE);
  const paginatedPaymentsData = paymentsData.slice((subTabCurrentPage - 1) * SUBTAB_PAGE_SIZE, subTabCurrentPage * SUBTAB_PAGE_SIZE);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-4xl relative flex flex-col max-h-[90vh] overflow-hidden border border-gray-150">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-black text-black">Karigar Ledger & Salary Manager</h2>
            <p className="text-xs font-bold text-gray-500 mt-0.5">Worker Name: {worker.name} | Specialization: {worker.specialization}</p>
          </div>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black transition rounded hover:bg-gray-200 cursor-pointer">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50 px-6 pt-2 gap-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('assigned')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'assigned' ? 'border-black text-black font-extrabold' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            Assigned ({assignedSuits.length})
          </button>
          <button
            onClick={() => setActiveSubTab('stitched')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'stitched' ? 'border-black text-black font-extrabold' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            Stitched ({stitchedSuits.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'ledger' ? 'border-black text-black font-extrabold' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            Ledger / Khata
          </button>
          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'calculator' ? 'border-black text-black font-extrabold' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            Calculate & Pay Salary
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'history' ? 'border-black text-black font-extrabold' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            Payment History
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 min-h-[50vh]">
          
          {/* 1. ASSIGNED SUITS (PENDING STITCHING) TAB */}
          {activeSubTab === 'assigned' && (
            loadingDetails ? (
              <div className="text-center py-10 text-gray-500 font-bold">Loading assignments...</div>
            ) : assignedSuits.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded text-gray-400 font-bold text-xs italic">
                No suits currently assigned for stitching.
              </div>
            ) : (
              <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                      <th className="p-3">Order / Suit ID</th>
                      <th className="p-3">Fabric & Suit Details</th>
                      <th className="p-3">Wearer / Customer</th>
                      <th className="p-3">Delivery Due</th>
                      <th className="p-3 text-right">Stitch Wage</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedAssignedSuits.map((suit, sIdx) => (
                      <tr key={suit.suitId || sIdx} className="hover:bg-gray-50 transition">
                        <td className="p-3">
                          <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                            #BT-{suit.orderNumber}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-black text-gray-900 block">{suit.fabricDetails}</span>
                          {suit.volumeNo && <span className="text-[10px] text-gray-500 font-medium">Vol: {suit.volumeNo}</span>}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-gray-800">{suit.wearerName || 'Customer'}</span>
                        </td>
                        <td className="p-3 font-bold text-red-600 font-sans">
                          {new Date(suit.deliveryDate).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right font-black text-gray-900 font-sans">
                          Rs {worker.perSuitWage}
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                            Assigned
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination 
                  currentPage={subTabCurrentPage}
                  totalItems={assignedSuits.length}
                  pageSize={SUBTAB_PAGE_SIZE}
                  onPageChange={setSubTabCurrentPage}
                />
              </div>
            )
          )}

          {/* 2. STITCHED SUITS (COMPLETED) TAB */}
          {activeSubTab === 'stitched' && (
            loadingDetails ? (
              <div className="text-center py-10 text-gray-500 font-bold">Loading completed suits...</div>
            ) : stitchedSuits.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded text-gray-400 font-bold text-xs italic">
                No suits marked as completed in current cycle.
              </div>
            ) : (
              <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                      <th className="p-3">Order / Suit ID</th>
                      <th className="p-3">Fabric & Suit Details</th>
                      <th className="p-3">Wearer / Customer</th>
                      <th className="p-3 text-right">Earned Wage</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedStitchedSuits.map((suit, sIdx) => (
                      <tr key={suit.suitId || sIdx} className="hover:bg-gray-50 transition">
                        <td className="p-3">
                          <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                            #BT-{suit.orderNumber}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-black text-gray-900 block">{suit.fabricDetails}</span>
                          {suit.volumeNo && <span className="text-[10px] text-gray-500 font-medium">Vol: {suit.volumeNo}</span>}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-gray-800">{suit.wearerName || 'Customer'}</span>
                        </td>
                        <td className="p-3 text-right font-black text-green-600 font-sans">
                          + Rs {worker.perSuitWage}
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-green-100 text-green-800 border border-green-200 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                            Stitched
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination 
                  currentPage={subTabCurrentPage}
                  totalItems={stitchedSuits.length}
                  pageSize={SUBTAB_PAGE_SIZE}
                  onPageChange={setSubTabCurrentPage}
                />
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
                    {paginatedLedgerData.map(entry => (
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
                                className="text-blue-600 hover:text-blue-850 font-bold cursor-pointer"
                                title="Edit Entry"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteEntry(entry._id)}
                                className="text-red-600 hover:text-red-800 font-bold cursor-pointer"
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
                <Pagination 
                  currentPage={subTabCurrentPage}
                  totalItems={ledgerData.length}
                  pageSize={SUBTAB_PAGE_SIZE}
                  onPageChange={setSubTabCurrentPage}
                />
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
                  className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider shadow cursor-pointer"
                >
                  {calculateSalaryMutation.isPending ? 'Calculating...' : 'Calculate Wages'}
                </button>
              </form>

              {calcResult && (
                <div className="border border-gray-200 rounded p-6 bg-white shadow-sm space-y-6">
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
                      className="bg-green-600 hover:bg-green-700 text-white font-black py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider shadow whitespace-nowrap cursor-pointer"
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
                {paginatedPaymentsData.map(payment => (
                  <div key={payment._id} className="border border-gray-200 rounded p-4 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs hover:shadow-sm transition">
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
                      <div className="bg-green-50 border border-green-200 text-green-800 px-3.5 py-1.5 rounded text-center font-black font-sans">
                        Net Paid: Rs {payment.netPaid}
                      </div>
                      <button
                        onClick={() => setViewingPayment(payment)}
                        className="bg-black hover:bg-[#D4AF37] text-white hover:text-black font-bold px-3 py-1.5 rounded text-xs transition border border-black cursor-pointer"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
                <Pagination 
                  currentPage={subTabCurrentPage}
                  totalItems={paymentsData.length}
                  pageSize={SUBTAB_PAGE_SIZE}
                  onPageChange={setSubTabCurrentPage}
                />
              </div>
            )
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end shrink-0">
          <button
            onClick={closeModal}
            className="bg-black text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black border border-black px-6 py-2 rounded text-xs font-black uppercase transition cursor-pointer"
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
      <div className="bg-white rounded shadow-2xl w-full max-w-md border border-gray-150 overflow-hidden">
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
// COMPONENT: PAYMENT INVOICE RECEIPT MODAL (PRINT FRIENDLY - ADMIN)
// -------------------------------------------------------------
const PaymentReceiptModal = ({ payment, worker, closeModal }) => {
  const { data: shopSettings } = useGetShopSettings();
  const [paperSize, setPaperSize] = useState('80mm'); // '56mm' | '80mm' | 'a4'

  const currentLogo = shopSettings?.logoUrl || defaultLogo;
  const shopName = shopSettings?.shopName || 'Balouch Tailors';
  const tagline = shopSettings?.tagline || 'Gents Shalwar Qameez Specialist';
  const proprietor = shopSettings?.proprietor || 'Zubair Balouch';
  const primaryPhone = shopSettings?.primaryPhone || '0313-4389192';
  const secondaryPhone = shopSettings?.secondaryPhone || '0306-7379919';
  const address = shopSettings?.address || 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan';

  const receiptNum = `#SR-${payment._id.substring(payment._id.length - 6).toUpperCase()}`;

  const handlePrint = () => {
    try {
      const originalTitle = document.title;
      document.title = `SalaryReceipt_${receiptNum}`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    } catch (err) {
      console.error('Print error:', err);
      window.print();
    }
  };

  const containerWidthClass = 
    paperSize === '56mm' ? 'w-[56mm] max-w-[56mm] text-[10px] p-2.5' :
    paperSize === '80mm' ? 'w-[80mm] max-w-[80mm] text-xs p-4' :
    'w-full max-w-xl text-xs p-6';

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 font-sans overflow-y-auto">
      
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          @page {
            size: ${paperSize === '56mm' ? '56mm auto' : paperSize === '80mm' ? '80mm auto' : 'A4 portrait'};
            margin: ${paperSize === '56mm' ? '0mm' : paperSize === '80mm' ? '0mm' : '8mm'};
          }
          *, *:before, *:after {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, aside, footer, .no-print, .Toastify {
            display: none !important;
          }
          body * {
            visibility: hidden !important;
          }
          #admin-salary-payment-slip, #admin-salary-payment-slip * {
            visibility: visible !important;
          }
          #admin-salary-payment-slip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            width: ${paperSize === '56mm' ? '54mm' : paperSize === '80mm' ? '76mm' : '100%'} !important;
            max-width: ${paperSize === '56mm' ? '54mm' : paperSize === '80mm' ? '76mm' : '100%'} !important;
            padding: ${paperSize === '56mm' ? '1.5mm' : paperSize === '80mm' ? '2.5mm' : '0mm'} !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      <div className="bg-white rounded shadow-2xl max-w-2xl w-full border overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        
        {/* TOP CONTROLS BAR (SCREEN ONLY) */}
        <div className="bg-[#0F172A] text-white p-4 flex flex-wrap justify-between items-center gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 bg-[#DFAC43] rounded"></span>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <FiPrinter className="text-[#DFAC43]" /> Salary Payment Receipt Details
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Paper Size Selector */}
            <div className="flex bg-gray-800 p-0.5 rounded border border-gray-700 text-xs">
              <button
                type="button"
                onClick={() => setPaperSize('56mm')}
                className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                  paperSize === '56mm' ? 'bg-[#DFAC43] text-[#0F172A]' : 'text-gray-300 hover:text-white'
                }`}
              >
                56mm
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('80mm')}
                className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                  paperSize === '80mm' ? 'bg-[#DFAC43] text-[#0F172A]' : 'text-gray-300 hover:text-white'
                }`}
              >
                80mm
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('a4')}
                className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                  paperSize === 'a4' ? 'bg-[#DFAC43] text-[#0F172A]' : 'text-gray-300 hover:text-white'
                }`}
              >
                A4 (Standard)
              </button>
            </div>
{/* 
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#DFAC43] hover:bg-yellow-500 text-[#0F172A] font-black text-xs px-3.5 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <FiPrinter /> Print Slip
            </button> */}

            <button
              type="button"
              onClick={closeModal}
              className="text-gray-400 hover:text-white p-1 text-xl leading-none transition cursor-pointer"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* PRINTABLE SLIP CONTAINER */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-100 flex justify-center items-start">
          <div 
            id="admin-salary-payment-slip"
            className={`bg-white shadow-md border border-gray-300 text-black rounded space-y-3 ${containerWidthClass}`}
          >
            {/* SLIP BRAND HEADER */}
            <div className="text-center space-y-1 pb-2.5 border-b-2 border-black">
              {currentLogo && (
                <div className="flex justify-center mb-1">
                  <img 
                    src={currentLogo} 
                    alt={shopName} 
                    className={paperSize === '56mm' ? 'h-8 max-w-[90px] object-contain' : paperSize === '80mm' ? 'h-10 max-w-[120px] object-contain' : 'h-12 max-w-[140px] object-contain'} 
                  />
                </div>
              )}
              
              <h2 className={`font-black tracking-wider uppercase text-black leading-tight ${
                paperSize === '56mm' ? 'text-xs sm:text-sm' : paperSize === '80mm' ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
              }`}>
                {shopName}
              </h2>
              
              <p className={`font-bold tracking-widest text-gray-500 uppercase -mt-0.5 ${
                paperSize === '56mm' ? 'text-[7px]' : paperSize === '80mm' ? 'text-[8px]' : 'text-xs'
              }`}>
                {tagline}
              </p>
              
              <div className="pt-1">
                <span className="inline-block bg-[#0F172A] text-white text-[9px] sm:text-[10px] font-black px-3 py-0.5 uppercase tracking-widest rounded-xs">
                  KARIGAR SALARY PAYMENT RECEIPT
                </span>
              </div>
            </div>

            {/* RECEIPT & SETTLEMENT METADATA */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span className="text-gray-600">Receipt No:</span>
                <span className="font-black font-sans bg-gray-100 px-1.5 py-0.2 rounded border border-gray-300">
                  {receiptNum}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Date:</span>
                <span className="font-black font-sans text-gray-900">{new Date(payment.paymentDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Settlement Period:</span>
                <span className="font-bold font-sans">
                  {new Date(payment.startDate).toLocaleDateString()} - {new Date(payment.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Karigar Name:</span>
                <span className="font-black text-gray-900">{worker.name}</span>
              </div>
              {worker.specialization && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialization:</span>
                  <span className="font-bold text-gray-800">{worker.specialization}</span>
                </div>
              )}
            </div>

            {/* WAGES & DEDUCTIONS SUMMARY TABLE */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="font-black uppercase text-[10px] tracking-wider text-gray-700 pb-1">
                Wages & Deductions Summary
              </div>
              <table className="w-full text-left border-collapse font-medium">
                <thead>
                  <tr className="border-b border-black font-bold uppercase text-[9px] text-gray-600">
                    <th className="py-1">Description</th>
                    <th className="py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-1.5 text-gray-800">Total Stitching Wages Earned</td>
                    <td className="py-1.5 text-right font-black text-green-700 font-sans">+ Rs {Number(payment.totalEarned || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-800">Advance Deductions</td>
                    <td className="py-1.5 text-right font-black text-red-600 font-sans">- Rs {Number(payment.totalAdvance || 0).toLocaleString()}</td>
                  </tr>
                  <tr className="border-t-2 border-black font-black bg-gray-50 text-xs">
                    <td className="py-2 pl-1 uppercase font-black text-gray-900">Net Cash Paid Out</td>
                    <td className="py-2 pr-1 text-right font-black font-sans text-black">Rs {Number(payment.netPaid || 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* NOTES (IF ANY) */}
            {payment.notes && (
              <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 bg-amber-50/40 p-2 rounded text-[10px]">
                <span className="font-black uppercase text-amber-900 block tracking-wider text-[9px]">
                  Payment Notes:
                </span>
                <p className="font-semibold text-gray-800 italic leading-relaxed">
                  {payment.notes}
                </p>
              </div>
            )}

            {/* AUTHENTIC OFFICIAL PAID STAMP */}
            <div className="flex justify-center my-2.5 py-1">
              <div className="border-2 border-dashed border-green-600 text-green-700 font-black text-[11px] sm:text-xs uppercase px-4 py-1.5 rounded-lg tracking-widest inline-flex items-center gap-1.5 rotate-[-2deg] bg-green-50/70 shadow-2xs">
                <FiCheckCircle className="text-sm text-green-600" />
                <span>PAID & SETTLED</span>
              </div>
            </div>

            {/* SHOP & PROPRIETOR FOOTER */}
            <div className="pt-2.5 border-t-2 border-black text-center space-y-0.5 text-black pb-1">
              <p className="font-black text-[10px] uppercase tracking-wider">
                Proprietor: {proprietor}
              </p>
              <p className="font-black text-[10px] font-sans flex items-center justify-center gap-1">
                <FiPhone className="text-gray-700 text-[10px]" /> {primaryPhone}{secondaryPhone ? ` | ${secondaryPhone}` : ''}
              </p>
              <p className="text-[8px] text-gray-600 leading-tight">
                {address}
              </p>
            </div>
          </div>
        </div>

        {/* SCREEN FOOTER */}
        <div className="p-3.5 border-t border-gray-200 bg-gray-50 flex justify-between items-center gap-2 shrink-0 no-print">
          <span className="text-[11px] text-gray-500 font-semibold">
            Status: <strong className="text-green-700 uppercase">Paid & Settled</strong>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#0F172A] hover:bg-[#DFAC43] text-[#DFAC43] hover:text-[#0F172A] font-black px-4 py-2 rounded text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <FiPrinter /> Print Slip
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminWorkers;
