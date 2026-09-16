import React, { useState, useMemo, useEffect } from 'react';
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
  FiDollarSign, 
  FiLayers,
  FiCheckCircle,
  FiCheck
} from 'react-icons/fi';

// Shop ke common smart tags
const COMMON_TAGS = [
  'Half Bain', 
  'Full Bain', 
  'Collar', 
  'Gol Bazu (گول بازو)', 
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

  // --- SEPARATE TAILORING SERVICES: 1. Garment Categories (Services) & 2. Customizations (Add-ons) ---
  const garmentServices = useMemo(() => {
    return tailoringList.filter(item => item.itemType === 'service');
  }, [tailoringList]);

  const customizationList = useMemo(() => {
    return tailoringList.filter(item => item.itemType === 'customization');
  }, [tailoringList]);

  // --- STATE MANAGEMENT ---
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
  
  // Discount Percentage State (e.g. 10 for 10%)
  const [discountPercent, setDiscountPercent] = useState('');

  // Khata Adjustment Toggle
  const [adjustKhata, setAdjustKhata] = useState(true);

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

  // Suits ki dynamic array state
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

  // Update default garment service when pricingList loads if suit is fresh
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

  // Auto-apply customer preferences when customer selected
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

  // --- SUIT CATEGORY & CUSTOMIZATION HANDLERS ---
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

  // --- FINANCIAL CALCULATIONS (Auto-magic) ---
  const suitsTotal = useMemo(() => {
    return suits.reduce((total, suit) => total + (Number(suit.price) || 0), 0);
  }, [suits]);

  const altsTotal = useMemo(() => {
    return alterations.reduce((total, alt) => total + (Number(alt.price) || 0), 0);
  }, [alterations]);

  const rawSubtotal = useMemo(() => {
    return suitsTotal + altsTotal;
  }, [suitsTotal, altsTotal]);

  // Discount Calculation based on Percentage (%)
  const discountAmount = useMemo(() => {
    const pct = Number(discountPercent);
    if (!pct || pct <= 0) return 0;
    return Math.round((rawSubtotal * pct) / 100);
  }, [rawSubtotal, discountPercent]);

  const discountedSubtotal = useMemo(() => {
    return Math.max(0, rawSubtotal - discountAmount);
  }, [rawSubtotal, discountAmount]);

  // Dynamic Khata adjustment calculation
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

  // --- SUIT ARRAY HANDLERS ---
  const handleAddSuit = () => {
    const defaultSvc = garmentServices[0];
    setSuits([...suits, createInitialSuit(defaultSvc)]);
  };

  const handleRemoveSuit = (index) => {
    if (suits.length === 1 && alterations.length === 0) {
      toast.warning("Khata khali nahi ho sakta! Kam az kam ek suit ya alteration zaroori hai.");
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
      toast.warning("Khata khali nahi ho sakta! Kam az kam ek suit ya alteration zaroori hai.");
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

  // --- SMART TAGS LOGIC ---
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

  // --- VOICE TO TEXT LOGIC (Web Speech API) 🎤 ---
  const startListening = (suitIndex) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Aapka browser Voice Typing support nahi karta. Google Chrome use karein.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ur-PK';
    recognition.interimResults = false;
    
    toast.info("Bolna shuru karein...");
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const newSuits = [...suits];
      const existingText = newSuits[suitIndex].customDesign;
      newSuits[suitIndex].customDesign = existingText ? `${existingText} ${transcript}` : transcript;
      setSuits(newSuits);
      toast.success("Awaaz text mein tabdeel ho gayi!");
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      toast.error("Awaaz clear nahi thi, dobara try karein.");
    };
  };

  // --- SUBMIT FORM ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!customerId) return toast.error("Please select a customer.");
    if (!deliveryDate) return toast.error("Delivery date is required.");
    if (suits.length === 0 && alterations.length === 0) {
      return toast.error("Kam az kam ek suit ya alteration zaroori hai.");
    }
    if (totalAmount === 0 && rawSubtotal === 0) return toast.warning("Total amount cannot be zero.");

    // FormData banana (images & multipart support)
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

    // 1. Suits ka structured data
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

    // 2. Alterations ka data 
    const alterationsData = alterations.map(alt => ({
      description: alt.description,
      price: Number(alt.price) || 0,
      wearer: customerId
    }));
    formData.append('alterations', JSON.stringify(alterationsData));

    // 3. Fabric Images
    suits.forEach((suit) => {
      if (suit.fabricimage && suit.fabricimage !== 'null') {
         formData.append('fabricImages', suit.fabricimage);
      }
    });

    // API Call
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
      <div className="bg-gray-50 min-h-[85vh] p-4 md:p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiSave className="text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-black mb-2">Order Created!</h2>
          <p className="text-gray-500 mb-8 font-medium">Khata successfully database mein save ho gaya hai.</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate(`/admin/print/${savedOrder._id}`)}
              className="w-full bg-[#DFAC43] hover:bg-[#0F172A] text-[#0F172A] hover:text-[#DFAC43] font-black py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2"
            >
              <FiScissors /> Print Slips (Customer & Master)
            </button>
            
            <button 
              onClick={() => {
                setSavedOrder(null);
                setSuits([createInitialSuit(garmentServices[0])]);
                setDiscountPercent('');
                setAdvancePaid('');
                setCustomerId('');
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition"
            >
              + Create Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[85vh] p-3 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Create New Order</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Select garment categories, add customizations, apply discount & generate invoice.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: CUSTOMER SELECTION & KHATA AUTO-ALERT */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs sm:text-sm font-bold text-[#DFAC43] uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiUser /> 1. Select Customer
            </h3>
            {loadingCustomers ? (
              <div className="text-sm text-gray-500 font-bold">Loading customers...</div>
            ) : (
              <select 
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-[#DFAC43] rounded-xl p-3 outline-none font-semibold text-gray-800 transition"
              >
                <option value="">-- Choose an existing customer --</option>
                {customers.map(c => {
                  const bal = Number(c.khataBalance) || 0;
                  const balBadge = bal > 0 ? ` [Udhar: Rs ${bal}]` : bal < 0 ? ` [Credit: Rs ${Math.abs(bal)}]` : '';
                  return (
                    <option key={c._id} value={c._id}>
                      {c.name} - {c.phone}{balBadge}
                    </option>
                  );
                })}
              </select>
            )}

            {/* Smart Khata Auto-Adjustment Banner */}
            {selectedCustomer && customerKhataBal !== 0 && (
              <div className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                customerKhataBal > 0 
                  ? 'bg-red-50/80 border-red-200 text-red-900' 
                  : 'bg-green-50/80 border-green-200 text-green-900'
              }`}>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                    {customerKhataBal > 0 ? '🔴 Previous Due (پچھلا ادھار موجود ہے)' : '🟢 Stored Credit (گاہک کے پیسے جمع ہیں)'}
                  </span>
                  <p className="text-sm font-black">
                    {customerKhataBal > 0 
                      ? `Rs ${customerKhataBal.toLocaleString()} (Pending from past orders)` 
                      : `Rs ${Math.abs(customerKhataBal).toLocaleString()} (Available advance credit)`}
                  </p>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer bg-white px-3 py-2 rounded-lg border shadow-sm shrink-0">
                  <input 
                    type="checkbox" 
                    checked={adjustKhata} 
                    onChange={(e) => setAdjustKhata(e.target.checked)}
                    className="w-4 h-4 text-black rounded accent-[#DFAC43] cursor-pointer"
                  />
                  <span>
                    {customerKhataBal > 0 
                      ? 'Include in this invoice (+)' 
                      : 'Deduct from this bill (-)'}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* SECTION 2: SUITS, GARMENT SERVICES & CUSTOMIZATIONS           */}
          {/* ============================================================== */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#DFAC43] uppercase tracking-wider flex items-center gap-2">
                  <FiScissors /> 2. Garment Selection & Customizations
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pehle category select karein (basic price add hogi), phir customization list me se add-ons select karein.
                </p>
              </div>
              <span className="text-xs font-black bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                {suits.length} {suits.length === 1 ? 'Suit' : 'Suits'}
              </span>
            </div>

            <div className="space-y-8">
              {suits.map((suit, index) => {
                const suitCustoms = suit.customizations || [];
                const customTotal = suitCustoms.reduce((sum, c) => sum + (Number(c.price) || 0), 0);
                const currentBasePrice = Number(suit.basePrice) || 0;

                return (
                  <div key={index} className="border-2 border-gray-200 rounded-2xl p-4 sm:p-6 bg-gray-50/60 relative group shadow-sm">
                    {suits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSuit(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Remove Suit"
                      >
                        <FiTrash2 />
                      </button>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#0F172A] text-[#DFAC43] text-xs font-black px-2.5 py-1 rounded-lg">
                          Suit #{index + 1}
                        </span>
                        <span className="font-black text-gray-900 text-base">
                          {suit.serviceType || 'Garment'}
                        </span>
                      </div>

                      {/* Suit Live Price Pill */}
                      <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-500">
                          Base (Rs {currentBasePrice}) + Add-ons (Rs {customTotal}) =
                        </span>
                        <span className="text-sm font-black text-black font-sans bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                          Rs {suit.price}
                        </span>
                      </div>
                    </div>

                    {/* 1 & 2: GARMENT CATEGORY & CUSTOMIZATIONS IN COMPACT DROPDOWNS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-white p-4 rounded-xl border border-gray-200">
                      
                      {/* Step A: Garment Category Dropdown */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FiLayers className="text-[#DFAC43]" /> 1. Garment Category (Base Price):
                          </label>
                          <span className="text-[11px] font-black text-black font-sans bg-gray-100 px-2 py-0.5 rounded">
                            Base: Rs {currentBasePrice.toLocaleString()}
                          </span>
                        </div>

                        <select
                          value={suit.serviceType || ''}
                          onChange={(e) => handleGarmentCategoryChange(index, e.target.value)}
                          className="w-full border-2 border-gray-200 focus:border-[#DFAC43] rounded-xl p-2.5 outline-none font-bold text-gray-800 text-xs sm:text-sm bg-gray-50/70 transition"
                        >
                          {garmentServices.length === 0 ? (
                            <option value="Shalwar Qameez">Shalwar Qameez (Default Rs 1500)</option>
                          ) : (
                            garmentServices.map(service => {
                              const rate = Number(service.price) || 0;
                              const urdu = service.serviceNameUrdu ? ` (${service.serviceNameUrdu})` : '';
                              return (
                                <option key={service._id} value={service.serviceName}>
                                  {service.serviceName}{urdu} — Rs {rate.toLocaleString()}
                                </option>
                              );
                            })
                          )}
                        </select>
                      </div>

                      {/* Step B: Add Customizations Dropdown */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FiTag className="text-[#DFAC43]" /> 2. Add Customization / Add-on:
                          </label>
                          {suitCustoms.length > 0 && (
                            <span className="text-[11px] font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {suitCustoms.length} Added (+Rs {customTotal.toLocaleString()})
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
                          className="w-full border-2 border-gray-200 focus:border-[#DFAC43] rounded-xl p-2.5 outline-none font-bold text-gray-700 text-xs sm:text-sm bg-gray-50/70 transition"
                        >
                          <option value="">-- + Select to Add Customization --</option>
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
                                {isAlready ? '✓ Added: ' : '+ '}{customItem.serviceName}{urdu} (+Rs {addPrice})
                              </option>
                            );
                          })}
                        </select>

                        {/* Selected Customization Badges with Quick Remove */}
                        {suitCustoms.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {suitCustoms.map((c, cIdx) => (
                              <span 
                                key={cIdx} 
                                className="inline-flex items-center gap-1.5 bg-[#0F172A] text-[#DFAC43] px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs"
                              >
                                <span>{c.name} (+Rs {c.price})</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSuitCustomization(index, { serviceName: c.name, price: c.price })}
                                  className="text-gray-400 hover:text-red-400 font-black text-sm ml-0.5 leading-none"
                                  title="Remove this customization"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* 3. FABRIC & DESIGN DETAILS */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Fabric & Color Details</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Black Wash-n-Wear, White Boski" 
                          value={suit.fabricDetails} 
                          onChange={(e) => handleSuitChange(index, 'fabricDetails', e.target.value)} 
                          className="w-full border border-gray-300 focus:border-black rounded-lg p-2.5 outline-none font-medium text-xs sm:text-sm bg-white" 
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Fabric Sample Photo</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleSuitChange(index, 'fabricimage', e.target.files[0])} 
                          className="w-full border border-gray-300 focus:border-black rounded-lg p-2 outline-none font-medium text-xs bg-white" 
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Design Vol #</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Vol-45" 
                          value={suit.volumeNo} 
                          onChange={(e) => handleSuitChange(index, 'volumeNo', e.target.value)} 
                          className="w-full border border-gray-300 focus:border-black rounded-lg p-2.5 outline-none font-medium text-xs sm:text-sm bg-white" 
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Suit Stitching Total (Rs)</label>
                        <input 
                          type="number" 
                          min="0" 
                          placeholder="0" 
                          value={suit.price} 
                          onChange={(e) => handleSuitChange(index, 'price', e.target.value)} 
                          onWheel={(e) => e.target.blur()} 
                          className="w-full border-2 border-gray-300 focus:border-[#DFAC43] rounded-lg p-2 outline-none font-black text-black text-sm bg-white" 
                        />
                      </div>
                    </div>

                    {/* Wearer selection */}
                    <div className="bg-white p-3 rounded-xl border border-gray-200 mb-4">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Yeh suit kiska hai? (Wearer)</label>
                      <select
                        value={suit.wearer || ''}
                        onChange={(e) => handleSuitChange(index, 'wearer', e.target.value)}
                        className="w-full border border-gray-300 focus:border-black rounded-lg p-2 outline-none text-xs sm:text-sm font-medium bg-gray-50"
                      >
                        <option value="">-- Main Customer (Jiske naam par bill hai) --</option>
                        {customers.map(c => (
                          <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>
                        ))}
                      </select>
                    </div>

                    {/* Design Instructions & Smart Tags */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-500">Design Instructions & Smart Tags</label>

                      <div className="flex flex-wrap gap-2">
                        {COMMON_TAGS.map(tag => {
                          const isSelected = (suit.staticTags || []).includes(tag);
                          return (
                            <button
                              type="button"
                              key={tag}
                              onClick={() => toggleTag(index, tag)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                                isSelected
                                  ? 'bg-black text-[#DFAC43] border-black shadow-md'
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
                          placeholder="Yahan type karein ya mic daba kar urdu mein bolein..."
                          value={suit.customDesign}
                          onChange={(e) => handleSuitChange(index, 'customDesign', e.target.value)}
                          className="w-full border border-gray-300 focus:border-black rounded-lg p-3 pr-12 outline-none font-medium resize-none text-xs sm:text-sm bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => startListening(index)}
                          title="Urdu Voice Typing"
                          className="absolute right-3 top-3 text-[#0F172A] bg-[#DFAC43] hover:bg-black hover:text-[#DFAC43] p-2 rounded-full shadow-md transition-all active:scale-95"
                        >
                          <FiMic />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alterations Section */}
            {alterations.length > 0 && (
              <div className="space-y-4 mt-6">
                <h4 className="text-xs font-black text-gray-600 uppercase tracking-wider">Alterations</h4>
                {alterations.map((alt, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50/50 relative group">
                    <button
                      type="button"
                      onClick={() => handleRemoveAlteration(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <FiX />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Alteration Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Shalwar Length Chhoti Karna"
                          value={alt.description}
                          onChange={(e) => handleAlterationChange(index, 'description', e.target.value)}
                          className="w-full border border-gray-300 focus:border-black rounded-lg p-2.5 outline-none font-medium text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Price (Rs)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={alt.price}
                          onChange={(e) => handleAlterationChange(index, 'price', e.target.value)}
                          className="w-full border border-gray-300 focus:border-black rounded-lg p-2.5 outline-none font-medium text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleAddSuit}
                className="bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black py-2.5 px-4 rounded-xl transition text-xs flex items-center gap-1.5 shadow-sm"
              >
                <FiPlus /> + Add Another Suit
              </button>

              <button
                type="button"
                onClick={handleAddAlteration}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 px-4 rounded-xl transition text-xs flex items-center gap-1.5"
              >
                <FiPlus /> + Add Alteration
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 3: ROW-WISE BILL BREAKDOWN TABLE                       */}
          {/* ============================================================== */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs sm:text-sm font-bold text-[#DFAC43] uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiDollarSign /> 3. Bill Breakdown Table (رو وائز بل کی تفصیل)
            </h3>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Item / Service Details</th>
                      <th className="py-3 px-3 w-28">Type</th>
                      <th className="py-3 px-3 text-right w-24">Rate (Rs)</th>
                      <th className="py-3 px-3 text-center w-16">Qty</th>
                      <th className="py-3 px-4 text-right w-28">Total (Rs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white font-medium">
                    {suits.map((suit, suitIdx) => {
                      const suitCustoms = suit.customizations || [];
                      const baseRate = Number(suit.basePrice || 0);

                      return (
                        <React.Fragment key={`suit-${suitIdx}`}>
                          {/* Suit Base Garment Row */}
                          <tr className="hover:bg-gray-50/70 transition bg-white">
                            <td className="py-3 px-4">
                              <span className="font-black text-gray-900 text-sm">
                                Suit #{suitIdx + 1}: {suit.serviceType || 'Garment'} (Base Stitching)
                              </span>
                              {suit.fabricDetails && (
                                <span className="text-gray-500 font-medium block text-[11px] mt-0.5">
                                  Fabric: {suit.fabricDetails} {suit.volumeNo ? `(Vol: ${suit.volumeNo})` : ''}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded">
                                Base Garment
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-black text-gray-800 font-sans">
                              Rs {baseRate.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-gray-600">1</td>
                            <td className="py-3 px-4 text-right font-black text-sm text-gray-900 font-sans">
                              Rs {baseRate.toLocaleString()}
                            </td>
                          </tr>

                          {/* Individual Customization Rows */}
                          {suitCustoms.map((cust, cIdx) => (
                            <tr key={`suit-${suitIdx}-cust-${cIdx}`} className="bg-amber-50/30 hover:bg-amber-50/60 transition">
                              <td className="py-2.5 px-4 pl-8">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-amber-700 font-black">↳</span>
                                  <span className="font-bold text-gray-800 text-xs">
                                    Suit #{suitIdx + 1} Add-on: {cust.name}
                                  </span>
                                  {cust.urduName && (
                                    <span className="text-[10px] text-gray-500">({cust.urduName})</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                  Customization
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-black text-gray-800 font-sans">
                                Rs {Number(cust.price || 0).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-gray-600">1</td>
                              <td className="py-2.5 px-4 text-right font-black text-xs text-gray-900 font-sans">
                                Rs {Number(cust.price || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}

                    {alterations.map((alt, idx) => (
                      <tr key={`alt-${idx}`} className="hover:bg-gray-50/70 transition bg-white">
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-800 text-xs">
                            Alteration: {alt.description || 'Custom Alteration Work'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded">
                            Alteration
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-gray-800 font-sans">
                          Rs {Number(alt.price || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-gray-600">1</td>
                        <td className="py-3 px-4 text-right font-black text-sm text-gray-900 font-sans">
                          Rs {Number(alt.price || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-black text-xs border-t border-gray-200">
                    <tr>
                      <td colSpan="4" className="py-3 px-4 text-right text-gray-600">Gross Subtotal:</td>
                      <td className="py-3 px-4 text-right text-base text-[#0F172A] font-sans font-black">
                        Rs {rawSubtotal.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 4: INVOICE, DISCOUNT & FINANCIAL SUMMARY               */}
          {/* ============================================================== */}
          <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl shadow-xl border border-gray-800 text-white">
            <h3 className="text-xs sm:text-sm font-bold text-[#DFAC43] uppercase tracking-wider mb-6 flex items-center gap-2">
              <FiCreditCard /> 4. Invoice, Discount & Delivery
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Dates & Discount Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Delivery Due Date *</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      required 
                      type="date" 
                      value={deliveryDate} 
                      onChange={(e) => setDeliveryDate(e.target.value)} 
                      className="w-full bg-gray-900 border border-gray-700 focus:border-[#DFAC43] text-white rounded-lg pl-10 pr-3 py-2.5 outline-none font-medium text-sm" 
                    />
                  </div>
                </div>

                {/* Discount Percentage Section */}
                <div className="bg-gray-900/90 p-4 rounded-xl border border-gray-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#DFAC43] uppercase tracking-wider flex items-center gap-1.5">
                      <FiPercent /> Special Discount (%)
                    </label>
                    {discountPercent && Number(discountPercent) > 0 && (
                      <span className="text-xs font-black text-green-400">
                        - Rs {discountAmount.toLocaleString()} Saved
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">%</span>
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g. 10" 
                        value={discountPercent} 
                        onChange={(e) => setDiscountPercent(e.target.value)} 
                        className="w-full bg-black border border-gray-700 focus:border-[#DFAC43] text-white rounded-lg pl-3 pr-8 py-2.5 outline-none font-black text-base" 
                      />
                    </div>

                    {/* Quick Discount Presets */}
                    <div className="flex items-center gap-1">
                      {[5, 10, 15, 20].map(pct => (
                        <button
                          type="button"
                          key={pct}
                          onClick={() => setDiscountPercent(pct.toString())}
                          className={`text-xs px-2.5 py-2 rounded-lg font-bold transition-all ${
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
                          className="text-xs px-2 py-2 rounded-lg bg-gray-800 text-red-400 hover:bg-gray-700 font-bold"
                          title="Clear Discount"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Card */}
              <div className="space-y-3 bg-gray-900 p-5 rounded-xl border border-gray-800 text-xs">
                <div className="flex justify-between items-center text-gray-400 font-bold">
                  <span>Gross Order Subtotal:</span>
                  <span className="text-white font-black font-sans text-sm">Rs {rawSubtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-400 font-bold">
                    <span>- Discount ({discountPercent}%):</span>
                    <span className="font-black font-sans">- Rs {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-gray-300 font-bold pt-1 border-t border-gray-800/80">
                    <span>Discounted Subtotal:</span>
                    <span className="font-black font-sans">Rs {discountedSubtotal.toLocaleString()}</span>
                  </div>
                )}

                {khataAdjustment.type === 'added_due' && (
                  <div className="flex justify-between items-center text-red-400 font-bold">
                    <span>+ Previous Udhar Added:</span>
                    <span className="font-black font-sans">+ Rs {khataAdjustment.amount.toLocaleString()}</span>
                  </div>
                )}

                {khataAdjustment.type === 'deducted_advance' && (
                  <div className="flex justify-between items-center text-green-400 font-bold">
                    <span>- Advance Credit Deducted:</span>
                    <span className="font-black font-sans">- Rs {khataAdjustment.amount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-800 text-sm">
                  <span className="text-white font-black uppercase">Net Total Bill:</span>
                  <span className="text-2xl font-black text-[#DFAC43] font-sans">Rs {totalAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center gap-4 pt-1">
                  <span className="text-gray-400 font-bold whitespace-nowrap">Advance Paid:</span>
                  <input 
                    type="number" 
                    min="0" 
                    placeholder="0" 
                    value={advancePaid} 
                    onChange={(e) => setAdvancePaid(e.target.value)} 
                    onWheel={(e) => e.target.blur()} 
                    className="w-1/2 bg-black border border-gray-700 focus:border-[#DFAC43] text-white rounded-lg px-3 py-2 outline-none font-bold text-right text-sm" 
                  />
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                  <span className="text-white font-black">Remaining Balance Due:</span>
                  <span className={`text-xl font-black font-sans ${balanceAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    Rs {balanceAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
              <button 
                type="submit" 
                disabled={isPending}
                className="bg-[#DFAC43] hover:bg-white text-[#0F172A] px-8 py-3 rounded-xl font-black transition-all shadow-lg disabled:opacity-70 flex items-center gap-2 text-base sm:text-lg"
              >
                <FiSave /> {isPending ? 'Saving Order...' : 'Generate Invoice'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
