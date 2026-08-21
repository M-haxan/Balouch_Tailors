import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiInfo, FiScissors, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Preloader from '../components/Preloader';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://bt-backend-5d1ec458f8eb.herokuapp.com/api';

const PublicSuitTrack = () => {
  const { suitId } = useParams();
  const [suit, setSuit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuitDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${BACKEND_URL}/orders/track/suit/${suitId}`);
        setSuit(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Suit details nahi mile. QR Code verify karein.');
      } finally {
        setLoading(false);
      }
    };
    if (suitId) {
      fetchSuitDetails();
    }
  }, [suitId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Preloader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 text-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-red-900/30 text-center space-y-4">
          <FiAlertCircle className="text-5xl text-red-500 mx-auto" />
          <h2 className="text-xl font-black uppercase tracking-wider text-red-500">Details Not Found</h2>
          <p className="text-sm text-gray-400 font-medium">{error}</p>
          <div className="w-16 h-1 bg-red-500 mx-auto rounded-full"></div>
        </div>
      </div>
    );
  }

  const measurements = suit.wearer?.measurements?.data || {};
  const preferences = suit.wearer?.measurements?.preferences || [];
  const staticTags = suit.staticTags || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white py-8 px-4 md:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header (Urdu/English mixed styled banner) */}
        <div className="text-center space-y-1.5 border-b-2 border-double border-gray-800 pb-4">
          <h1 className="text-2xl font-black tracking-widest text-[#D4AF37] uppercase font-serif">Balouch Tailors</h1>
          <p className="text-[15px] text-gray-300 font-bold uppercase tracking-wider">سوٹ کٹنگ اور سلائی تفصیلات</p>
          <p className="text-[10px] text-gray-500 font-bold">SUIT CUTTING & STITCHING SPECIFICATION SHEET</p>
        </div>

        {/* Master Meta Card */}
        <div className="bg-gray-900 border border-gray-850 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] text-[#D4AF37] font-black uppercase tracking-wider block">Customer / Wearer (نام)</span>
              <h2 className="text-xl font-black text-white uppercase">{suit.wearer?.name}</h2>
              <p className="text-xs text-gray-400 font-bold font-sans mt-0.5" dir="ltr">{suit.wearer?.phone}</p>
            </div>
            <div className="bg-black/55 border border-gray-800 px-3.5 py-1.5 rounded-xl text-center">
              <span className="text-[8px] text-gray-500 font-bold block uppercase">Order ID</span>
              <span className="text-base font-black text-[#D4AF37]">#BT-{suit.orderNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-800/40 text-xs">
            <div>
              <span className="text-gray-500 font-bold block uppercase text-[8px]">Delivery Date (پردہ تاریخ)</span>
              <span className="font-extrabold text-[#D4AF37] text-sm">{new Date(suit.deliveryDate).toLocaleDateString()}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 font-bold block uppercase text-[8px]">Stitching Status</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block border mt-1 ${
                suit.stitchingStatus === 'Stitched' ? 'bg-green-950/40 border-green-800/50 text-green-400' :
                suit.stitchingStatus === 'Assigned' ? 'bg-blue-950/40 border-blue-800/50 text-blue-400' :
                'bg-yellow-950/40 border-yellow-800/50 text-yellow-400'
              }`}>
                {suit.stitchingStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Fabric & Static Design Description */}
        <div className="bg-gray-900 border border-gray-850 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider block mb-1">Fabric Details (کپڑے کی تفصیل)</span>
            <h3 className="text-base font-black text-white uppercase">{suit.fabricDetails} <span className="text-[#D4AF37] text-xs font-bold">(Vol: {suit.volumeNo})</span></h3>
          </div>

          {/* Design Tags */}
          {staticTags.length > 0 && (
            <div>
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider block mb-1.5">Design Preferences (ڈیزائننگ)</span>
              <div className="flex flex-wrap gap-1.5">
                {staticTags.map(tag => (
                  <span key={tag} className="bg-gray-950 border border-gray-800 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom Design details */}
          {suit.customDesign && (
            <div className="bg-black/40 border border-gray-850/50 rounded-xl p-3.5 space-y-1">
              <span className="text-[8px] text-[#D4AF37] font-black uppercase tracking-wider block">Special Tailor Notes (اضافی تفصیل)</span>
              <p className="text-sm font-bold text-gray-200 leading-relaxed text-right">{suit.customDesign}</p>
            </div>
          )}
        </div>

        {/* Measurements Grid (Naap) */}
        <div className="bg-gray-900 border border-gray-850 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gray-850 border-b border-gray-800 px-5 py-3.5 flex justify-between items-center bg-gray-800/40">
            <h3 className="font-black text-sm uppercase text-white tracking-wider flex items-center gap-2">
              <FiScissors className="text-[#D4AF37]" /> Size Measurements (ناپ)
            </h3>
            <span className="text-[10px] bg-[#D4AF37]/25 text-[#D4AF37] font-black border border-[#D4AF37]/30 px-2 py-0.5 rounded uppercase">
              {suit.wearer?.measurements?.category || 'Standard'}
            </span>
          </div>

          {Object.keys(measurements).length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-bold text-sm">
              <FiInfo className="text-3xl mx-auto mb-2 text-gray-600" /> Naap ki details available nahi hain.
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              <div className="grid grid-cols-2 bg-gray-950 font-black uppercase text-[10px] text-gray-500 py-2.5 px-6 border-b border-gray-800">
                <span>Measurement Field</span>
                <span className="text-right">Value (انچ)</span>
              </div>
              {Object.keys(measurements).map((field, idx) => (
                <div key={idx} className="grid grid-cols-2 py-3 px-6 text-sm font-semibold hover:bg-gray-850/30 transition">
                  <span className="text-gray-400 font-bold uppercase tracking-wider font-sans">{field}</span>
                  <span className="text-right font-black text-lg text-white font-sans">{measurements[field]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* preferences list if any */}
        {preferences.length > 0 && (
          <div className="bg-gray-900 border border-gray-850 rounded-2xl p-5 shadow-xl space-y-2">
            <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider block">Customer Personal Fit Preferences</span>
            <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1">
              {preferences.map((p, index) => (
                <li key={index} className="font-medium">{p}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default PublicSuitTrack;
