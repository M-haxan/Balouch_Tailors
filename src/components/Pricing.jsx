import React from 'react';
import { AiOutlineCheck } from 'react-icons/ai';
import { useGetPricing } from '../hooks/usePricing';

const Pricing = () => {
    // Fetching From DB 
    const { data: pricingList = [], isLoading, isError } = useGetPricing();

    return (
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden" id="pricing">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-70"></div>
                <div className="absolute top-40 -left-20 w-72 h-72 bg-gray-100 rounded-full blur-3xl opacity-70"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 max-w-6xl">
                <div className="text-center mb-10 sm:mb-16">
                    <h2 className="text-xs sm:text-sm font-bold tracking-widest text-[#D4AF37] uppercase mb-2 sm:mb-3">Tailoring Rates</h2>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 font-serif">Pricing List</h3>
                    <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-[#DFAC43] to-[#F5D77F] mx-auto rounded-full"></div>
                </div>

                <div className="max-w-4xl mx-auto bg-white shadow-xl sm:shadow-2xl rounded-xl overflow-hidden border border-gray-100 transform hover:-translate-y-1 transition-transform duration-500">
                    <div className="bg-[#0F172A] text-[#DFAC43] px-4 sm:px-8 py-3.5 sm:py-5 flex justify-between items-center">
                        <h4 className="text-xs sm:text-base md:text-lg font-black uppercase tracking-wider">Service Description</h4>
                        <h4 className="text-xs sm:text-base md:text-lg font-black uppercase tracking-wider">Rate (Rs)</h4>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                        {/* Loading aur Error Status */}
                        {isLoading && (
                            <div className="px-4 sm:px-8 py-10 text-center text-gray-500 font-medium text-xs sm:text-sm">
                                Loading pricing details...
                            </div>
                        )}
                        
                        {isError && (
                            <div className="px-4 sm:px-8 py-10 text-center text-red-500 font-medium text-xs sm:text-sm">
                                Failed to load pricing. Please try again.
                            </div>
                        )}

                        {!isLoading && !isError && pricingList.length === 0 && (
                            <div className="px-4 sm:px-8 py-10 text-center text-gray-400 text-xs sm:text-sm">
                                No pricing details available yet.
                            </div>
                        )}

                        {/* Mapping on data */}
                        {!isLoading && !isError && pricingList.map((item) => (
                            <div 
                                key={item._id}
                                className="px-4 sm:px-8 py-3.5 sm:py-5 flex justify-between items-start sm:items-center gap-3 hover:bg-gray-50/80 transition-colors duration-300 group"
                            >
                                <div className="flex items-start sm:items-center gap-2.5 sm:gap-4 min-w-0">
                                    <AiOutlineCheck className="text-base sm:text-lg text-[#DFAC43] shrink-0 mt-0.5 sm:mt-0" />
                                    <div>
                                        {/* DB Service Name */}
                                        <span className="text-xs sm:text-base md:text-lg font-bold text-gray-900 block">{item.serviceName}</span>
                                        {/* Description */}
                                        {item.description && (
                                            <span className="text-[10px] sm:text-xs text-gray-500 block mt-0.5 leading-snug">
                                                {item.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    {/* DB Price */}
                                    <span className="text-xs sm:text-base md:text-lg font-black text-gray-900 block whitespace-nowrap font-sans">
                                        Rs. {Number(item.price !== undefined && item.price !== null ? item.price : (item.minPrice || 0)).toLocaleString()}
                                    </span>
                                    {item.deliveryTime && (
                                        <span className="text-[9px] sm:text-xs text-gray-400 font-semibold block whitespace-nowrap">
                                            {item.deliveryTime}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-50 px-4 sm:px-8 py-3.5 sm:py-4 text-center text-[10px] sm:text-xs text-gray-500 font-medium border-t border-gray-100">
                        * Prices are subject to change based on specific customer requirements and fabric complexities.
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;