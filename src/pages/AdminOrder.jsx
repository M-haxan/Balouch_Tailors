import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGetCustomers } from '../hooks/useCustomers';
import { useCreateOrder } from '../hooks/useOrder';
import { useGetTailoringServices } from '../hooks/useTailoringServices';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiTrash2, 
  FiSave, 
  FiMic, 
  FiUser, 
  FiCalendar, 
  FiCreditCard, 
  FiScissors, 
  FiX, 
  FiTag, 
  FiPercent, 
  FiLayers,
  FiUpload,
  FiCamera,
  FiImage,
  FiAlertCircle,
  FiCheckCircle,
  FiEdit,
  FiShoppingBag,
  FiCornerDownRight,
  FiCopy
} from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';

// Standard stitching tags
const COMMON_TAGS = [
  'Half Bain', 
  'Full Bain', 
  'Collar', 
  'Gol Bazu', 
  'Gol Kaf', 
  'Chor Kaf', 
  'Gol Daman',
  'Choras Daman',
  'Front Pocket', 
  '2 Side Pockets', 
  'Shalwar Pocket',
  'Gum Patti',
  'Double Silai'
];

const CreateOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: customers = [], isLoading: loadingCustomers } = useGetCustomers();
  const { data: tailoringList = [], isLoading: loadingPricing } = useGetTailoringServices();
  const { mutate: createOrder, isPending } = useCreateOrder();

  // Garment Categories & Customizations
  const garmentServices = useMemo(() => {
    return tailoringList.filter(item => item.itemType === 'service');
  }, [tailoringList]);

  const customizationList = useMemo(() => {
    return tailoringList.filter(item => item.itemType === 'customization');
  }, [tailoringList]);

  // State Management
  const [customerId, setCustomerId] = useState(searchParams.get('customerId') || '');

  useEffect(() => {
    const paramCustId = searchParams.get('customerId');
    if (paramCustId) {
      setCustomerId(paramCustId);
    }
  }, [searchParams]);

  const [deliveryDate, setDeliveryDate] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [savedOrder, setSavedOrder] = useState(null);
  const [alterations, setAlterations] = useState([]);
  const [discountPercent, setDiscountPercent] = useState('');
  const [adjustKhata, setAdjustKhata] = useState(true);

  // Live Camera Capture States
  const [cameraSuitIndex, setCameraSuitIndex] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  const selectedCustomer = customers.find(c => c._id === customerId);
  const customerKhataBal = Number(selectedCustomer?.khataBalance) || 0;
  
  // Helper to construct a default suit
  const createInitialSuit = (defaultService = null) => {
    const svc = defaultService || garmentServices[0] || { serviceName: 'Shalwar Qameez', price: 1500 };
    const baseRate = Number(svc.price) || 1500;
    return {
      serviceType: svc.serviceName || 'Shalwar Qameez',
      basePrice: baseRate,
      customizations: [],
      fabricDetails: '',
      volumeNo: '',
      staticTags: [],
      customDesign: '',
      price: baseRate,
      wearer: '',
      fabricimage: 'null'
    };
  };

  // Suits dynamic array
  const [suits, setSuits] = useState([
    { 
      serviceType: 'Shalwar Qameez', 
      basePrice: 1500, 
      customizations: [], 
      fabricDetails: '', 
      volumeNo: '', 
      staticTags: [], 
      customDesign: '', 
      price: 1500, 
      wearer: '', 
      fabricimage: 'null' 
    }
  ]);

  // Sync default service when pricingList loads
  useEffect(() => {
    if (garmentServices.length > 0 && suits.length === 1 && suits[0].basePrice === 1500 && !suits[0].fabricDetails && suits[0].customizations.length === 0) {
      const first = garmentServices[0];
      const rate = Number(first.price) || 1500;
      setSuits([
        {
          ...suits[0],
          serviceType: first.serviceName,
          basePrice: rate,
          price: rate
        }
      ]);
    }
  }, [garmentServices]);

  // Auto-apply customer preferences
  useEffect(() => {
    if (selectedCustomer?.stitchingPreferences) {
      const prefs = selectedCustomer.stitchingPreferences;
      const prefTags = prefs.tags && prefs.tags.length > 0 ? prefs.tags : [
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

      if (prefTags.length > 0 && suits.length === 1 && suits[0].staticTags.length === 0 && !suits[0].fabricDetails) {
        const extraNote = [prefs.otherPreferences, prefs.customNotes].filter(Boolean).join('. ');
        const first = garmentServices[0] || { serviceName: 'Shalwar Qameez', price: 1500 };
        const rate = Number(first.price) || 1500;
        setSuits([
          { 
            serviceType: first.serviceName,
            basePrice: rate,
            customizations: [],
            fabricDetails: '', 
            volumeNo: '', 
            staticTags: prefTags, 
            customDesign: extraNote, 
            price: rate, 
            wearer: '', 
            fabricimage: 'null' 
          }
        ]);
      }
    }
  }, [customerId, selectedCustomer, garmentServices]);

  // --- CAMERA HANDLING ---
  const startCamera = async (index) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setCameraStream(stream);
      setCameraSuitIndex(index);
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Camera permission denied or camera not found.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraSuitIndex(null);
  };

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob && cameraSuitIndex !== null) {
        const file = new File([blob], `fabric_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleSuitChange(cameraSuitIndex, 'fabricimage', file);
        toast.success("Fabric photo captured successfully!");
      }
      stopCamera();
    }, 'image/jpeg', 0.85);
  };

  // Suit Category & Customization Handlers
  const handleGarmentCategoryChange = (suitIndex, serviceName) => {
    const matched = garmentServices.find(g => g.serviceName === serviceName);
    const baseRate = Number(matched?.price || 0);

    setSuits(prevSuits => {
      const updated = [...prevSuits];
      const currentSuit = updated[suitIndex];
      const customSum = (currentSuit.customizations || []).reduce((acc, c) => acc + (Number(c.price) || 0), 0);
      updated[suitIndex] = {
        ...currentSuit,
        serviceType: serviceName,
        basePrice: baseRate,
        price: baseRate + customSum
      };
      return updated;
    });
  };

  const handleToggleSuitCustomization = (suitIndex, customItem) => {
    setSuits(prevSuits => {
      const updated = [...prevSuits];
      const currentSuit = updated[suitIndex];
      const currentCustoms = currentSuit.customizations || [];
      
      const exists = currentCustoms.some(c => c.name === customItem.serviceName);
      let newCustoms;
      if (exists) {
        newCustoms = currentCustoms.filter(c => c.name !== customItem.serviceName);
      } else {
        newCustoms = [
          ...currentCustoms,
          {
            name: customItem.serviceName,
            urduName: customItem.serviceNameUrdu || '',
            price: Number(customItem.price) || 0
          }
        ];
      }
      
      const base = Number(currentSuit.basePrice) || 0;
      const customSum = newCustoms.reduce((acc, c) => acc + (Number(c.price) || 0), 0);
      
      updated[suitIndex] = {
        ...currentSuit,
        customizations: newCustoms,
        price: base + customSum
      };
      return updated;
    });
  };

  // Calculations
  const suitsTotal = useMemo(() => {
    return suits.reduce((total, suit) => total + (Number(suit.price) || 0), 0);
  }, [suits]);

  const altsTotal = useMemo(() => {
    return alterations.reduce((total, alt) => total + (Number(alt.price) || 0), 0);
  }, [alterations]);

  const rawSubtotal = useMemo(() => {
    return suitsTotal + altsTotal;
  }, [suitsTotal, altsTotal]);

  const discountAmount = useMemo(() => {
    const pct = Number(discountPercent);
    if (!pct || pct <= 0) return 0;
    return Math.round((rawSubtotal * pct) / 100);
  }, [rawSubtotal, discountPercent]);

  const discountedSubtotal = useMemo(() => {
    return Math.max(0, rawSubtotal - discountAmount);
  }, [rawSubtotal, discountAmount]);

  const khataAdjustment = useMemo(() => {
    if (!adjustKhata || customerKhataBal === 0) return { type: 'none', amount: 0 };
    if (customerKhataBal > 0) {
      return { type: 'added_due', amount: customerKhataBal };
    } else {
      const maxDeductible = Math.min(discountedSubtotal, Math.abs(customerKhataBal));
      return { type: 'deducted_advance', amount: maxDeductible };
    }
  }, [adjustKhata, customerKhataBal, discountedSubtotal]);

  const totalAmount = useMemo(() => {
    if (khataAdjustment.type === 'added_due') {
      return discountedSubtotal + khataAdjustment.amount;
    } else if (khataAdjustment.type === 'deducted_advance') {
      return Math.max(0, discountedSubtotal - khataAdjustment.amount);
    }
    return discountedSubtotal;
  }, [discountedSubtotal, khataAdjustment]);

  const balanceAmount = useMemo(() => {
    return totalAmount - (Number(advancePaid) || 0);
  }, [totalAmount, advancePaid]);

  // Suit handlers
  const handleAddSuit = () => {
    const defaultSvc = garmentServices[0];
    setSuits([...suits, createInitialSuit(defaultSvc)]);
  };

  const handleAddSuitCopy = (sourceIndex = suits.length - 1) => {
    const src = suits[sourceIndex] || suits[0];
    if (!src) {
      handleAddSuit();
      return;
    }
    const clonedSuit = {
      serviceType: src.serviceType,
      basePrice: src.basePrice,
      customizations: JSON.parse(JSON.stringify(src.customizations || [])),
      fabricDetails: '',
      volumeNo: '',
      staticTags: [...(src.staticTags || [])],
      customDesign: src.customDesign || '',
      price: src.price,
      wearer: src.wearer || '',
      fabricimage: 'null'
    };
    setSuits([...suits, clonedSuit]);
    toast.success(`Suit #${suits.length + 1} added with same specifications as Suit #${sourceIndex + 1}!`);
  };

  const handleCopySpecs = (targetIndex, sourceIndex) => {
    const src = suits[sourceIndex];
    if (!src) return;
    setSuits(prevSuits => {
      const updated = [...prevSuits];
      updated[targetIndex] = {
        ...updated[targetIndex],
        serviceType: src.serviceType,
        basePrice: src.basePrice,
        customizations: JSON.parse(JSON.stringify(src.customizations || [])),
        staticTags: [...(src.staticTags || [])],
        customDesign: src.customDesign || '',
        wearer: src.wearer || '',
        price: src.price
      };
      return updated;
    });
    toast.success(`Suit #${sourceIndex + 1} ki specifications Suit #${targetIndex + 1} me copy ho gayi hain!`);
  };

  const handleRemoveSuit = (index) => {
    if (suits.length === 1 && alterations.length === 0) {
      toast.warning("Order requires at least one suit or alteration.");
      return;
    }
    const newSuits = suits.filter((_, i) => i !== index);
    setSuits(newSuits);
  };

  const handleAddAlteration = () => {
    setAlterations([...alterations, { description: '', price: '' }]);
  };

  const handleRemoveAlteration = (index) => {
    if (alterations.length === 1 && suits.length === 0) {
      toast.warning("Order requires at least one suit or alteration.");
      return;
    }
    const newAlterations = alterations.filter((_, i) => i !== index);
    setAlterations(newAlterations);
  };

  const handleAlterationChange = (index, field, value) => {
    const newAlterations = [...alterations];
    newAlterations[index][field] = value;
    setAlterations(newAlterations);
  };

  const handleSuitChange = (index, field, value) => {
    const newSuits = [...suits];
    newSuits[index][field] = value;
    setSuits(newSuits);
  };

  const toggleTag = (suitIndex, tag) => {
    const newSuits = [...suits];
    const currentTags = newSuits[suitIndex].staticTags || [];
    
    if (currentTags.includes(tag)) {
      newSuits[suitIndex].staticTags = currentTags.filter(t => t !== tag);
    } else {
      newSuits[suitIndex].staticTags = [...currentTags, tag];
    }
    setSuits(newSuits);
  };

  // Voice to text
  const startListening = (suitIndex) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Voice typing is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ur-PK';
    recognition.interimResults = false;
    
    toast.info("Listening...");
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const newSuits = [...suits];
      const existingText = newSuits[suitIndex].customDesign;
      newSuits[suitIndex].customDesign = existingText ? `${existingText} ${transcript}` : transcript;
      setSuits(newSuits);
      toast.success("Voice transcribed successfully.");
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      toast.error("Speech recognition error. Please try again.");
    };
  };

  // Submit Order
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!customerId) return toast.error("Please select a customer.");
    if (!deliveryDate) return toast.error("Delivery date is required.");
    if (suits.length === 0 && alterations.length === 0) {
      return toast.error("At least one suit or alteration is required.");
    }
    if (totalAmount === 0 && rawSubtotal === 0) return toast.warning("Total amount cannot be zero.");

    const formData = new FormData();
    formData.append('customer', customerId);
    formData.append('subtotal', rawSubtotal);
    formData.append('discountPercent', Number(discountPercent) || 0);
    formData.append('discountAmount', discountAmount);
    formData.append('totalAmount', totalAmount);
    formData.append('advancePaid', Number(advancePaid) || 0);
    formData.append('balanceAmount', balanceAmount);
    formData.append('deliveryDate', deliveryDate);
    formData.append('previousKhataAdjusted', JSON.stringify(khataAdjustment));

    const suitsData = suits.map(s => ({
      serviceType: s.serviceType || 'Shalwar Qameez',
      basePrice: Number(s.basePrice) || 0,
      customizations: s.customizations || [],
      fabricDetails: s.fabricDetails || `${s.serviceType || 'Suit'}`,
      volumeNo: s.volumeNo || 'Standard',
      staticTags: s.staticTags || [],
      customDesign: s.customDesign || '',
      price: Number(s.price) || 0,
      wearer: s.wearer ? s.wearer : customerId
    }));
    formData.append('suits', JSON.stringify(suitsData));

    const alterationsData = alterations.map(alt => ({
      description: alt.description,
      price: Number(alt.price) || 0,
      wearer: customerId
    }));
    formData.append('alterations', JSON.stringify(alterationsData));

    suits.forEach((suit) => {
      if (suit.fabricimage && suit.fabricimage !== 'null') {
         formData.append('fabricImages', suit.fabricimage);
      }
    });

    createOrder(formData, {
      onSuccess: (response) => {
        setSavedOrder(response.data || response); 
        window.scrollTo(0, 0);
      }
    });
  };

  // Success Screen
  if (savedOrder) {
    return (
      <div className="bg-gray-50 min-h-[85vh] p-3 sm:p-6 flex items-center justify-center">
        <div className="bg-white p-5 sm:p-8 rounded shadow-md border border-gray-200 text-center max-w-md w-full">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 text-green-600 rounded flex items-center justify-center mx-auto mb-4 sm:mb-5">
            <FiCheckCircle className="text-2xl sm:text-3xl" />
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-gray-900 mb-1.5 sm:mb-2">Order Created Successfully</h2>
          <p className="text-gray-500 mb-4 text-xs sm:text-sm font-medium">
            Order has been saved and ledger balance updated.
          </p>

          {/* Assigned Suit IDs List for Writing on Cloth */}
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-5 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Order Number:</span>
              <span className="font-black text-sm text-[#0F172A]">#BT-{savedOrder.orderNumber}</span>
            </div>
            <p className="text-[10px] font-black text-gray-600 uppercase mb-2">
              Assigned Suit IDs (Suit par likhne ke liye IDs):
            </p>
            <div className="space-y-1.5">
              {savedOrder.suits && savedOrder.suits.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-xs">
                  <span className="font-bold text-gray-800 truncate pr-2">
                    Suit #{idx + 1} ({s.serviceType || 'Shalwar Qameez'}{s.fabricDetails ? ` - ${s.fabricDetails}` : ''})
                  </span>
                  <span className="bg-[#0F172A] text-[#DFAC43] font-mono font-black px-2 py-0.5 rounded text-xs shrink-0 shadow-xs">
                    {s.suitNumber || `BT-${savedOrder.orderNumber}-${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2.5 sm:space-y-3">
            <button 
              onClick={() => navigate(`/admin/print/${savedOrder._id}`)}
              className="w-full bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] font-black h-10 sm:h-11 rounded transition shadow-sm flex justify-center items-center gap-2 text-xs sm:text-sm"
            >
              <FiScissors /> Print Invoice Slip
            </button>
            
            <button 
              onClick={() => {
                setSavedOrder(null);
                setSuits([createInitialSuit(garmentServices[0])]);
                setDiscountPercent('');
                setAdvancePaid('');
                setCustomerId('');
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold h-10 sm:h-11 rounded transition text-xs sm:text-sm"
            >
              + Create Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[85vh] p-2 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-4 sm:h-5 bg-[#DFAC43] rounded inline-block"></span>
              Create New Order
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 font-medium">
              Configure garments, customizations, and billing details in section order.
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-gray-700 bg-white px-2.5 sm:px-3 py-1.5 rounded border border-gray-200 shadow-sm self-start sm:self-auto">
            <span>Garment Items:</span>
            <span className="bg-[#0F172A] text-[#DFAC43] px-2 py-0.5 rounded font-black">
              {suits.length} {suits.length === 1 ? 'Suit' : 'Suits'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          
          {/* ============================================================== */}
          {/* ROW 1: SECTION 1 - CUSTOMER INFORMATION                        */}
          {/* ============================================================== */}
          <div className="bg-white p-3.5 sm:p-5 rounded border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                <span className="w-5 h-5 rounded bg-amber-100 text-[#DFAC43] flex items-center justify-center text-xs">
                  <FiUser />
                </span>
                1. Customer Information
              </h3>
              {selectedCustomer && (
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  ID: {selectedCustomer._id.slice(-6)}
                </span>
              )}
            </div>

            {loadingCustomers ? (
              <div className="text-xs text-gray-500 font-bold py-2">Loading customer list...</div>
            ) : (
              <select 
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-semibold text-gray-800 bg-white outline-none transition"
              >
                <option value="">-- Select Customer --</option>
                {customers.map(c => {
                  const bal = Number(c.khataBalance) || 0;
                  const balBadge = bal > 0 ? ` [Due: Rs ${bal}]` : bal < 0 ? ` [Credit: Rs ${Math.abs(bal)}]` : '';
                  return (
                    <option key={c._id} value={c._id}>
                      {c.name} - {c.phone}{balBadge}
                    </option>
                  );
                })}
              </select>
            )}

            {/* Khata Adjustment Alert Banner */}
            {selectedCustomer && customerKhataBal !== 0 && (
              <div className={`mt-3 p-2.5 sm:p-3 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                customerKhataBal > 0 
                  ? 'bg-red-50 border-red-200 text-red-900' 
                  : 'bg-green-50 border-green-200 text-green-900'
              }`}>
                <div className="flex items-start sm:items-center gap-2">
                  {customerKhataBal > 0 ? (
                    <FiAlertCircle className="text-base text-red-600 shrink-0 mt-0.5 sm:mt-0" />
                  ) : (
                    <FiCheckCircle className="text-base text-green-600 shrink-0 mt-0.5 sm:mt-0" />
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                      {customerKhataBal > 0 ? 'Outstanding Ledger Due' : 'Advance Credit Balance'}
                    </span>
                    <p className="text-xs sm:text-sm font-bold">
                      {customerKhataBal > 0 
                        ? `Rs ${customerKhataBal.toLocaleString()} pending from previous orders` 
                        : `Rs ${Math.abs(customerKhataBal).toLocaleString()} advance credit available`}
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer bg-white px-2.5 sm:px-3 py-1.5 rounded border border-gray-200 shadow-sm shrink-0 self-start sm:self-auto">
                  <input 
                    type="checkbox" 
                    checked={adjustKhata} 
                    onChange={(e) => setAdjustKhata(e.target.checked)}
                    className="w-4 h-4 text-black rounded accent-[#DFAC43] cursor-pointer"
                  />
                  <span>
                    {customerKhataBal > 0 ? 'Add to Bill (+)' : 'Deduct from Bill (-)'}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* ROW 2: SECTION 2 - GARMENTS & CUSTOMIZATIONS                   */}
          {/* ============================================================== */}
          <div className="bg-white p-3.5 sm:p-5 rounded border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3.5 sm:mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                <span className="w-5 h-5 rounded bg-amber-100 text-[#DFAC43] flex items-center justify-center text-xs">
                  <FiScissors />
                </span>
                2. Garments & Customizations
              </h3>
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-500">
                {suits.length} {suits.length === 1 ? 'Garment' : 'Garments'}
              </span>
            </div>

            {/* List of Suits */}
            <div className="space-y-4">
              {suits.map((suit, index) => {
                const suitCustoms = suit.customizations || [];
                const customTotal = suitCustoms.reduce((sum, c) => sum + (Number(c.price) || 0), 0);
                const currentBasePrice = Number(suit.basePrice) || 0;
                const hasFabricImage = suit.fabricimage && suit.fabricimage !== 'null';

                return (
                  <div key={index} className="border border-gray-200 rounded p-3 sm:p-4 bg-gray-50/70 relative">
                    
                    {/* Suit Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="bg-[#0F172A] text-[#DFAC43] text-xs font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded">
                          Suit #{index + 1}
                        </span>
                        <span className="font-black text-gray-900 text-xs sm:text-sm">
                          {suit.serviceType || 'Garment'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleCopySpecs(index, index - 1)}
                            className="bg-amber-100 hover:bg-[#DFAC43] hover:text-[#0F172A] text-amber-900 border border-amber-300 text-[11px] font-black px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            title={`Suit #${index} ke tamam styles, tags, add-ons aur instructions is suit me copy karein`}
                          >
                            <FiCopy /> Same as Suit #{index}
                          </button>
                        )}

                        <div className="bg-white border border-gray-200 px-2 sm:px-2.5 py-1 rounded shadow-sm flex items-center gap-1.5 text-xs">
                          <span className="text-[10px] font-bold text-gray-500 hidden sm:inline">
                            Base (Rs {currentBasePrice}) + Add-ons (Rs {customTotal}) =
                          </span>
                          <span className="font-black text-gray-900 font-sans">
                            Rs {suit.price}
                          </span>
                        </div>

                        {suits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSuit(index)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 sm:p-1.5 rounded transition"
                            title="Remove Suit"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Step A & B: Category & Customization Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 bg-white p-2.5 sm:p-3 rounded border border-gray-200">
                      
                      {/* Garment Category Dropdown */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                            <FiLayers className="text-[#DFAC43]" /> Garment Category:
                          </label>
                        </div>

                        <select
                          value={suit.serviceType || ''}
                          onChange={(e) => handleGarmentCategoryChange(index, e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-semibold text-gray-800 bg-white outline-none transition"
                        >
                          {garmentServices.length === 0 ? (
                            <option value="Shalwar Qameez">Shalwar Qameez</option>
                          ) : (
                            garmentServices.map(service => {
                              const urdu = service.serviceNameUrdu ? ` (${service.serviceNameUrdu})` : '';
                              return (
                                <option key={service._id} value={service.serviceName}>
                                  {service.serviceName}{urdu}
                                </option>
                              );
                            })
                          )}
                        </select>
                      </div>

                      {/* Add Customization Dropdown */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                            <FiTag className="text-[#DFAC43]" /> Add-on Customization:
                          </label>
                          {suitCustoms.length > 0 && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {suitCustoms.length} Selected (+Rs {customTotal})
                            </span>
                          )}
                        </div>

                        <select
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const item = customizationList.find(c => c.serviceName === val);
                              if (item) handleToggleSuitCustomization(index, item);
                            }
                          }}
                          className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-semibold text-gray-700 bg-white outline-none transition"
                        >
                          <option value="">Select Customization</option>
                          {customizationList.map(customItem => {
                            const isAlready = suitCustoms.some(c => c.name === customItem.serviceName);
                            const addPrice = Number(customItem.price) || 0;
                            const urdu = customItem.serviceNameUrdu ? ` (${customItem.serviceNameUrdu})` : '';
                            return (
                              <option 
                                key={customItem._id} 
                                value={customItem.serviceName}
                                className={isAlready ? 'font-bold text-amber-600' : ''}
                              >
                                {isAlready ? 'Selected: ' : '+ '}{customItem.serviceName}{urdu} (+Rs {addPrice})
                              </option>
                            );
                          })}
                        </select>

                        {/* Active Customization Badges */}
                        {suitCustoms.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {suitCustoms.map((c, cIdx) => (
                              <span 
                                key={cIdx} 
                                className="inline-flex items-center gap-1 bg-[#0F172A] text-[#DFAC43] px-2 py-0.5 rounded text-[11px] font-bold shadow-sm"
                              >
                                <span>{c.name} (+Rs {c.price})</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSuitCustomization(index, { serviceName: c.name, price: c.price })}
                                  className="text-gray-400 hover:text-red-400 font-black text-xs ml-1"
                                  title="Remove"
                                >
                                  <FiX />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Fabric Details, Vol # & Suit Price Row - Distributed evenly on all screen sizes */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 mb-3">
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Fabric & Color</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Black Wash-n-Wear, White Boski" 
                          value={suit.fabricDetails} 
                          onChange={(e) => handleSuitChange(index, 'fabricDetails', e.target.value)} 
                          className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-medium bg-white outline-none" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:col-span-6">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Vol #</label>
                          <input 
                            type="text" 
                            placeholder="Vol-01" 
                            value={suit.volumeNo} 
                            onChange={(e) => handleSuitChange(index, 'volumeNo', e.target.value)} 
                            className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-medium bg-white outline-none" 
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">Suit Price (Rs)</label>
                          <input 
                            type="number" 
                            min="0" 
                            placeholder="0" 
                            value={suit.price} 
                            onChange={(e) => handleSuitChange(index, 'price', e.target.value)} 
                            onWheel={(e) => e.target.blur()} 
                            className="w-full h-10 px-3 border-2 border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-black text-gray-900 bg-white outline-none" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fabric Sample Selection (Gallery / Camera Options) */}
                    <div className="bg-white p-2.5 sm:p-3 rounded border border-gray-200 mb-3">
                      <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                        Fabric Sample Photo (Camera / Gallery):
                      </label>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Option 1: File / Gallery Upload */}
                        <label className="cursor-pointer flex-1 min-w-[120px] sm:flex-initial h-10 px-3 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 shadow-sm transition">
                          <FiImage className="text-gray-500 text-sm" />
                          <span>Gallery / Files</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleSuitChange(index, 'fabricimage', e.target.files[0]);
                              }
                            }}
                            className="hidden" 
                          />
                        </label>

                        {/* Option 2: Live Camera Capture */}
                        <button
                          type="button"
                          onClick={() => startCamera(index)}
                          className="flex-1 min-w-[120px] sm:flex-initial h-10 px-3 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 shadow-sm transition"
                        >
                          <FiCamera className="text-[#DFAC43] text-sm" />
                          <span>Capture Photo</span>
                        </button>

                        {/* Active Image Indicator / Thumbnail */}
                        {hasFabricImage && (
                          <div className="w-full sm:w-auto flex items-center gap-2 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded text-xs text-green-800">
                            {suit.fabricimage instanceof Blob && (
                              <img 
                                src={URL.createObjectURL(suit.fabricimage)} 
                                alt="Sample preview" 
                                className="w-7 h-7 object-cover rounded border border-green-300 shrink-0"
                              />
                            )}
                            <span className="font-bold text-[11px] truncate max-w-[150px]">
                              {suit.fabricimage.name || 'Photo Attached'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSuitChange(index, 'fabricimage', 'null')}
                              className="text-red-500 hover:text-red-700 font-bold ml-auto p-0.5"
                              title="Remove photo"
                            >
                              <FiX />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Wearer Dropdown */}
                    <div className="bg-white p-2.5 sm:p-3 rounded border border-gray-200 mb-3">
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Wearer Assignment:
                      </label>
                      <select
                        value={suit.wearer || ''}
                        onChange={(e) => handleSuitChange(index, 'wearer', e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs sm:text-sm font-medium bg-gray-50 outline-none"
                      >
                        <option value="">-- Main Customer (Default) --</option>
                        {customers.map(c => (
                          <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>
                        ))}
                      </select>
                    </div>

                    {/* Smart Tags & Voice Note */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-gray-600">
                        Design Specifications:
                      </label>

                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_TAGS.map(tag => {
                          const isSelected = (suit.staticTags || []).includes(tag);
                          return (
                            <button
                              type="button"
                              key={tag}
                              onClick={() => toggleTag(index, tag)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded border transition-all ${
                                isSelected
                                  ? 'bg-black text-[#DFAC43] border-black shadow-sm'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>

                      <div className="relative">
                        <textarea
                          rows="2"
                          placeholder="Special stitching instructions or voice notes..."
                          value={suit.customDesign}
                          onChange={(e) => handleSuitChange(index, 'customDesign', e.target.value)}
                          className="w-full border border-gray-300 focus:border-[#DFAC43] rounded p-2.5 pr-11 text-xs font-medium resize-none bg-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => startListening(index)}
                          title="Voice Typing"
                          className="absolute right-2.5 top-2.5 text-[#0F172A] bg-[#DFAC43] hover:bg-black hover:text-[#DFAC43] p-1.5 rounded shadow-sm transition-all"
                        >
                          <FiMic className="text-sm" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Alterations Sub-Section */}
            {alterations.length > 0 && (
              <div className="space-y-3 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-200">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded bg-purple-600"></span>
                  Alterations ({alterations.length})
                </h4>
                {alterations.map((alt, index) => (
                  <div key={index} className="border border-gray-200 rounded p-2.5 sm:p-3 bg-gray-50 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveAlteration(index)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"
                      title="Remove alteration"
                    >
                      <FiX className="text-sm" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 pr-5 sm:pr-6">
                      <div className="sm:col-span-8">
                        <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Shalwar Length Alteration"
                          value={alt.description}
                          onChange={(e) => handleAlterationChange(index, 'description', e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs font-medium bg-white outline-none"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Price (Rs)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={alt.price}
                          onChange={(e) => handleAlterationChange(index, 'price', e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 focus:border-[#DFAC43] rounded text-xs font-bold bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-4 sm:mt-5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleAddSuit}
                className="flex-1 sm:flex-initial bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black h-10 px-3 sm:px-4 rounded transition text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FiPlus /> Add Blank Suit
              </button>

              {suits.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleAddSuitCopy(suits.length - 1)}
                  className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-black font-black h-10 px-3 sm:px-4 rounded transition text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  title="Add new suit pre-filled with the same specifications and styling"
                >
                  <FiCopy /> + Add Suit (Same Specs as Above)
                </button>
              )}

              <button
                type="button"
                onClick={handleAddAlteration}
                className="flex-1 sm:flex-initial bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold h-10 px-3 sm:px-4 rounded transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FiPlus /> Add Alteration
              </button>
            </div>

          </div>

          {/* ============================================================== */}
          {/* ROW 3: SECTION 3 - ORDER SUMMARY & BILL BREAKDOWN TABLE        */}
          {/* ============================================================== */}
          <div className="bg-white p-3.5 sm:p-5 rounded border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                <span className="w-5 h-5 rounded bg-amber-100 text-[#DFAC43] flex items-center justify-center text-xs">
                  <FaMoneyBillWave />
                </span>
                3. Order Summary
              </h3>
              <span className="text-[10px] sm:text-[11px] font-black text-[#0F172A] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Subtotal: Rs {rawSubtotal.toLocaleString()}
              </span>
            </div>

            <div className="border border-gray-200 rounded overflow-hidden bg-gray-50/40">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[300px]">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-2.5 sm:px-3">Item / Service Details</th>
                      <th className="py-2.5 px-2 text-center w-12 sm:w-16">Qty</th>
                      <th className="py-2.5 px-2.5 sm:px-3 text-right w-24 sm:w-32">Amount (Rs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white font-medium">
                    {suits.map((suit, suitIdx) => {
                      const suitCustoms = suit.customizations || [];
                      const baseRate = Number(suit.basePrice || 0);

                      return (
                        <React.Fragment key={`suit-${suitIdx}`}>
                          {/* Suit Base Garment Row */}
                          <tr className="hover:bg-gray-50 transition bg-white">
                            <td className="py-2.5 px-2.5 sm:px-3">
                              <div className="font-bold text-gray-900 text-xs">
                                Suit #{suitIdx + 1}: {suit.serviceType || 'Garment'}
                              </div>
                              {suit.fabricDetails && (
                                <div className="text-[10px] text-gray-500">
                                  Fabric: {suit.fabricDetails} {suit.volumeNo ? `(${suit.volumeNo})` : ''}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-center font-bold text-gray-600 text-xs">1</td>
                            <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-xs text-gray-900 font-sans">
                              Rs {baseRate.toLocaleString()}
                            </td>
                          </tr>

                          {/* Individual Customization Rows */}
                          {suitCustoms.map((cust, cIdx) => (
                            <tr key={`suit-${suitIdx}-cust-${cIdx}`} className="bg-amber-50/30">
                              <td className="py-2 px-2.5 sm:px-3 pl-4 sm:pl-6 text-[11px] text-gray-700 flex items-center gap-1">
                                <FiCornerDownRight className="text-amber-600 shrink-0" />
                                <span>Add-on: {cust.name}</span>
                              </td>
                              <td className="py-2 px-2 text-center text-[10px] text-gray-500">1</td>
                              <td className="py-2 px-2.5 sm:px-3 text-right font-bold text-[11px] text-gray-800 font-sans">
                                +Rs {Number(cust.price || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}

                    {alterations.map((alt, idx) => (
                      <tr key={`alt-${idx}`} className="hover:bg-gray-50 transition bg-white">
                        <td className="py-2.5 px-2.5 sm:px-3">
                          <span className="font-bold text-gray-800 text-xs">
                            Alteration: {alt.description || 'Alteration Work'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-gray-600 text-xs">1</td>
                        <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-xs text-gray-900 font-sans">
                          Rs {Number(alt.price || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-black text-xs border-t border-gray-200">
                    <tr>
                      <td colSpan="2" className="py-2.5 px-2.5 sm:px-3 text-right text-gray-600">Gross Subtotal:</td>
                      <td className="py-2.5 px-2.5 sm:px-3 text-right text-xs sm:text-sm text-[#0F172A] font-sans font-black">
                        Rs {rawSubtotal.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* ROW 4: SECTION 4 - DELIVERY, DISCOUNT & BILL SETTLEMENT        */}
          {/* ============================================================== */}
          <div className="bg-[#0F172A] text-white p-3.5 sm:p-5 rounded border border-gray-800 space-y-4 sm:space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <h3 className="text-xs sm:text-sm font-bold text-[#DFAC43] uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                <FiCreditCard /> 4. Delivery & Payment Settlement
              </h3>
              <span className="text-[10px] font-bold text-gray-400">Final Step</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Delivery Date & Discount Inputs */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Delivery Due Date *
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required 
                      type="date" 
                      value={deliveryDate} 
                      onChange={(e) => setDeliveryDate(e.target.value)} 
                      className="w-full h-10 pl-9 pr-3 bg-gray-900 border border-gray-700 focus:border-[#DFAC43] text-white rounded outline-none font-medium text-xs sm:text-sm" 
                    />
                  </div>
                </div>

                {/* Discount Percentage Section */}
                <div className="bg-gray-900/90 p-2.5 sm:p-3 rounded border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                      <FiPercent className="text-[#DFAC43]" /> Special Discount (%)
                    </label>
                    {discountPercent && Number(discountPercent) > 0 && (
                      <span className="text-[11px] font-bold text-green-400">
                        - Rs {discountAmount.toLocaleString()} Saved
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-xs">%</span>
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0" 
                        value={discountPercent} 
                        onChange={(e) => setDiscountPercent(e.target.value)} 
                        className="w-full h-10 pl-3 pr-7 bg-black border border-gray-700 focus:border-[#DFAC43] text-white rounded outline-none font-bold text-xs sm:text-sm" 
                      />
                    </div>

                    {/* Quick Discount Presets */}
                    <div className="flex items-center gap-1">
                      {[5, 10, 15, 20].map(pct => (
                        <button
                          type="button"
                          key={pct}
                          onClick={() => setDiscountPercent(pct.toString())}
                          className={`flex-1 sm:flex-initial text-[11px] h-10 px-2 sm:px-2.5 rounded font-bold transition-all ${
                            discountPercent === pct.toString()
                              ? 'bg-[#DFAC43] text-[#0F172A]'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                      {discountPercent && (
                        <button
                          type="button"
                          onClick={() => setDiscountPercent('')}
                          className="text-[11px] h-10 px-2.5 rounded bg-gray-800 text-red-400 hover:bg-gray-700 font-bold"
                          title="Clear Discount"
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Totals Breakdown Card */}
              <div className="bg-gray-900/90 p-3 sm:p-4 rounded border border-gray-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Gross Subtotal:</span>
                  <span className="text-gray-200 font-bold font-sans">Rs {rawSubtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-400">
                    <span>Discount ({discountPercent}%):</span>
                    <span className="font-bold font-sans">- Rs {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {khataAdjustment.type === 'added_due' && (
                  <div className="flex justify-between items-center text-red-400">
                    <span>+ Previous Due Added:</span>
                    <span className="font-bold font-sans">+ Rs {khataAdjustment.amount.toLocaleString()}</span>
                  </div>
                )}

                {khataAdjustment.type === 'deducted_advance' && (
                  <div className="flex justify-between items-center text-green-400">
                    <span>- Advance Credit Deducted:</span>
                    <span className="font-bold font-sans">- Rs {khataAdjustment.amount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                  <span className="text-white font-black uppercase tracking-wider text-xs sm:text-sm">Net Total Bill:</span>
                  <span className="text-xl sm:text-2xl font-black text-[#DFAC43] font-sans">
                    Rs {totalAmount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center gap-2 pt-2">
                  <span className="text-gray-300 font-bold text-xs whitespace-nowrap">Advance Paid:</span>
                  <input 
                    type="number" 
                    min="0" 
                    placeholder="0" 
                    value={advancePaid} 
                    onChange={(e) => setAdvancePaid(e.target.value)} 
                    onWheel={(e) => e.target.blur()} 
                    className="w-28 sm:w-36 h-10 px-3 bg-black border border-gray-700 focus:border-[#DFAC43] text-white rounded outline-none font-bold text-right text-xs sm:text-sm" 
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                  <span className="text-white font-bold text-xs">Remaining Balance:</span>
                  <span className={`text-base sm:text-lg font-black font-sans ${balanceAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    Rs {balanceAmount.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

            {/* Save & Generate Invoice Submit Button */}
            <div className="pt-1 sm:pt-2">
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full h-11 bg-[#DFAC43] hover:bg-white text-[#0F172A] rounded font-black transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 text-xs sm:text-base"
              >
                <FiSave /> {isPending ? 'Saving Order...' : 'Save & Generate Invoice'}
              </button>
            </div>
          </div>

        </form>

        {/* Live Camera Modal */}
        {cameraStream && cameraSuitIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-[#0F172A] border border-gray-800 text-white rounded p-3 sm:p-4 max-w-lg w-full space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <h4 className="text-xs sm:text-sm font-bold text-[#DFAC43] flex items-center gap-2">
                  <FiCamera /> Capture Fabric Sample (Suit #{cameraSuitIndex + 1})
                </h4>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <div className="relative rounded overflow-hidden bg-black aspect-video flex items-center justify-center max-h-[55vh]">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="h-10 px-3.5 sm:px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="h-10 px-4 sm:px-5 bg-[#DFAC43] hover:bg-white text-[#0F172A] rounded text-xs font-black transition flex items-center gap-1.5 sm:gap-2"
                >
                  <FiCamera /> Capture Snapshot
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateOrder;
