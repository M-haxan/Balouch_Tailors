import React, { useState } from 'react';
import { useGetCustomers } from '../hooks/useCustomers';
import { FiSearch, FiScissors, FiChevronDown, FiChevronUp, FiUser, FiPhone } from 'react-icons/fi';

const AdminMeasurements = () => {
  const { data: customers = [], isLoading } = useGetCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Jis customer par click ho, uska naap expand karne ke liye state
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);

  // Search filter (Name aur Phone dono par safely string check)
  const filteredCustomers = customers.filter(c => {
    const phoneStr = c.phone ? c.phone.toString() : '';
    const nameStr = c.name ? c.name.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    return phoneStr.includes(search) || nameStr.includes(search);
  });

  const toggleExpand = (id) => {
    if (expandedCustomerId === id) {
      setExpandedCustomerId(null); // Agar pehle se khula hai toh band kar do
    } else {
      setExpandedCustomerId(id); // Naya kholo
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 min-h-[80vh]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FiScissors className="text-[#D4AF37]" /> Measurements Directory
          </h2>
          <p className="text-sm text-gray-500 mt-1">Quick size lookup for cutting master and tailors.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Quick search by name or phone..." 
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 focus:border-black rounded-lg outline-none transition font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-bold">Loading measurement records...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500">
          No records matching your search.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => {
            const isExpanded = expandedCustomerId === customer._id;
            const hasMeasurements = customer.measurements && customer.measurements.length > 0;

            return (
              <div 
                key={customer._id} 
                className={`border rounded-xl transition-all duration-200 bg-white ${
                  isExpanded ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-400 shadow-sm'
                }`}
              >
                {/* CARD HEADER (Hamesha visible rahega) */}
                <div 
                  onClick={() => toggleExpand(customer._id)}
                  className="p-4 flex justify-between items-center cursor-pointer select-none"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    {/* Customer Name */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-black text-[#D4AF37] rounded-full flex items-center justify-center font-black text-xs">
                        {customer.name[0].toUpperCase()}
                      </div>
                      <span className="font-black text-gray-900 text-base uppercase tracking-wide">
                        {customer.name}
                      </span>
                    </div>
                    {/* Contact Info */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 font-semibold">
                      <FiPhone className="text-gray-400 shrink-0" />
                      {customer.phone}
                    </div>
                  </div>

                  {/* Right Badges & Toggle Arrow */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                      hasMeasurements 
                        ? 'bg-gray-100 text-gray-800 border-gray-200' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {hasMeasurements ? `${customer.measurements.length} Size Saved` : 'No Size'}
                    </span>
                    {isExpanded ? <FiChevronUp className="text-xl text-black" /> : <FiChevronDown className="text-xl text-gray-400" />}
                  </div>
                </div>

                {/* CARD BODY: NAAP DETAILS (Sirf tabhi khulega jab click hoga) */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-5 rounded-b-xl animate-fade-in">
                    {!hasMeasurements ? (
                      <div className="text-center py-4 text-sm font-bold text-red-500">
                        Is customer ka koi naap system mein save nahi hai. Please customer section mein ja kar add karein.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {customer.measurements.map((meas, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            {/* Category Banner */}
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                              <span className="bg-black text-[#D4AF37] text-xs font-black px-3 py-1 rounded uppercase tracking-wider">
                                {meas.category}
                              </span>
                              {meas.lastUpdated && (
                                <span className="text-[11px] text-gray-400 font-medium">
                                  Naap Date: {new Date(meas.lastUpdated).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {/* SIZES GRID (Specs Display) */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                              {Object.keys(meas.data).map((field, fIdx) => (
                                <div key={fIdx} className="bg-gray-50/50 border border-gray-100 p-2 rounded-lg text-center">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-0.5">{field}</p>
                                  <p className="text-base font-black text-black">{meas.data[field] || '-'}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminMeasurements;