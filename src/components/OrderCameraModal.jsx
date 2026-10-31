import React from 'react';
import { FiCamera, FiX } from 'react-icons/fi';

const OrderCameraModal = ({
  cameraStream,
  cameraSuitIndex,
  videoRef,
  stopCamera,
  capturePhoto
}) => {
  if (!cameraStream || cameraSuitIndex === null) return null;

  return (
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
  );
};

export default OrderCameraModal;
