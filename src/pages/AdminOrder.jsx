import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGetCustomers } from '../hooks/useCustomers';
import { useCreateOrder, useUpdateOrder, useGetOrderById } from '../hooks/useOrder';
import { useGetTailoringServices } from '../hooks/useTailoringServices';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../Store/authStore';
import { FiArrowLeft } from 'react-icons/fi';

import OrderSuccessScreen from '../components/OrderSuccessScreen';
import OrderCustomerSection from '../components/OrderCustomerSection';
import OrderGarmentsSection from '../components/OrderGarmentsSection';
import OrderSummaryTable from '../components/OrderSummaryTable';
import OrderPaymentSection from '../components/OrderPaymentSection';
import OrderCameraModal from '../components/OrderCameraModal';
import { COMMON_TAGS } from '../components/OrderSuitCard';

export { COMMON_TAGS };

const CreateOrder = () => {
  const navigate = useNavigate();
  const { id: editOrderId } = useParams();
  const isEditMode = Boolean(editOrderId);

  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isWorker = user?.role === 'worker';
  const { data: customers = [], isLoading: loadingCustomers } = useGetCustomers();
  const { data: tailoringList = [], isLoading: loadingPricing } = useGetTailoringServices();
  const { mutate: createOrder, isPending: isCreating } = useCreateOrder();
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();
  const { data: existingOrder, isLoading: loadingExistingOrder } = useGetOrderById(editOrderId);

  const isPending = isCreating || isUpdating;

  // Garment Categories & Customizations
  const garmentServices = useMemo(() => {
    return tailoringList.filter(item => item.itemType === 'service');
  }, [tailoringList]);

  const customizationList = useMemo(() => {
    return tailoringList.filter(item => item.itemType === 'customization');
  }, [tailoringList]);

  // State Management
  const [customerId, setCustomerId] = useState(searchParams.get('customerId') || '');
  const [orderStatus, setOrderStatus] = useState('Booked');

  useEffect(() => {
    const paramCustId = searchParams.get('customerId');
    if (paramCustId) {
      setCustomerId(paramCustId);
    }
  }, [searchParams]);

  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
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

  // Pre-fill form when editing existing order
  useEffect(() => {
    if (existingOrder && isEditMode) {
      if (existingOrder.customer) {
        setCustomerId(existingOrder.customer?._id || existingOrder.customer || '');
      }
      if (existingOrder.bookingDate) {
        setBookingDate(new Date(existingOrder.bookingDate).toISOString().split('T')[0]);
      }
      if (existingOrder.deliveryDate) {
        setDeliveryDate(new Date(existingOrder.deliveryDate).toISOString().split('T')[0]);
      }
      if (existingOrder.advancePaid !== undefined) {
        setAdvancePaid(String(existingOrder.advancePaid));
      }
      if (existingOrder.discountPercent !== undefined && existingOrder.discountPercent > 0) {
        setDiscountPercent(String(existingOrder.discountPercent));
      }
      if (existingOrder.orderStatus) {
        setOrderStatus(existingOrder.orderStatus);
      }
      if (existingOrder.alterations && existingOrder.alterations.length > 0) {
        setAlterations(existingOrder.alterations);
      }
      if (existingOrder.suits && existingOrder.suits.length > 0) {
        setSuits(existingOrder.suits.map(s => ({
          ...s,
          fabricimage: s.fabricImage?.url || s.fabricimage || 'null'
        })));
      }
    }
  }, [existingOrder, isEditMode]);

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
    toast.success(`Copied specifications from Suit #${sourceIndex + 1} to Suit #${targetIndex + 1}!`);
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
    formData.append('bookingDate', bookingDate);
    formData.append('deliveryDate', deliveryDate);
    formData.append('previousKhataAdjusted', JSON.stringify(khataAdjustment));

        const suitsData = suits.map(s => ({
      ...(s._id ? { _id: s._id } : {}),
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

    formData.append('orderStatus', orderStatus);

    const fabricImageSuitIndexes = [];
    suits.forEach((suit, index) => {
      if (suit.fabricimage && suit.fabricimage !== 'null' && typeof suit.fabricimage === 'object') {
        formData.append('fabricImages', suit.fabricimage);
        fabricImageSuitIndexes.push(index); // which suit this photo belongs to
      }
    });
    formData.append('fabricImageSuitIndexes', JSON.stringify(fabricImageSuitIndexes));

    if (isEditMode) {
      updateOrder({ id: editOrderId, data: formData }, {
        onSuccess: (response) => {
          setSavedOrder(response.data || response || existingOrder); 
          window.scrollTo(0, 0);
        }
      });
    } else {
      createOrder(formData, {
        onSuccess: (response) => {
          setSavedOrder(response.data || response); 
          window.scrollTo(0, 0);
        }
      });
    }
  };

  // Success Screen
  if (savedOrder) {
    return (
      <OrderSuccessScreen
        savedOrder={savedOrder}
        isEditMode={isEditMode}
        editOrderId={editOrderId}
        isWorker={isWorker}
        navigate={navigate}
      />
    );
  }

  const handleBack = () => {
    if (isEditMode && editOrderId) {
      navigate(isWorker ? `/worker/allorders?viewOrderId=${editOrderId}` : `/admin/allorders?viewOrderId=${editOrderId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[85vh] p-2 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack} 
              type="button"
              className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded text-gray-700 hover:text-black transition shadow-xs cursor-pointer"
              title="Back"
            >
              <FiArrowLeft className="text-base" />
            </button>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-4 sm:h-5 bg-[#DFAC43] rounded inline-block"></span>
                {isEditMode 
                  ? `Edit Order #BT-${existingOrder?.orderNumber || ''}` 
                  : (isWorker ? 'Karigar Order Booking' : 'Create New Order')}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 font-medium">
                {isEditMode
                  ? 'Update garment styling, fabric notes, measurements, and order status.'
                  : (isWorker ? `Booking on behalf of: ${user?.name || 'Worker'}` : 'Configure garments, customizations, and billing details in section order.')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-gray-700 bg-white px-2.5 sm:px-3 py-1.5 rounded border border-gray-200 shadow-sm self-start sm:self-auto">
            <span>Garment Items:</span>
            <span className="bg-[#0F172A] text-[#DFAC43] px-2 py-0.5 rounded font-black">
              {suits.length} {suits.length === 1 ? 'Suit' : 'Suits'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* SECTION 1: CUSTOMER INFORMATION */}
          <OrderCustomerSection
            customers={customers}
            loadingCustomers={loadingCustomers}
            customerId={customerId}
            setCustomerId={setCustomerId}
            selectedCustomer={selectedCustomer}
            customerKhataBal={customerKhataBal}
            adjustKhata={adjustKhata}
            setAdjustKhata={setAdjustKhata}
          />

          {/* SECTION 2: GARMENTS & CUSTOMIZATIONS */}
          <OrderGarmentsSection
            suits={suits}
            alterations={alterations}
            garmentServices={garmentServices}
            customizationList={customizationList}
            customers={customers}
            commonTags={COMMON_TAGS}
            handleCopySpecs={handleCopySpecs}
            handleRemoveSuit={handleRemoveSuit}
            handleGarmentCategoryChange={handleGarmentCategoryChange}
            handleToggleSuitCustomization={handleToggleSuitCustomization}
            handleSuitChange={handleSuitChange}
            toggleTag={toggleTag}
            startCamera={startCamera}
            startListening={startListening}
            handleAddSuit={handleAddSuit}
            handleAddSuitCopy={handleAddSuitCopy}
            handleAddAlteration={handleAddAlteration}
            handleRemoveAlteration={handleRemoveAlteration}
            handleAlterationChange={handleAlterationChange}
          />

          {/* SECTION 3: ORDER SUMMARY & BILL BREAKDOWN */}
          <OrderSummaryTable
            suits={suits}
            alterations={alterations}
            rawSubtotal={rawSubtotal}
          />

          {/* SECTION 4: DELIVERY & PAYMENT SETTLEMENT */}
          <OrderPaymentSection
            bookingDate={bookingDate}
            setBookingDate={setBookingDate}
            deliveryDate={deliveryDate}
            setDeliveryDate={setDeliveryDate}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            discountAmount={discountAmount}
            rawSubtotal={rawSubtotal}
            khataAdjustment={khataAdjustment}
            totalAmount={totalAmount}
            advancePaid={advancePaid}
            setAdvancePaid={setAdvancePaid}
            isEditMode={isEditMode}
            orderStatus={orderStatus}
            setOrderStatus={setOrderStatus}
            isPending={isPending}
          />
        </form>

        {/* Live Camera Modal */}
        <OrderCameraModal
          cameraStream={cameraStream}
          cameraSuitIndex={cameraSuitIndex}
          videoRef={videoRef}
          stopCamera={stopCamera}
          capturePhoto={capturePhoto}
        />

      </div>
    </div>
  );
};

export default CreateOrder;
