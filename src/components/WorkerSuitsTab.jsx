import React from 'react';
import Pagination from './Pagination';
import { FiBox, FiClock, FiCheckCircle, FiFileText } from 'react-icons/fi';

const WorkerSuitsTab = ({
  activeTab,
  currentSuits = [],
  worker = {},
  searchTerm = '',
  assignedCount = 0,
  inspectionCount = 0,
  reworkCount = 0,
  completedCount = 0,
  pagination = {},
  currentPage = 1,
  setCurrentPage,
  PAGE_SIZE = 10,
  isSubmitting = false,
  setSelectedSuitForSpecs,
  handleSubmitForQC
}) => {
  return (
    <>
      {/* 1. ASSIGNED TAB (PENDING STITCHING) */}
      {activeTab === 'assigned' && (
        currentSuits.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
            <FiBox className="text-4xl text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 font-bold text-sm">
              {searchTerm ? 'No assigned suits matched your search.' : 'No pending suits assigned currently.'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Contact admin for new stitching assignments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                  <th className="p-3">Order / Suit ID</th>
                  <th className="p-3">Fabric Details</th>
                  <th className="p-3">Wearer / Customer</th>
                  <th className="p-3">Delivery Due</th>
                  <th className="p-3 text-right">Wage</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentSuits.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="p-3 whitespace-nowrap">
                      <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                        {item.suitNumber || `BT-${item.orderNumber}-${item.suitIndex || 1}`}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-black text-gray-900 block">{item.fabricDetails}</span>
                      {item.volumeNo && <span className="text-[10px] text-gray-500 font-medium">Vol: {item.volumeNo}</span>}
                    </td>
                    <td className="p-3 font-bold text-gray-800">
                      {item.wearerName || item.customerName}
                    </td>
                    <td className="p-3 font-bold text-red-600 font-sans whitespace-nowrap">
                      {new Date(item.deliveryDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right font-black text-gray-900 font-sans whitespace-nowrap">
                      Rs {worker.perSuitWage}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSuitForSpecs(item)}
                          className="bg-gray-100 hover:bg-[#0F172A] text-gray-800 hover:text-[#DFAC43] text-xs font-black px-3 py-1.5 rounded transition flex items-center gap-1 border border-gray-200 cursor-pointer"
                        >
                          <FiFileText /> Measurements & Specs
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubmitForQC(item.orderId, item.suitId)}
                          disabled={isSubmitting}
                          className="bg-black hover:bg-[#DFAC43] hover:text-[#0F172A] text-white text-xs font-black px-3.5 py-1.5 rounded transition shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <FiCheckCircle /> Submit QC
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination 
              currentPage={currentPage}
              totalItems={pagination.totalRecords || assignedCount}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )
      )}

      {/* 2. UNDER INSPECTION TAB */}
      {activeTab === 'inspection' && (
        currentSuits.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
            <FiClock className="text-4xl text-amber-400 mx-auto mb-2" />
            <p className="text-gray-500 font-bold text-sm">
              {searchTerm ? 'No suits under QC matched your search.' : 'No suits currently under Admin Inspection.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                  <th className="p-3">Order / Suit ID</th>
                  <th className="p-3">Fabric Details</th>
                  <th className="p-3">Wearer / Customer</th>
                  <th className="p-3 text-right">Wage on Hold</th>
                  <th className="p-3 text-center">QC Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentSuits.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="p-3 whitespace-nowrap">
                      <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                        {item.suitNumber || `BT-${item.orderNumber}-${item.suitIndex || 1}`}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-black text-gray-900 block">{item.fabricDetails}</span>
                      {item.volumeNo && <span className="text-[10px] text-gray-500 font-medium">Vol: {item.volumeNo}</span>}
                    </td>
                    <td className="p-3 font-bold text-gray-800">
                      {item.wearerName || item.customerName}
                    </td>
                    <td className="p-3 text-right font-black text-amber-700 font-sans whitespace-nowrap">
                      Rs {worker.perSuitWage}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded text-[10px] font-black uppercase inline-flex items-center gap-1">
                        <FiClock /> Waiting QC Approval
                      </span>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedSuitForSpecs(item)}
                        className="bg-gray-100 hover:bg-[#0F172A] text-gray-800 hover:text-[#DFAC43] text-xs font-black px-3 py-1.5 rounded transition flex items-center gap-1 border border-gray-200 cursor-pointer mx-auto"
                      >
                        <FiFileText /> Measurements & Specs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination 
              currentPage={currentPage}
              totalItems={pagination.totalRecords || inspectionCount}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )
      )}

      {/* 3. REWORK REQUIRED TAB */}
      {activeTab === 'rework' && (
        currentSuits.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
            <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
            <p className="text-gray-500 font-bold text-sm">No alterations or rework pending!</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                  <th className="p-3">Order / Suit ID</th>
                  <th className="p-3">Fabric Details</th>
                  <th className="p-3">Wearer</th>
                  <th className="p-3">Admin Alteration Instructions</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentSuits.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="p-3 whitespace-nowrap">
                      <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                        {item.suitNumber || `BT-${item.orderNumber}-${item.suitIndex || 1}`}
                      </span>
                    </td>
                    <td className="p-3 font-black text-gray-900">
                      {item.fabricDetails}
                    </td>
                    <td className="p-3 font-bold text-gray-800">
                      {item.wearerName}
                    </td>
                    <td className="p-3 text-red-900 font-bold bg-red-50/50">
                      {item.reworkNotes || 'Please correct stitching and re-submit for QC.'}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSuitForSpecs(item)}
                          className="bg-gray-100 hover:bg-[#0F172A] text-gray-800 hover:text-[#DFAC43] text-xs font-black px-3 py-1.5 rounded transition flex items-center gap-1 border border-gray-200 cursor-pointer"
                        >
                          <FiFileText /> Measurements
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubmitForQC(item.orderId, item.suitId)}
                          disabled={isSubmitting}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-3.5 py-1.5 rounded transition shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <FiCheckCircle /> Re-Submit QC
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination 
              currentPage={currentPage}
              totalItems={pagination.totalRecords || reworkCount}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )
      )}

      {/* 4. COMPLETED & APPROVED TAB */}
      {activeTab === 'completed' && (
        currentSuits.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded shadow-sm">
            <FiCheckCircle className="text-4xl text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 font-bold text-sm">No suits approved yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-black uppercase text-[10px] border-b border-gray-200">
                  <th className="p-3">Order / Suit ID</th>
                  <th className="p-3">Fabric Details</th>
                  <th className="p-3">Wearer / Customer</th>
                  <th className="p-3 text-right">Earned Wage</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentSuits.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="p-3 whitespace-nowrap">
                      <span className="bg-[#0F172A] text-[#DFAC43] font-mono text-[10px] font-black px-2 py-0.5 rounded">
                        {item.suitNumber || `BT-${item.orderNumber}-${item.suitIndex || 1}`}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-black text-gray-900 block">{item.fabricDetails}</span>
                      {item.volumeNo && <span className="text-[10px] text-gray-500 font-medium">Vol: {item.volumeNo}</span>}
                    </td>
                    <td className="p-3 font-bold text-gray-800">
                      {item.wearerName || item.customerName}
                    </td>
                    <td className="p-3 text-right font-black text-green-600 font-sans whitespace-nowrap">
                      + Rs {worker.perSuitWage}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="bg-green-100 text-green-800 border border-green-200 px-2.5 py-0.5 rounded text-[10px] font-black uppercase inline-flex items-center gap-1">
                        <FiCheckCircle /> QC Passed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination 
              currentPage={currentPage}
              totalItems={pagination.totalRecords || completedCount}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )
      )}
    </>
  );
};

export default WorkerSuitsTab;
