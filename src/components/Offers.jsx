import React, { useState } from 'react';

const Offers = () => {
    const [selectedOffer, setSelectedOffer] = useState(null);

    const offers = [
        {
            id: 1,
            title: "Bespoke Shalwar Kameez",
            desc: "Experience the ultimate comfort and traditional elegance with our custom-tailored Shalwar Kameez, designed to fit your body and personality perfectly.",
            details: [
                "Premium fabrics including imported Egyptian cotton, wash-and-wear, and luxury blends.",
                "Custom collar styles (Sherwani, Ban, or classic collar).",
                "Hidden or visible plackets with matching or contrasting buttons.",
                "Precision tailoring to flatter your specific body type."
            ],
            img: "/images/shalwar-kameez.jpg"
        },
        {
            id: 2,
            title: "Elegant Kurta Collection",
            desc: "From casual daily wear to formal festive events, our expert tailors craft Kurtas that blend modern trends with timeless craftsmanship.",
            details: [
                "Hand-embroidered motifs and delicate thread work for festive occasions.",
                "Breathable, lightweight fabrics for casual, daily elegance.",
                "Modern cuts including straight, A-line, and asymmetrical hems.",
                "Personalized fitting to ensure maximum comfort and style."
            ],
            img: "/images/kurta.jpg"
        },
        {
            id: 3,
            title: "Custom Dress Shirts",
            desc: "Look sharp in every meeting. Get perfectly fitted formal and semi-formal dress shirts, customized with your choice of collars, cuffs, and premium fabrics.",
            details: [
                "Vast selection of premium cottons, linens, and wrinkle-free fabrics.",
                "Your choice of collar (Spread, Point, Button-down) and cuffs (French, Barrel).",
                "Monogramming options for that ultimate personalized touch.",
                "Perfected armholes and sleeve lengths to match your exact measurements."
            ],
            img: "/images/dress-shirt.jpg"
        }
    ];

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (selectedOffer) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedOffer]);

    return (
        <section className="py-24 bg-[#F9F9F9] relative">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-20">
                    <span className="text-[#D4AF37] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                        Our Expertise
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif">
                        What we offer our Clients
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#f4d160] mx-auto mt-8 rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {offers.map((offer) => (
                        <div key={offer.id} className="group bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)] transition-all duration-500 flex flex-col h-full border border-gray-100 hover:border-[#D4AF37]/30 hover:-translate-y-2">
                            <div className="relative h-80 overflow-hidden">
                                <img 
                                    src={offer.img} 
                                    alt={offer.title} 
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            
                            <div className="p-8 md:p-10 flex flex-col flex-grow relative bg-white">
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-[#D4AF37] transition-colors duration-300 font-serif">
                                    {offer.title}
                                </h3>
                                <p className="text-gray-600 mb-8 leading-relaxed flex-grow font-light">
                                    {offer.desc}
                                </p>
                                
                                <div className="mt-auto">
                                    <button 
                                        onClick={() => setSelectedOffer(offer)}
                                        className="inline-flex items-center text-gray-900 font-semibold uppercase text-sm tracking-widest hover:text-[#D4AF37] transition-colors group/link focus:outline-none cursor-pointer"
                                    >
                                        Learn More 
                                        <span className="ml-2 transform group-hover/link:translate-x-2 transition-transform duration-300 text-[#D4AF37]">
                                            &rarr;
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {selectedOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedOffer(null)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden z-10 max-h-[90vh] sm:max-h-[85vh] animate-[fadeIn_0.3s_ease-out]">
                        <button 
                            onClick={() => setSelectedOffer(null)}
                            className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white rounded-full p-2 text-gray-800 transition-colors shadow-sm"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        
                        <div className="md:w-1/2 h-48 sm:h-64 md:h-auto relative flex-shrink-0">
                            <img src={selectedOffer.img} alt={selectedOffer.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 hidden md:block"></div>
                        </div>
                        
                        <div className="md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col overflow-y-auto">
                            <span className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 block">
                                Service Details
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif mb-4 leading-tight">
                                {selectedOffer.title}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed font-light text-sm sm:text-base">
                                {selectedOffer.desc}
                            </p>
                            
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">What's Included:</h4>
                            <ul className="space-y-3 mb-8 flex-grow">
                                {selectedOffer.details.map((detail, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <svg className="w-5 h-5 text-[#D4AF37] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span className="text-gray-600 text-sm sm:text-base leading-relaxed">{detail}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-6 border-t border-gray-100">
                                {/* <button className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#e6c148] hover:from-[#b5952f] hover:to-[#d4af37] text-gray-900 font-bold py-3 sm:py-4 px-6 rounded-sm shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                                    Book Fitting
                                </button> */}
                                <button 
                                    onClick={() => setSelectedOffer(null)}
                                    className="flex-1 bg-white border border-gray-300 hover:border-gray-800 hover:text-gray-900 text-gray-600 font-bold py-3 sm:py-4 px-6 rounded-sm transition-all duration-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Offers;
