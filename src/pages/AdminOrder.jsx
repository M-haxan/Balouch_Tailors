import React, { useState, useMemo } from 'react';
import { useGetCustomers } from '../hooks/useCustomers';
import { useCreateOrder } from '../hooks/useOrder';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiSave, FiMic, FiUser, FiCalendar, FiDollarSign, FiScissors, FiX } from 'react-icons/fi';

// Shop ke common smart tags
const COMMON_TAGS = ['Ban', 'Collar', 'Gol Kaf', 'Chor Kaf', 'Double Silai', 'Front Pocket', '2 Side Pockets', 'Shalwar Poket'];

const CreateOrder = () => {
  const navigate = useNavigate();
  const { data: customers = [], isLoading: loadingCustomers } = useGetCustomers();
  const { mutate: createOrder, isPending } = useCreateOrder();


  // --- STATE MANAGEMENT ---
  const [customerId, setCustomerId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [savedOrder, setSavedOrder] = useState(null); // Nayi state
  const [alterations, setAlterations] = useState([]);
  
  // Suits ki dynamic array state
  const [suits, setSuits] = useState([
    { fabricDetails: '', volumeNo: '', staticTags: [], customDesign: '', price: '', wearer:'', fabricimage:'null' }
  ]);

  // --- FINANCIAL CALCULATIONS (Auto-magic) ---
  const totalAmount = useMemo(() => {
    const suitsTotal = suits.reduce((total, suit) => total + (Number(suit.price) || 0), 0);
    const altsTotal = alterations.reduce((total, alt) => total + (Number(alt.price) || 0), 0);
    return suitsTotal + altsTotal; // Dono ko jama kar diya
  }, [suits, alterations]);

  const balanceAmount = useMemo(() => {
    return totalAmount - (Number(advancePaid) || 0);
  }, [totalAmount, advancePaid]);
 

  // --- SUIT ARRAY HANDLERS ---
  const handleAddSuit = () => {
    setSuits([...suits, { fabricDetails: '', volumeNo: '', staticTags: [], customDesign: '', price: '' , wearer:'' }]);
  };

  const handleRemoveSuit = (index) => {
    // Agar yeh aakhri suit hai aur ALTERATION bhi zero hai, tab delete karne se roko
    if (suits.length === 1 && alterations.length === 0) {
      toast.warning("Khata khali nahi ho sakta! Kam az kam ek suit ya alteration zaroori hai.");
      return;
    }
    const newSuits = suits.filter((_, i) => i !== index);
    setSuits(newSuits);
  };
  // handlealteration add karne ke liye
  const handleAddAlteration = () => {
    setAlterations([...alterations, { description: '', price: '' }]);
  };
  // handlealteration remove karne ke liye
  const handleRemoveAlteration = (index) => {
    // Agar yeh aakhri alteration hai, tab delete karne se roko
    if (alterations.length === 1 && suits.length === 0) {
      toast.warning("Khata khali nahi ho sakta! Kam az kam ek suit ya alteration zaroori hai.");
      return;
    }
    const newAlterations = alterations.filter((_, i) => i !== index);
    setAlterations(newAlterations);
  };
  // handlealteration change karne ke liye
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
    const currentTags = newSuits[suitIndex].staticTags;
    
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
    recognition.lang = 'ur-PK'; // Urdu set kar di
    recognition.interimResults = false;
    
    toast.info("Bolna shuru karein...");
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const newSuits = [...suits];
      // Pehle wala text aur naya bola hua text jor do
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
  // --- SUBMIT FORM ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!customerId) return toast.error("Please select a customer.");
    if (!deliveryDate) return toast.error("Delivery date is required.");
    if (suits.length === 0 && alterations.length === 0) return toast.error("Kam az kam ek suit ya alteration add karein.");
    if (totalAmount === 0) return toast.warning("Total amount cannot be zero.");

    // 🌟 THE MAGIC: FormData banana (Kyunke images bhejni hain)
    const formData = new FormData();
    
    formData.append('customer', customerId);
    formData.append('totalAmount', totalAmount);
    formData.append('advancePaid', Number(advancePaid) || 0);
    formData.append('balanceAmount', balanceAmount);
    formData.append('deliveryDate', deliveryDate);

    // 1. Suits ka data (Images ko nikal kar baqi data ko text/string bana kar bhejenge)
    const suitsData = suits.map(s => ({
      fabricDetails: s.fabricDetails,
      volumeNo: s.volumeNo,
      staticTags: s.staticTags,
      customDesign: s.customDesign,
      price: Number(s.price) || 0,
      wearer: s.wearer ? s.wearer : customerId
    }));
    formData.append('suits', JSON.stringify(suitsData)); // Stringify karna lazmi hai

    // 2. Alterations ka data 
    const alterationsData = alterations.map(alt => ({
      description: alt.description,
      price: Number(alt.price) || 0,
      wearer: customerId // Alteration bhi main customer ki taraf assign kar di
    }));
    formData.append('alterations', JSON.stringify(alterationsData));

    // 3. 🌟 IMAGES KO APPEND KARNA 🌟
    suits.forEach((suit) => {
      // Agar admin ne image select ki hai (toh usay 'fabricImages' ke naam se attach karo)
      // Yeh naam backend ke upload.array('fabricImages') se match karna chahiye
      if (suit.fabricimage && suit.fabricimage !== 'null') {
         formData.append('fabricImages', suit.fabricimage);
      }
    });

    // API Call: Ab normal payload ki jagah formData bhejenge
    createOrder(formData, {
      onSuccess: (response) => {
        setSavedOrder(response.data || response); 
        window.scrollTo(0, 0);
      }
    });
  };
// Agar order save ho gaya hai toh yeh Success Screen dikhao
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
            {/* Yeh button dabane par hum Invoice Print page par jayenge */}
            <button 
              onClick={() => navigate(`/admin/print/${savedOrder._id}`)}
              className="w-full bg-[#D4AF37] hover:bg-black text-black hover:text-[#D4AF37] font-black py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2"
            >
              <FiScissors /> Print Slips (Customer & Master)
            </button>
            
            <button 
              onClick={() => {
                setSavedOrder(null);
                setSuits([{ fabricDetails: '', volumeNo: '', staticTags: [], customDesign: '', price: '' }]);
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
    <div className="bg-gray-50 min-h-[85vh] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-black tracking-tight">Create New Order</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Book a new khata and generate invoice.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: CUSTOMER SELECTION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiUser /> 1. Select Client
            </h3>
            {loadingCustomers ? (
              <div className="text-sm text-gray-500">Loading customers...</div>
            ) : (
              <select 
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-black rounded-xl p-3 outline-none font-semibold text-gray-800 transition"
              >
                <option value="">-- Choose an existing customer --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>
                ))}
              </select>
            )}
          </div>

          {/* SECTION 2: SUITS DETAILS (DYNAMIC ARRAY) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                <FiScissors /> 2. Suits & Designs
              </h3>
            </div>

            <div className="space-y-6">
              {suits.map((suit, index) => (
                <div key={index} className="border-2 border-gray-100 rounded-xl p-5 bg-gray-50/50 relative group">
                  { 
                    <button
                      type="button"
                      onClick={() => handleRemoveSuit(index)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                    >
                      <FiTrash2 />
                    </button>
                  }

                  <h4 className="font-black text-black mb-4">Suit #{index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="md:col-span-5">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Fabric & Color</label>
                      <input required type="text" placeholder="e.g. Black Wash-n-Wear" value={suit.fabricDetails} onChange={(e) => handleSuitChange(index, 'fabricDetails', e.target.value)} className="w-full border border-gray-300 focus:border-black rounded-lg p-2.5 outline-none font-medium" />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Fabric Image</label>
                      <input type="file" accept="image/*" onChange={(e) => handleSuitChange(index, 'fabricimage', e.target.files[0])} className="w-full border border-gray-300 focus:border-black rounded-lg p-2.5 outline-none font-medium" />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Design Vol #</label>
                      <input required type="text" placeholder="e.g. Vol-45" value={suit.volumeNo} onChange={(e) => handleSuitChange(index, 'volumeNo', e.target.value)} className="w-full border border-gray-300 focus:border-black rounded-lg p-2.5 outline-none font-medium" />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Stitching Price (Rs)</label>
                      <input required type="number" min="0" placeholder="0" value={suit.price} onChange={(e) => handleSuitChange(index, 'price', e.target.value)} onWheel={(e) => e.target.blur()} className="w-full border border-gray-300 focus:border-[#D4AF37] rounded-lg p-2.5 outline-none font-black text-black" />
                    </div>
                  </div>

                  <div className="mt-3 bg-gray-100 p-3 rounded-lg border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Yeh suit kiska hai? (Wearer)</label>
                    <select
                      value={suit.wearer || ''}
                      onChange={(e) => handleSuitChange(index, 'wearer', e.target.value)}
                      className="w-full border border-gray-300 focus:border-black rounded-lg p-2 outline-none text-sm font-medium bg-white"
                    >
                      <option value="">-- Main Customer (Jiske naam par bill hai) --</option>
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-500">Design Instructions & Tags</label>

                    <div className="flex flex-wrap gap-2">
                      {COMMON_TAGS.map(tag => {
                        const isSelected = suit.staticTags.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => toggleTag(index, tag)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                              isSelected
                                ? 'bg-black text-[#D4AF37] border-black shadow-md'
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
                        className="w-full border border-gray-300 focus:border-black rounded-lg p-3 pr-12 outline-none font-medium resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => startListening(index)}
                        title="Urdu Voice Typing"
                        className="absolute right-3 top-3 text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-full shadow-md transition-transform active:scale-95"
                      >
                        <FiMic />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mt-6">
              {alterations.map((alt, index) => (
                <div key={index} className="border-2 border-gray-100 rounded-xl p-5 bg-gray-50/50 relative group">
                  <button
                    type="button"
                    onClick={() => handleRemoveAlteration(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <FiX />
                  </button>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Alteration Description</label>
                      <input
                        type="text"
                        value={alt.description}
                        onChange={(e) => handleAlterationChange(index, 'description', e.target.value)}
                        className="w-full border border-gray-300 focus:border-black rounded-lg p-2.5 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Price</label>
                      <input
                        type="number"
                        value={alt.price}
                        onChange={(e) => handleAlterationChange(index, 'price', e.target.value)}
                        className="w-full border border-gray-300 focus:border-black rounded-lg p-2.5 outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                onClick={handleAddAlteration}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 px-4 rounded-xl transition"
              >
                <FiPlus className="text-lg" /> Add Alteration
              </button>

              <button
                type="button"
                onClick={handleAddSuit}
                className="bg-[#D4AF37] hover:bg-black text-black hover:text-[#D4AF37] font-black py-2.5 px-4 rounded-xl transition"
              >
                <FiPlus className="text-lg" /> Add Another Suit
              </button>
            </div>
          </div>

          {/* SECTION 3: INVOICE & DATES */}
          <div className="bg-black p-6 rounded-2xl shadow-xl border border-gray-800 text-white">
            <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-6 flex items-center gap-2">
              <FiDollarSign /> 3. Invoice & Delivery
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Dates */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Delivery Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      required 
                      type="date" 
                      value={deliveryDate} 
                      onChange={(e) => setDeliveryDate(e.target.value)} 
                      className="w-full bg-gray-900 border border-gray-700 focus:border-[#D4AF37] text-white rounded-lg pl-10 pr-3 py-2.5 outline-none font-medium" 
                    />
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div className="space-y-4 bg-gray-900 p-5 rounded-xl border border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold">Total Bill:</span>
                  <span className="text-2xl font-black text-[#D4AF37]">Rs {totalAmount}</span>
                </div>
                
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-400 font-bold whitespace-nowrap">Advance Paid:</span>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="0" 
                    value={advancePaid} 
                    onChange={(e) => setAdvancePaid(e.target.value)} 
                    onWheel={(e) => e.target.blur()}
                    className="w-1/2 bg-black border border-gray-700 focus:border-[#D4AF37] text-white rounded-lg px-3 py-2 outline-none font-bold text-right" 
                  />
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                  <span className="text-white font-black">Remaining Balance:</span>
                  <span className={`text-xl font-black ${balanceAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    Rs {balanceAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
              <button 
                type="submit" 
                disabled={isPending}
                className="bg-[#D4AF37] hover:bg-yellow-500 text-black px-8 py-3 rounded-xl font-black transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-70 flex items-center gap-2 text-lg"
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