import React from 'react';
import { formatPhone } from '../utils/formatters';
import { FiCheckCircle, FiScissors, FiPhone } from 'react-icons/fi';

const WorkerStatsCards = ({ stats = {}, worker = {} }) => {
  return (
    <>
      {/* FINANCIAL & WORK STATUS CARDS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Earnings Card */}
        <div className="bg-black text-white p-4 rounded shadow-sm border border-gray-900 flex flex-col justify-between">
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
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-col justify-between">
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
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-col justify-between">
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
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-col justify-between">
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
      <section className="bg-white p-4 rounded border border-gray-150 shadow-sm flex flex-wrap gap-4 items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <FiScissors className="text-[#D4AF37]" />
          <span className="text-gray-500 font-semibold">Stitching Wage:</span>
          <span className="font-extrabold text-black">Rs {worker.perSuitWage} per suit</span>
        </div>
        {worker.phone && (
          <div className="flex items-center gap-2">
            <FiPhone className="text-gray-400" />
            <span className="text-gray-500 font-semibold">Phone:</span>
            <span className="font-bold text-gray-700">{formatPhone(worker.phone)}</span>
          </div>
        )}
        {worker.address && (
          <div className="w-full mt-2 pt-2 border-t border-gray-100 text-gray-500 flex items-center gap-2">
            <span className="font-semibold">Address:</span>
            <span className="font-medium text-gray-700">{worker.address}</span>
          </div>
        )}
      </section>
    </>
  );
};

export default WorkerStatsCards;
