import React from 'react';

const pricingData = [
    { name: 'Shalwar Qameez (Simple)', price: '1200' },
    { name: 'Shalwar Qameez (Double Silai)', price: '1400' },
    { name: 'Shalwar Qameez (Extra Design)', price: '1600' },
    { name: 'Shirt', price: '1200' },
    { name: 'Kurta', price: '1200' }
];

const Pricing = () => {
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
                        {pricingData.map((item, index) => (
                            <div 
                                key={index} 
                                className="px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors duration-300 group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-black transition-colors duration-300"></span>
                                    <span className="text-lg font-medium text-gray-800">{item.name}</span>
                                </div>
                                <span className="text-xl font-bold text-black border-b-2 border-transparent group-hover:border-black transition-all duration-300">
                                    {item.price}
                                </span>
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
