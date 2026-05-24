// import React from 'react';
// import { AiOutlineCheck } from 'react-icons/ai';

// const pricingData = [
//     { name: 'Shalwar Qameez (Simple)', price: '1200' },
//     { name: 'Shalwar Qameez (Double Silai)', price: '1400' },
//     { name: 'Shalwar Qameez (Extra Design)', price: '1600' },
//     { name: 'Shirt', price: '1200' },
//     { name: 'Kurta', price: '1200' }
// ];

// const Pricing = () => {
//     return (
//         <section className="py-24 bg-white relative overflow-hidden" id="pricing">
//             {/* Background elements for premium feel */}
//             <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
//                 <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-70"></div>
//                 <div className="absolute top-40 -left-20 w-72 h-72 bg-gray-100 rounded-full blur-3xl opacity-70"></div>
//             </div>

//             <div className="container mx-auto px-4 relative z-10">
//                 <div className="text-center mb-16">
//                     <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-3">Tailoring Rates</h2>
//                     <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Pricing List</h3>
//                     <div className="w-24 h-1 bg-black mx-auto"></div>
//                 </div>

//                 <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100 transform hover:-translate-y-1 transition-transform duration-500">
//                     <div className="bg-black text-white px-8 py-6 flex justify-between items-center">
//                         <h4 className="text-lg md:text-xl font-bold uppercase tracking-wider">Service Description</h4>
//                         <h4 className="text-lg md:text-xl font-bold uppercase tracking-wider">Rate (Rs)</h4>
//                     </div>
//                     <div className="divide-y divide-gray-100">
//                         {pricingData.map((item, index) => (
//                             <div 
//                                 key={index} 
//                                 className="px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors duration-300 group"
//                             >
//                                 <div className="flex items-center gap-4">
//                                     <AiOutlineCheck className="text-lg text-black opacity-70 group-hover:text-green-600 transition-colors duration-300" />
//                                     <span className="text-lg font-medium text-gray-800">{item.name}</span>
//                                 </div>
//                                 <span className="text-xl font-bold text-black border-b-2 border-transparent group-hover:border-black transition-all duration-300">
//                                     {item.price}
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                     <div className="bg-gray-50 px-8 py-6 text-center text-sm text-gray-500 font-medium">
//                         * Prices are subject to change based on specific customer requirements and fabric complexities.
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default Pricing;
import React from 'react';
import { AiOutlineCheck } from 'react-icons/ai';
import { useGetPricing } from '../hooks/usePricing'; // <-- 1. Hook Import Kiya

const Pricing = () => {
    // Fetching From DB 
    const { data: pricingList = [], isLoading, isError } = useGetPricing();

    return (
        <section className="py-24 bg-white relative overflow-hidden" id="pricing">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-70"></div>
                <div className="absolute top-40 -left-20 w-72 h-72 bg-gray-100 rounded-full blur-3xl opacity-70"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-3">Tailoring Rates</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Pricing List</h3>
                    <div className="w-24 h-1 bg-black mx-auto"></div>
                </div>

                <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100 transform hover:-translate-y-1 transition-transform duration-500">
                    <div className="bg-black text-white px-8 py-6 flex justify-between items-center">
                        <h4 className="text-lg md:text-xl font-bold uppercase tracking-wider">Service Description</h4>
                        <h4 className="text-lg md:text-xl font-bold uppercase tracking-wider">Rate (Rs)</h4>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                        {/* Loading aur Error Status */}
                        {isLoading && (
                            <div className="px-8 py-10 text-center text-gray-500 font-medium">
                                Loading pricing details...
                            </div>
                        )}
                        
                        {isError && (
                            <div className="px-8 py-10 text-center text-red-500 font-medium">
                                Failed to load pricing. Please try again.
                            </div>
                        )}

                        {!isLoading && !isError && pricingList.length === 0 && (
                            <div className="px-8 py-10 text-center text-gray-400">
                                No pricing details available yet.
                            </div>
                        )}

                        {/* Maping on data */}
                        {!isLoading && !isError && pricingList.map((item) => (
                            <div 
                                key={item._id} // DB ki original ID
                                className="px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors duration-300 group"
                            >
                                <div className="flex items-center gap-4">
                                    <AiOutlineCheck className="text-lg text-black opacity-70 group-hover:text-green-600 transition-colors duration-300" />
                                    <div>
                                        {/* DB se aane wala Service Name */}
                                        <span className="text-lg font-medium text-gray-800 block">{item.serviceName}</span>
                                        {/* DB se aane wala description - halka sa neechay dikhaya hai design kharab kiye bina */}
                                        <span className="text-sm text-gray-500 hidden sm:block">{item.description}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {/* DB se minPrice aur maxPrice ka range */}
                                    <span className="text-xl font-bold text-black border-b-2 border-transparent group-hover:border-black transition-all duration-300 block">
                                        {item.minPrice} - {item.maxPrice}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">{item.deliveryTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-50 px-8 py-6 text-center text-sm text-gray-500 font-medium">
                        * Prices are subject to change based on specific customer requirements and fabric complexities.
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;